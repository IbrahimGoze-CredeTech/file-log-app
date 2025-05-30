import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { generateRandomFiles } from "./createRandomFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Oluşturulan rastgele dosyaları MongoDB'ye yükler
 * @param {Array<string>} filePaths - Yüklenecek dosya yolları
 */
async function uploadFilesToMongoDB(filePaths) {
  console.log(`${filePaths.length} dosya MongoDB'ye yükleniyor...`);

  const startTime = Date.now();
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("MongoDB'ye bağlandı");

    const db = client.db("fileLogDB");
    const collection = db.collection("files");

    const successful = [];
    const errors = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const fileName = path.basename(filePath);

      try {
        console.log(
          `Dosya yükleniyor (${i + 1}/${filePaths.length}): ${fileName}`
        );

        // Dosyayı oku
        const fileData = fs.readFileSync(filePath);

        // MongoDB'ye yükle
        const result = await collection.insertOne({
          fileName,
          fileSize: fileData.length,
          uploadDate: new Date(),
          data: fileData,
        });

        successful.push({
          fileName,
          fileId: result.insertedId.toString(),
        });

        console.log(`Yüklendi: ${fileName} (ID: ${result.insertedId})`);
      } catch (error) {
        console.error(`Yükleme hatası (${fileName}):`, error.message);
        errors.push({
          fileName,
          error: error.message,
        });
      }
    }

    const duration = (Date.now() - startTime) / 1000;

    console.log("\n=== ÖZET ===");
    console.log(`Toplam süre: ${duration.toFixed(2)} saniye`);
    console.log(`Başarılı yüklemeler: ${successful.length}`);
    console.log(`Hatalar: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\nHata Detayları:");
      console.log(JSON.stringify(errors, null, 2));
    }

    return { successful, errors, duration };
  } finally {
    await client.close();
    console.log("MongoDB bağlantısı kapatıldı");
  }
}

/**
 * Rastgele dosyalar oluşturur ve MongoDB'ye yükler
 */
async function generateAndUploadFiles() {
  try {
    // Rastgele dosyaları oluştur
    console.log("Rastgele dosyalar oluşturuluyor...");
    const filePaths = await generateRandomFiles(80, 25, "differential_");

    // Dosyaları MongoDB'ye yükle
    console.log("\nDosyalar MongoDB'ye yükleniyor...");
    await uploadFilesToMongoDB(filePaths);

    console.log("\nİşlem tamamlandı!");
  } catch (error) {
    console.error("Hata:", error);
  }
}

// Doğrudan çalıştırılıyorsa
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Rastgele dosyalar oluşturuluyor ve MongoDB'ye yükleniyor...");
  generateAndUploadFiles().catch(console.error);
}

export { generateAndUploadFiles, uploadFilesToMongoDB };
