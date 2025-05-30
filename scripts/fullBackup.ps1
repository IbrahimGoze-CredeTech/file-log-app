# Full Backup Script
# Backup dizini oluştur
$BACKUP_DIR = ".\backup"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Tarih formatı
$TIMESTAMP = [int][double]::Parse((Get-Date -UFormat %s))

# MongoDB Tools'un tam yolu
$MONGODUMP = "C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe"

Write-Host "Full backup başlatılıyor..."
$startTime = Get-Date
  
# Full backup al
& $MONGODUMP `
  --uri="mongodb://localhost:27017" `
  --db=fileLogDB `
  --out="$BACKUP_DIR\full_$TIMESTAMP" `
  --gzip
  
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds
  
# Son full backup konumunu ve zamanını kaydet
$fullBackupPath = "$BACKUP_DIR\full_$TIMESTAMP"
Set-Content -Path "$BACKUP_DIR\last_full_backup.txt" -Value $fullBackupPath
Set-Content -Path "$BACKUP_DIR\last_full_backup_time.txt" -Value $TIMESTAMP
  
Write-Host "Full backup tamamlandı: $fullBackupPath"
Write-Host "Full backup zaman damgası: $TIMESTAMP"
  
# Performans ölçümü yap
node scripts/testBackupPerformance.js "$fullBackupPath" "full" $duration

# Log dosyası oluştur
Add-Content -Path "$BACKUP_DIR\backup_log.txt" -Value "Full backup completed at $TIMESTAMP" 