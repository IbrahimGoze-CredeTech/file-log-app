#!/bin/bash

# Backup dizini oluştur
BACKUP_DIR="./backup"
mkdir -p $BACKUP_DIR

# Tarih formatı
DATE=$(date +%Y%m%d_%H%M%S)

# Differential backup al
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=fileLogDB \
  --out="$BACKUP_DIR/diff_$DATE" \
  --gzip

# Log dosyası oluştur
echo "Backup completed at $DATE" >> "$BACKUP_DIR/backup_log.txt" 