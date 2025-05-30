import { MongoClient, GridFSBucket } from "mongodb";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { createWriteStream } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES Module için __dirname oluştur
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("GridFS differential test scripti başlatılıyor...");

// Test dosyası oluştur
async function createTestFile(fileName, sizeInMB) {
  const filePath = path.join(__dirname, fileName);
  const fileSize = sizeInMB * 1024 * 1024; // MB to bytes
  const chunkSize = 1024 * 1024; // 1 MB chunks
  const writeStream = createWriteStream(filePath);

  console.log(`Creating ${fileName} (${sizeInMB} MB)...`);
  console.log(`${fileName}: %0 tamamlandı`);

  let bytesWritten = 0;
  let lastReportedProgress = 0;

  const buffer = Buffer.alloc(chunkSize);

  while (bytesWritten < fileSize) {
    // Rastgele veri oluştur
    for (let i = 0; i < chunkSize; i += 4) {
      buffer.writeUInt32LE(Math.floor(Math.random() * 0xffffffff), i);
    }

    const bytesToWrite = Math.min(chunkSize, fileSize - bytesWritten);
    writeStream.write(buffer.slice(0, bytesToWrite));
    bytesWritten += bytesToWrite;

    // İlerleme durumunu raporla
    const progress = Math.floor((bytesWritten / fileSize) * 100);
    if (progress >= lastReportedProgress + 10) {
      lastReportedProgress = Math.floor(progress / 10) * 10;
      console.log(`${fileName}: %${lastReportedProgress} tamamlandı`);
    }
  }

  return new Promise((resolve, reject) => {
    writeStream.end(() => {
      console.log(`${fileName} oluşturuldu.`);
      resolve(filePath);
    });
    writeStream.on("error", reject);
  });
}

// GridFS'e dosya yükle
async function uploadFileToGridFS(filePath, fileName, client) {
  console.log(`${fileName} GridFS'e yükleniyor...`);

  try {
    const db = client.db("fileLogDB");
    const bucket = new GridFSBucket(db);

    const uploadStream = bucket.openUploadStream(fileName);
    const readStream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      pipeline(readStream, uploadStream, (err) => {
        if (err) {
          console.error(`${fileName} yüklenirken hata: ${err.message}`);
          reject(err);
        } else {
          console.log(`${fileName} başarıyla yüklendi. ID: ${uploadStream.id}`);
          resolve(uploadStream.id);
        }
      });
    });
  } catch (err) {
    console.error(`GridFS yükleme hatası: ${err.message}`);
    throw err;
  }
}

// Test işlemini çalıştır
async function runGridFSTest() {
  console.log("GridFS differential test başlıyor...");

  const client = new MongoClient("mongodb://localhost:27017");
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  let totalDataUploaded = 0;

  try {
    await client.connect();

    // 5 adet 200 MB'lık dosya oluştur ve yükle (toplam 1 GB)
    const fileCount = 5;
    const fileSizeMB = 200;

    for (let i = 1; i <= fileCount; i++) {
      const fileName = `large_diff_test_${i}.dat`;
      try {
        const filePath = await createTestFile(fileName, fileSizeMB);
        await uploadFileToGridFS(filePath, fileName, client);
        totalDataUploaded += fileSizeMB;
        successCount++;

        // Dosyayı sil
        fs.unlinkSync(filePath);
        console.log(`${fileName} silindi.`);
      } catch (err) {
        console.error(`Dosya ${i} işlenirken hata: ${err.message}`);
        errorCount++;
      }
    }
  } catch (err) {
    console.error(`Test hatası: ${err.message}`);
  } finally {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\nGridFS Test Sonuçları:");
    console.log(`Toplam süre: ${duration.toFixed(2)} saniye`);
    console.log(`Başarılı yüklemeler: ${successCount}`);
    console.log(`Hatalar: ${errorCount}`);
    console.log(
      `Toplam yüklenen veri: ${(totalDataUploaded / 1024).toFixed(2)} GB`
    );
    console.log("Test tamamlandı.");

    await client.close();
  }
}

// Testi çalıştır
runGridFSTest().catch(console.error);
