import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basit bir test dosyası oluştur
async function createTestFile(index, sizeMB = 1) {
  const fileName = `test_file_${index}.dat`;
  const filePath = path.join(__dirname, fileName);

  console.log(`${fileName} oluşturuluyor (${sizeMB}MB)...`);

  // Dosya boyutu (byte)
  const fileSize = sizeMB * 1024 * 1024;

  // Rastgele veri oluştur
  const buffer = crypto.randomBytes(fileSize);

  // Dosyayı yaz
  fs.writeFileSync(filePath, buffer);

  console.log(`${fileName} oluşturuldu (${sizeMB}MB)`);

  return filePath;
}

// Dosyayı MongoDB'ye yükle
async function uploadFileToMongoDB(filePath) {
  const fileName = path.basename(filePath);
  console.log(`${fileName} MongoDB'ye yükleniyor...`);

  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("MongoDB'ye bağlandı");

    const db = client.db("fileLogDB");
    const collection = db.collection("files");

    // Dosyayı oku
    const fileData = fs.readFileSync(filePath);

    // MongoDB'ye yükle
    const result = await collection.insertOne({
      fileName,
      fileSize: fileData.length,
      uploadDate: new Date(),
      data: fileData,
    });

    console.log(`Yüklendi: ${fileName} (ID: ${result.insertedId})`);

    return result.insertedId;
  } finally {
    await client.close();
    console.log("MongoDB bağlantısı kapatıldı");
  }
}

// Ana fonksiyon
async function runTest() {
  try {
    console.log("Basit test başlatılıyor...");

    // 10 adet 5MB dosya oluştur (toplam 50MB) - Differential backup için
    const files = [];
    for (let i = 1; i <= 10; i++) {
      const filePath = await createTestFile(i, 5);
      files.push(filePath);
    }

    // Dosyaları MongoDB'ye yükle
    for (const filePath of files) {
      await uploadFileToMongoDB(filePath);
    }

    console.log("Test tamamlandı!");
  } catch (error) {
    console.error("Test hatası:", error);
  }
}

// Scripti çalıştır
console.log("Basit test scripti başlatılıyor...");
runTest().catch(console.error);
