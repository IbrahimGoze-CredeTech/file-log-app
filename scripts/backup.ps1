# Ana Backup Script
# Komut satırı parametrelerini kontrol et
$backupType = $args[0]

if ($backupType -eq "full" -or $null -eq $backupType) {
  Write-Host "Full backup başlatılıyor..."
  & powershell -File scripts/fullBackup.ps1
}
elseif ($backupType -eq "diff") {
  Write-Host "Differential backup başlatılıyor..."
  & powershell -File scripts/diffBackup.ps1
}
else {
  Write-Host "Geçersiz backup tipi. 'full' veya 'diff' kullanın."
  exit 1
}