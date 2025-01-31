import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

async function ensureBackupDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function measureBackupPerformance() {
  // Backup ana klasörünü oluştur
  const backupBaseDir = path.join(process.cwd(), "backup");
  await ensureBackupDir(backupBaseDir);

  const backupTypes = ["full", "differential"];
  const results = [];

  for (const type of backupTypes) {
    console.log(`\nTesting ${type} backup performance...`);

    const timestamp = Date.now();
    const backupDir = path.join(backupBaseDir, `${type}_${timestamp}`);

    // Her backup için ayrı klasör oluştur
    await ensureBackupDir(backupDir);

    const startTime = Date.now();

    try {
      // MongoDB Tools'un yolunu kontrol et
      const mongodumpPath =
        "C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe";

      // Dosyanın varlığını kontrol et
      try {
        await fs.access(mongodumpPath);
      } catch {
        throw new Error(`mongodump bulunamadı: ${mongodumpPath}`);
      }

      const command = `"${mongodumpPath}" --db fileLogDB --out "${backupDir}" --gzip`;
      console.log(`Executing command: ${command}`);

      const { stdout, stderr } = await execAsync(command);
      console.log("Command output:", stdout);
      if (stderr) console.error("Command stderr:", stderr);

      const duration = (Date.now() - startTime) / 1000;

      // Backup klasörünün boyutunu hesapla
      const backupSize = await getFolderSize(backupDir);

      results.push({
        type,
        backupSize,
        duration,
        speed: backupSize / (1024 * 1024) / duration, // MB/s
      });

      // Sonuçları yazdır
      console.log(`
        Backup Type: ${type}
        Backup Size: ${(backupSize / (1024 * 1024)).toFixed(2)} MB
        Duration: ${duration.toFixed(2)} seconds
        Speed: ${(backupSize / (1024 * 1024) / duration).toFixed(2)} MB/s
      `);
    } catch (error) {
      console.error(`Error during ${type} backup:`, error);
    }
  }

  // Sonuçları dosyaya kaydet
  const resultsPath = path.join(backupBaseDir, "performance_results.json");
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
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

console.log("Starting backup performance test...");
measureBackupPerformance().catch(console.error);
