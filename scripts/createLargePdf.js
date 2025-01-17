import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createLargePdf(index) {
  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, `large_test_${index}.pdf`);
  const writeStream = fs.createWriteStream(outputPath);

  doc.pipe(writeStream);

  // Increase the number of pages and content to reach approximately 30MB
  for (let i = 0; i < 300; i++) {
    // Adjust the number of pages
    if (i > 0) doc.addPage();

    // Add large text blocks
    doc.fontSize(16);
    for (let j = 0; j < 100; j++) {
      // Increase the number of paragraphs
      doc.text(`Large PDF Test Page ${i + 1}, Paragraph ${j + 1}\n`.repeat(20));
    }

    // Add large colored rectangles to increase file size
    for (let k = 0; k < 5; k++) {
      doc
        .rect(k * 100, k * 100, 400, 400)
        .fill(
          `rgb(${Math.random() * 255},${Math.random() * 255},${
            Math.random() * 255
          })`
        );
    }
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
    await createLargePdf(i);
  }
  console.log("All PDFs created.");
}

createMultiplePdfs().catch(console.error);
