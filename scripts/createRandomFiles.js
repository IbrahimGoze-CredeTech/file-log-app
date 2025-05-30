import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Hızlı bir şekilde rastgele içerikli dosya oluşturur
 * @param {number} index - Dosya indeksi
 * @param {string} prefix - Dosya adı öneki
 * @param {number} sizeMB - Dosya boyutu (MB)
 */
async function createRandomFile(index, prefix = "", sizeMB = 10) {
  const fileName = `${prefix}random_file_${index}.dat`;
  const filePath = path.join(__dirname, fileName);

  console.log(`${fileName} oluşturuluyor (${sizeMB}MB)...`);

  // Dosya stream'i oluştur
  const writeStream = fs.createWriteStream(filePath);

  // Dosya boyutu (byte)
  const fileSize = sizeMB * 1024 * 1024;
  const chunkSize = 1024 * 1024; // 1MB chunks

  let bytesWritten = 0;

  while (bytesWritten < fileSize) {
    // Kalan boyutu hesapla
    const remainingBytes = fileSize - bytesWritten;
    const currentChunkSize = Math.min(chunkSize, remainingBytes);

    // Rastgele veri oluştur
    const buffer = crypto.randomBytes(currentChunkSize);

    // Veriyi yaz
    writeStream.write(buffer);

    bytesWritten += currentChunkSize;

    // İlerleme göster (her 10MB'da bir)
    if (bytesWritten % (10 * 1024 * 1024) === 0) {
      console.log(
        `${fileName}: ${(bytesWritten / (1024 * 1024)).toFixed(
          0
        )}MB/${sizeMB}MB`
      );
    }
  }

  // Stream'i kapat
  writeStream.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`${fileName} oluşturuldu (${sizeMB}MB)`);
      resolve(filePath);
    });

    writeStream.on("error", (err) => {
      console.error(`Dosya oluşturma hatası: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Belirtilen sayıda ve boyutta rastgele dosya oluşturur
 * @param {number} totalFiles - Oluşturulacak toplam dosya sayısı
 * @param {number} fileSizeMB - Her dosyanın boyutu (MB)
 * @param {string} prefix - Dosya adı öneki
 */
async function generateRandomFiles(
  totalFiles = 80,
  fileSizeMB = 25,
  prefix = "differential_"
) {
  console.log(
    `${totalFiles} adet ${fileSizeMB}MB dosya oluşturuluyor (Toplam: ${
      totalFiles * fileSizeMB
    }MB)...`
  );

  const startTime = Date.now();
  const filePaths = [];

  for (let i = 1; i <= totalFiles; i++) {
    const filePath = await createRandomFile(i, prefix, fileSizeMB);
    filePaths.push(filePath);
    console.log(
      `İlerleme: ${i}/${totalFiles} (${Math.round((i / totalFiles) * 100)}%)`
    );
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\nToplam süre: ${duration.toFixed(2)} saniye`);
  console.log(
    `Ortalama hız: ${((totalFiles * fileSizeMB) / duration).toFixed(2)} MB/s`
  );

  return filePaths;
}

// Doğrudan çalıştırılıyorsa
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Rastgele dosyalar oluşturuluyor...");
  generateRandomFiles().catch(console.error);
}

export { generateRandomFiles, createRandomFile };
