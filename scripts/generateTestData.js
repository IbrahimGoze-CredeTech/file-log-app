import { createLargePdf } from "./createLargePdf.js";
import { bulkUpload } from "./bulkUpload.js";

async function generateTestSets() {
  const testSets = [
    { name: "differential_test", files: 80, size: 25 }, // 2GB total
  ];

  // Sadece differential_test test setini çalıştır
  const setToRun = testSets.find((set) => set.name === "differential_test");

  console.log(
    `\nGenerating ${setToRun.name} test set (${setToRun.files} files, ${setToRun.size}MB each)...`
  );
  const startTime = Date.now();

  // PDF'leri oluştur
  for (let i = 1; i <= setToRun.files; i++) {
    await createLargePdf(i, `${setToRun.name}_`, setToRun.size);
    console.log(`PDF ${i}/${setToRun.files} oluşturuldu.`);
  }

  // MongoDB'ye yükle
  await bulkUpload(setToRun.files, `${setToRun.name}_`);

  const duration = (Date.now() - startTime) / 1000;
  console.log(
    `${setToRun.name} test set completed in ${duration.toFixed(2)} seconds`
  );
}

console.log("Starting test data generation...");
generateTestSets().catch(console.error);

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log("Creating 100MB PDFs...");
    const totalFiles = 20; // 20 dosya
    const fileSizeMB = 100; // Her biri 100MB

    for (let i = 1; i <= totalFiles; i++) {
      await createLargePdf(i, "", fileSizeMB);
    }
    console.log("All PDFs created.");
  })().catch(console.error);
}
