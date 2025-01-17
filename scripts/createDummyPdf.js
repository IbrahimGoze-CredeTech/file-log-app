import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createDummyPdf() {
  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, "test.pdf");

  doc.pipe(fs.createWriteStream(outputPath));

  // Basit içerik ekleyelim
  doc.fontSize(25).text("Test PDF Dosyası", 100, 100);
  doc.fontSize(12).text("Bu bir test PDF dosyasıdır.", 100, 150);
  doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString()}`, 100, 170);

  doc.end();
  console.log("Test PDF dosyası oluşturuldu:", outputPath);
}

createDummyPdf();
