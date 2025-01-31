import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateRandomText(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function addComplexGraphics(doc, x, y) {
  // Add complex graphics to the document at the specified position
  // This function is not implemented in the provided code
}

async function createLargePdf(index, targetSizeMB) {
  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, `large_test_${index}.pdf`);
  const writeStream = fs.createWriteStream(outputPath);

  doc.pipe(writeStream);

  const pagesNeeded = Math.ceil(
    (targetSizeMB * 1024 * 1024) / (1 * 1024 * 1024)
  );
  const randomText = generateRandomText(100000);

  console.log(`PDF ${index} için ${pagesNeeded} sayfa oluşturuluyor...`);

  for (let i = 0; i < pagesNeeded; i++) {
    doc.addPage({
      size: [2000, 2800],
      margin: 0,
    });

    // Sayfayı doldur
    doc.fontSize(8);

    // Sayfa başına renkli arka plan
    doc
      .rect(0, 0, 2000, 2800)
      .fill(
        `rgb(${Math.random() * 255},${Math.random() * 255},${
          Math.random() * 255
        })`
      );

    // Her sayfaya 1000 paragraf ekle (2 katına çıkardık)
    for (let j = 0; j < 1000; j++) {
      const x = (j % 4) * 500;
      const y = (j % 28) * 100;

      // Metin ekle
      doc.text(randomText, x, y, {
        width: 480,
        align: "justify",
        lineBreak: true,
      });

      // Her 5 paragrafta bir karmaşık grafikler ekle (sıklığı artırdık)
      if (j % 5 === 0) {
        addComplexGraphics(doc, x, y);
      }
    }

    // Sayfanın altına ve ortasına ekstra grafikler
    addComplexGraphics(doc, 0, 1400);
    addComplexGraphics(doc, 1000, 1400);
    addComplexGraphics(doc, 0, 2100);
    addComplexGraphics(doc, 1000, 2100);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      const stats = fs.statSync(outputPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      console.log(`PDF ${index} created. Size: ${fileSizeInMB.toFixed(2)} MB`);
      resolve(outputPath);
    });
    writeStream.on("error", reject);
  });
}

async function createMultiplePdfs() {
  console.log("Creating 30MB PDFs...");
  const totalFiles = 10;

  for (let i = 1; i <= totalFiles; i++) {
    await createLargePdf(i, 30);
  }
  console.log("All PDFs created.");
}

createMultiplePdfs().catch(console.error);
