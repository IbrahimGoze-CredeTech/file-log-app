import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export const POST = async (req: Request) => {
  const client = await clientPromise;
  const db = client.db("fileLogDB");
  const bucket = new GridFSBucket(db);

  try {
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
  } catch (error) {
    const logsCollection = db.collection("logs");
    await logsCollection.insertOne({
      serviceId: "file_upload",
      datesTemp: new Date(),
      labels: ["error"],
      detail: `Dosya yüklenirken hata oluştu: ${error.message}`,
    });

    return NextResponse.json(
      { message: "Dosya yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
};
