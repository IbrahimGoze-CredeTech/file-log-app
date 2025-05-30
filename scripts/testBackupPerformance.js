import fs from "fs/promises";
import path from "path";

async function measureBackupPerformance(backupPath, backupType, duration) {
  try {
    console.log(`\nTesting ${backupType} backup performance...`);

    // Backup klasörünün boyutunu hesapla
    const backupSize = await getFolderSize(backupPath);

    // Sonuçları hesapla
    const speed = backupSize / (1024 * 1024) / duration; // MB/s

    // Sonuçları yazdır
    console.log(`
      Backup Type: ${backupType}
      Backup Path: ${backupPath}
      Backup Size: ${(backupSize / (1024 * 1024)).toFixed(2)} MB
      Duration: ${duration.toFixed(2)} seconds
      Speed: ${speed.toFixed(2)} MB/s
    `);

    // Sonuçları dosyaya kaydet
    const backupBaseDir = path.join(process.cwd(), "backup");
    const resultsPath = path.join(backupBaseDir, "performance_results.json");

    // Mevcut sonuçları oku veya yeni bir dizi oluştur
    let results = [];
    try {
      const existingData = await fs.readFile(resultsPath, "utf8");
      results = JSON.parse(existingData);
    } catch {
      // Dosya yoksa veya okunamazsa, yeni bir dizi oluştur
      results = [];
    }

    // Yeni sonucu ekle
    results.push({
      type: backupType,
      path: backupPath,
      backupSize,
      duration,
      speed,
      timestamp: new Date().toISOString(),
    });

    // Sonuçları dosyaya yaz
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${resultsPath}`);
  } catch (error) {
    console.error(`Error during performance measurement:`, error);
  }
}

async function getFolderSize(folderPath) {
  let totalSize = 0;
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await getFolderSize(filePath);
      }
    }
  } catch (error) {
    console.error(`Error calculating folder size for ${folderPath}:`, error);
  }
  return totalSize;
}

// Ana fonksiyon
async function main() {
  try {
    // Komut satırı parametrelerini al
    const args = process.argv.slice(2);
    const backupPath = args[0];
    const backupType = args[1];
    const duration = parseFloat(args[2] || 0);

    if (!backupPath) {
      throw new Error("Backup path is required");
    }

    if (!backupType) {
      throw new Error("Backup type is required");
    }

    console.log(
      `Starting backup performance test for ${backupType} backup at ${backupPath}...`
    );
    await measureBackupPerformance(backupPath, backupType, duration);
  } catch (error) {
    console.error("Error in performance test:", error);
  }
}

// Programı çalıştır
main().catch(console.error);
