import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export const config = {
  api: {
    bodyParser: false, // Büyük dosyalar için body parser'ı devre dışı bırak
    responseLimit: false,
    maxDuration: 120, // 2 dakikaya çıkaralım
  },
};

export const POST = async (req: Request) => {
  try {
    const db = (await clientPromise).db();
    const bucket = new GridFSBucket(db, {
      chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunk size
    });

    // Bulk işlemler için index oluşturma
    await db.collection("files").createIndex({ filename: 1 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Dosya bulunamadı!" },
        { status: 400 }
      );
    }

    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
      metadata: { size: file.size },
    });

    const buffer = await file.arrayBuffer();
    uploadStream.end(Buffer.from(buffer));

    const logsCollection = db.collection("logs");
    await logsCollection.insertOne({
      serviceId: "file_upload",
      datesTemp: new Date(),
      labels: ["info"],
      detail: `Dosya ${file.name} başarıyla yüklendi.`,
    });

    return NextResponse.json({ message: "Dosya başarıyla yüklendi." });
  } catch (error: unknown) {
    const logsCollection = db.collection("logs");
    await logsCollection.insertOne({
      serviceId: "file_upload",
      datesTemp: new Date(),
      labels: ["error"],
      detail: `Dosya yüklenirken hata oluştu: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });

    return NextResponse.json(
      { message: "Dosya yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
};
