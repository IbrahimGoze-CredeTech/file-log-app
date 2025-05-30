# Differential Backup Script
# Backup dizini oluştur
$BACKUP_DIR = ".\backup"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Tarih formatı
$TIMESTAMP = [int][double]::Parse((Get-Date -UFormat %s))

# MongoDB Tools'un tam yolu
$MONGODUMP = "C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe"

Write-Host "Differential backup başlatılıyor..."

# Son full backup konumunu ve zamanını kontrol et
if (-not (Test-Path "$BACKUP_DIR\last_full_backup.txt") -or -not (Test-Path "$BACKUP_DIR\last_full_backup_time.txt")) {
  Write-Host "Önce full backup almanız gerekiyor."
  exit 1
}

# Son full backup zamanını oku
$lastFullBackupTime = Get-Content -Path "$BACKUP_DIR\last_full_backup_time.txt"

# Saat dilimi farkını dikkate alarak tarihi ayarla
# MongoDB UTC kullanırken, yerel saat dilimini kullanıyoruz
$lastFullBackupDate = [DateTimeOffset]::FromUnixTimeSeconds([long]$lastFullBackupTime).UtcDateTime.AddHours(-3).ToString("yyyy-MM-ddTHH:mm:ss.000Z")

Write-Host "Son full backup zaman damgası: $lastFullBackupTime"
Write-Host "Son full backup tarihi (ISO, UTC-3): $lastFullBackupDate"

$startTime = Get-Date

# Differential backup dizini oluştur
$diffBackupPath = "$BACKUP_DIR\differential_$TIMESTAMP"
New-Item -ItemType Directory -Force -Path $diffBackupPath
New-Item -ItemType Directory -Force -Path "$diffBackupPath\fileLogDB"

# MongoDB'den son full backup'tan sonra eklenen dosyaları kontrol et
$checkCmd = "db.getSiblingDB('fileLogDB').fs.files.countDocuments({uploadDate:{`$gte:ISODate('$lastFullBackupDate')}})"
$newFilesCount = & mongosh --quiet --eval "$checkCmd"

if ($newFilesCount -gt 0) {
  Write-Host "Son full backup'tan sonra eklenen $newFilesCount dosya bulundu."
  
  # Yeni dosyaların ID'lerini al
  $getIdsCmd = "db.getSiblingDB('fileLogDB').fs.files.find({uploadDate:{`$gte:ISODate('$lastFullBackupDate')}}).toArray().map(doc => doc._id.toString())"
  $newFileIds = & mongosh --quiet --eval "$getIdsCmd" | ConvertFrom-Json
  
  # Doğrudan mongodump kullanarak yedekleme yap
  # Tarih filtresini kullanarak yedekleme
  $dateQuery = '{\"uploadDate\":{\"$gte\":{\"$date\":\"' + $lastFullBackupDate + '\"}}}'
  
  # fs.files koleksiyonunu yedekle
  & $MONGODUMP --uri="mongodb://localhost:27017" --db="fileLogDB" --collection="fs.files" --query="$dateQuery" --out="$diffBackupPath" --gzip
  
  # files koleksiyonunu yedekle
  & $MONGODUMP --uri="mongodb://localhost:27017" --db="fileLogDB" --collection="files" --query="$dateQuery" --out="$diffBackupPath" --gzip
  
  # logs koleksiyonunu yedekle
  $logsQuery = '{\"dateTemp\":{\"$gte\":{\"$date\":\"' + $lastFullBackupDate + '\"}}}'
  & $MONGODUMP --uri="mongodb://localhost:27017" --db="fileLogDB" --collection="logs" --query="$logsQuery" --out="$diffBackupPath" --gzip
  
  # fs.chunks koleksiyonu için doğrudan mongosh kullanarak yedekleme yap
  # MongoDB'nin $in operatörü için string array formatı
  $idsString = $newFileIds -join "','"
  
  # fs.chunks koleksiyonu için query
  $chunksQueryCmd = "db.getSiblingDB('fileLogDB').fs.chunks.find({files_id: {`$in: [ObjectId('$idsString')].map(id => ObjectId(id))}}).count()"
  $chunksCount = & mongosh --quiet --eval "$chunksQueryCmd"
  
  Write-Host "Yedeklenecek chunk sayısı: $chunksCount"
  
  # fs.chunks koleksiyonunu yedekle - doğrudan mongosh ile
  # Geçici bir JavaScript dosyası oluştur
  $tempJsFile = "$env:TEMP\mongo_chunks_query.js"
  
  $jsContent = @"
  const ids = ['$idsString'].map(id => ObjectId(id));
  const chunks = db.getSiblingDB('fileLogDB').fs.chunks.find({files_id: {`$in: ids}}).toArray();
  
  // Geçici koleksiyona aktar
  db.getSiblingDB('fileLogDB').temp_chunks.drop();
  if (chunks.length > 0) {
    db.getSiblingDB('fileLogDB').temp_chunks.insertMany(chunks);
    print("Inserted " + chunks.length + " chunks into temp collection");
  } else {
    print("No chunks found to backup");
  }
"@
  
  $jsContent | Out-File -FilePath $tempJsFile -Encoding utf8
  
  # JavaScript dosyasını çalıştır
  & mongosh --quiet --file="$tempJsFile"
  
  # Geçici koleksiyonu yedekle
  & $MONGODUMP --uri="mongodb://localhost:27017" --db="fileLogDB" --collection="temp_chunks" --out="$diffBackupPath\temp" --gzip
  
  # Dosyaları taşı ve geçici dosyaları temizle
  if (Test-Path "$diffBackupPath\temp\fileLogDB\temp_chunks.bson.gz") {
    Move-Item -Path "$diffBackupPath\temp\fileLogDB\temp_chunks.bson.gz" -Destination "$diffBackupPath\fileLogDB\fs.chunks.bson.gz" -Force
    Move-Item -Path "$diffBackupPath\temp\fileLogDB\temp_chunks.metadata.json.gz" -Destination "$diffBackupPath\fileLogDB\fs.chunks.metadata.json.gz" -Force
    Remove-Item -Path "$diffBackupPath\temp" -Recurse -Force
  }
  else {
    Write-Host "Yedeklenecek chunk bulunamadı veya yedekleme başarısız oldu."
  }
  
  # Geçici JavaScript dosyasını temizle
  Remove-Item -Path $tempJsFile -Force
  
  # Geçici koleksiyonu temizle
  & mongosh --quiet --eval "db.getSiblingDB('fileLogDB').temp_chunks.drop()"
}
else {
  Write-Host "Son full backup'tan sonra eklenen dosya bulunamadı, differential backup boş olacak."
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "Differential backup tamamlandı: $diffBackupPath"

# Performans ölçümü yap
node scripts/testBackupPerformance.js "$diffBackupPath" "differential" $duration

# Log dosyası oluştur
Add-Content -Path "$BACKUP_DIR\backup_log.txt" -Value "Differential backup completed at $TIMESTAMP" 