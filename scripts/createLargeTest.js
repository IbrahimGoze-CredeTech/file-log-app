import fs from "fs";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB bağlantı bilgileri
const uri = "mongodb://localhost:27017";
const dbName = "fileLogDB";
const collectionName = "files";

/**
 * Belirtilen boyutta test dosyası oluşturur
 * @param {number} index Dosya indeksi
 * @param {number} sizeMB Dosya boyutu (MB)
 * @returns {string} Oluşturulan dosyanın yolu
 */
async function createTestFile(index, sizeMB = 10) {
  const fileName = `large_test_${index}.dat`;
  const filePath = path.join(__dirname, fileName);

  console.log(`${fileName} oluşturuluyor (${sizeMB}MB)...`);

  // Dosya boyutu (byte cinsinden)
  const fileSize = sizeMB * 1024 * 1024;

  // Dosyayı oluştur
  const fd = fs.openSync(filePath, "w");

  // 1MB'lık buffer oluştur
  const bufferSize = 1024 * 1024;
  const buffer = Buffer.alloc(bufferSize);

  // Buffer'ı rastgele verilerle doldur
  for (let i = 0; i < bufferSize; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }

  // Dosyayı istenen boyuta ulaşana kadar doldur
  let bytesWritten = 0;
  while (bytesWritten < fileSize) {
    const bytesToWrite = Math.min(bufferSize, fileSize - bytesWritten);
    fs.writeSync(fd, buffer, 0, bytesToWrite);
    bytesWritten += bytesToWrite;

    // İlerleme göstergesi (her 10MB'da bir)
    if (bytesWritten % (10 * 1024 * 1024) === 0) {
      console.log(
        `  ${fileName}: ${Math.round(
          bytesWritten / (1024 * 1024)
        )}MB yazıldı...`
      );
    }
  }

  fs.closeSync(fd);
  console.log(`${fileName} oluşturuldu (${sizeMB}MB)`);

  return filePath;
}

/**
 * Dosyayı MongoDB'ye yükler
 * @param {string} filePath Yüklenecek dosyanın yolu
 * @returns {string} Yüklenen dosyanın MongoDB ID'si
 */
async function uploadFileToMongoDB(filePath) {
  const fileName = path.basename(filePath);
  console.log(`${fileName} MongoDB'ye yükleniyor...`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("MongoDB'ye bağlandı");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Dosyayı oku
    const fileData = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;

    // MongoDB'ye yükle
    const result = await collection.insertOne({
      fileName: fileName,
      fileSize: fileSize,
      uploadDate: new Date(),
      data: fileData,
    });

    console.log(`Yüklendi: ${fileName} (ID: ${result.insertedId})`);
    return result.insertedId.toString();
  } finally {
    await client.close();
    console.log("MongoDB bağlantısı kapatıldı");
  }
}

/**
 * Test işlemini çalıştırır
 */
async function runLargeTest() {
  console.log("Büyük test başlatılıyor...");

  // Toplam 1GB veri oluşturmak için parametreler
  const fileSizeMB = 10; // Her dosya 10MB (MongoDB 16MB sınırının altında)
  const totalFiles = 100; // Toplam 100 dosya = 1GB

  const startTime = Date.now();
  const successful = [];
  const errors = [];

  // Dosyaları oluştur ve yükle
  for (let i = 1; i <= totalFiles; i++) {
    try {
      const filePath = await createTestFile(i, fileSizeMB);
      const fileId = await uploadFileToMongoDB(filePath);
      successful.push({ fileName: path.basename(filePath), fileId });

      // Dosyayı sil (disk alanından tasarruf için)
      fs.unlinkSync(filePath);
      console.log(`${path.basename(filePath)} silindi`);

      // Her 10 dosyada bir özet göster
      if (i % 10 === 0) {
        console.log(
          `\n--- İlerleme: ${i}/${totalFiles} dosya (${i * fileSizeMB}MB/${
            totalFiles * fileSizeMB
          }MB) ---\n`
        );
      }
    } catch (error) {
      console.error(`Hata: ${error.message}`);
      errors.push({ index: i, error: error.message });
    }
  }

  const duration = (Date.now() - startTime) / 1000;

  console.log("\n=== ÖZET ===");
  console.log(`Toplam süre: ${duration.toFixed(2)} saniye`);
  console.log(`Başarılı yüklemeler: ${successful.length}`);
  console.log(`Hatalar: ${errors.length}`);
  console.log(
    `Toplam yüklenen veri: ${(successful.length * fileSizeMB).toFixed(2)} MB`
  );

  if (errors.length > 0) {
    console.log("\nHata Detayları:");
    console.log(JSON.stringify(errors, null, 2));
  }

  console.log("Test tamamlandı!");
}

// Scripti çalıştır
console.log("Büyük test scripti başlatılıyor...");
runLargeTest().catch(console.error);
