import { createLargePdf } from "./createLargePdf.js";
import { bulkUpload } from "./bulkUpload.js";

async function generateTestSets() {
  const testSets = [
    { name: "medium", files: 70, size: 30 }, // ~2.1GB total
  ];

  for (const set of testSets) {
    console.log(
      `\nGenerating ${set.name} test set (${set.files} files, ${set.size}MB each)...`
    );
    const startTime = Date.now();

    // PDF'leri oluştur
    for (let i = 1; i <= set.files; i++) {
      await createLargePdf(i, `diff_${set.name}_`, set.size);
    }

    // MongoDB'ye yükle
    await bulkUpload(set.files, `diff_${set.name}_`);

    const duration = (Date.now() - startTime) / 1000;
    console.log(
      `${set.name} test set completed in ${duration.toFixed(2)} seconds`
    );
  }
}

console.log("Starting differential test data generation...");
generateTestSets().catch(console.error);
