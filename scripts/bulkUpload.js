import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function bulkUpload(totalFiles = 26, prefix = "differential_") {
  const startTime = Date.now();
  const errors = [];
  const successful = [];

  for (let i = 1; i <= totalFiles; i++) {
    const pdfPath = path.join(__dirname, `${prefix}large_test_${i}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      console.error(`PDF ${i} bulunamadı: ${pdfPath}`);
      continue;
    }

    console.log(`\nDosya ${i} yükleniyor...`);
    const fileStats = fs.statSync(pdfPath);
    console.log(
      `Dosya boyutu: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`
    );

    const formData = new FormData();
    formData.append("file", fs.createReadStream(pdfPath), {
      filename: `${prefix}large_test_${i}.pdf`,
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
          timeout: 300000, // 5 dakika
        }
      );

      console.log(
        `Dosya ${i} başarıyla yüklendi. FileId: ${response.data.fileId}`
      );
      successful.push(i);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error(`Dosya ${i} yüklenirken hata:`, errorMessage);
      errors.push({
        index: i,
        error: errorMessage,
      });
    }

    // Her dosya arasında 10 saniye bekleyelim
    if (i < totalFiles) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
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
}

// Eğer doğrudan çalıştırılıyorsa
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("PDF dosyaları MongoDB'ye yükleniyor...");
  bulkUpload().catch(console.error);
}
