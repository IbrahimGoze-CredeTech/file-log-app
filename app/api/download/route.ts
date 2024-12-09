import { NextResponse } from "next/server";
import { MongoClient, GridFSBucket } from "mongodb";
import clientPromise from "@/lib/mongodb"; // MongoDB bağlantısı

// Dosya indirme
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { message: "Dosya ismi gerekli." },
        { status: 400 }
      );
    }

    // MongoDB'ye bağlan
    const client = await clientPromise;
    const db = client.db("fileLogDB");
    const bucket = new GridFSBucket(db, { bucketName: "fs" });

    // Dosyayı GridFS'ten al
    const file = await db.collection("fs.files").findOne({ filename });

    if (!file) {
      return NextResponse.json(
        { message: "Dosya bulunamadı." },
        { status: 404 }
      );
    }

    // Dosyayı stream olarak al
    const downloadStream = bucket.openDownloadStream(file._id);

    // Stream'i Response ile uyumlu hale getirme
    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => {
          controller.enqueue(chunk); // Stream'den gelen veriyi controller'a ekle
        });

        downloadStream.on("end", () => {
          controller.close(); // Stream sonlandığında controller'ı kapat
        });

        downloadStream.on("error", (err) => {
          controller.error(err); // Hata olursa controller'a hata gönder
        });
      },
    });

    // Başlıkları ayarla
    const headers = new Headers();
    headers.set("Content-Type", file.contentType);
    // Dosya adını URL encode et
    const encodedFilename = encodeURIComponent(filename);
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`
    );

    // Response nesnesini döndür
    const response = new Response(readableStream, {
      status: 200,
      headers,
    });

    return response;
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Dosya indirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
