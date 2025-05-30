import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadLargePdfs() {
  const startTime = Date.now();
  const errors = [];
  const successful = [];

  // Her seferinde 1 dosya yükleyelim
  const totalFiles = 10;

  for (let i = 1; i <= totalFiles; i++) {
    const pdfPath = path.join(__dirname, `large_test_${i}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      console.error(`PDF ${i} bulunamadı: ${pdfPath}`);
      continue;
    }

    console.log(`\nDosya ${i} yükleniyor...`);
    const fileStats = fs.statSync(pdfPath);
    console.log(
      `Dosya boyutu: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`
    );

    const fileBuffer = fs.readFileSync(pdfPath);
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: `large_test_${i}.pdf`,
      contentType: "application/pdf",
    });

    try {
      const response = await axios.post(
        "http://localhost:3000/api/upload",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log(`Dosya ${i} başarıyla yüklendi`);
      successful.push(i);
    } catch (error) {
      console.error(
        `Dosya ${i} yüklenirken hata:`,
        error.response?.data || error.message
      );
      errors.push({
        index: i,
        error: error.response?.data || error.message,
      });
    }

    // Her yükleme arasında biraz bekleyelim
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log("\n=== ÖZET ===");
  console.log(`Toplam süre: ${duration} saniye`);
  console.log(`Başarılı yüklemeler: ${successful.length}`);
  console.log(`Hatalar: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nHata Detayları:");
    console.log(errors);
  }
}

console.log("Büyük PDF'lerin yüklemesi başlıyor...");
uploadLargePdfs().catch(console.error);
