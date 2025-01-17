# Backup dizini oluştur
$BACKUP_DIR = ".\backup"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Tarih formatı
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"

# MongoDB Tools'un tam yolu
$MONGODUMP = "C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe"

# Differential backup al
& $MONGODUMP `
  --uri="mongodb://localhost:27017" `
  --db=fileLogDB `
  --out="$BACKUP_DIR\diff_$DATE" `
  --gzip

# Log dosyası oluştur
Add-Content -Path "$BACKUP_DIR\backup_log.txt" -Value "Backup completed at $DATE" 