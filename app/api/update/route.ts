import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import clientPromise from "@/lib/mongodb"; // MongoDB bağlantısı

// GET Method: Dosya listesini almak için
export async function GET() {
  try {
    // MongoDB'ye bağlan
    const client = await clientPromise;
    const db = client.db("fileLogDB");

    // Dosya listelerini al
    const files = await db.collection("fs.files").find({}).toArray();

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Dosya bulunamadı." },
        { status: 404 },
      );
    }

    // Dosya listesini döndür
    return NextResponse.json({ files });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Dosya listesi alınırken bir hata oluştu." },
      { status: 500 },
    );
  }
}

// PATCH Method: Dosya güncelleme işlemi
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { message: "Dosya ismi gerekli." },
        { status: 400 },
      );
    }

    // MongoDB'ye bağlan
    const client = await clientPromise;
    const db = client.db("fileLogDB");
    const bucket = new GridFSBucket(db, { bucketName: "fs" });
    const logsCollection = db.collection("logs");
    // 1. Mevcut dosyayı MongoDB'den sil
    const existingFile = await db.collection("fs.files").findOne({ filename });

    if (!existingFile) {
      return NextResponse.json(
        { message: "Dosya bulunamadı." },
        { status: 404 },
      );
    }

    // Mevcut dosyayı sil
    const deleteFileResult = await db
      .collection("fs.files")
      .deleteOne({ _id: existingFile._id });
    const deleteChunksResult = await db
      .collection("fs.chunks")
      .deleteMany({ files_id: existingFile._id });

    if (
      deleteFileResult.deletedCount === 0 ||
      deleteChunksResult.deletedCount === 0
    ) {
      return NextResponse.json(
        { message: "Eski dosya silinemedi." },
        { status: 500 },
      );
    }

    // 2. Yeni dosyayı MongoDB'ye yükle
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Dosya seçilmedi." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
    });

    uploadStream.write(buffer, (error) => {
      if (error) {
        console.error("Dosya yükleme hatası:", error);
        return NextResponse.json(
          { message: "Dosya yüklenirken bir hata oluştu." },
          { status: 500 },
        );
      }
      uploadStream.end();
    });
    await logsCollection.insertOne({
      serviceId: "update",
      detail: `Dosya '${filename}' güncellendi.`,
      datesTemp: new Date(),
    });
    return NextResponse.json({ message: "Dosya başarıyla güncellendi." });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Dosya güncellenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}
