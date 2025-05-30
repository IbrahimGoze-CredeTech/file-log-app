import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import clientPromise from "@/lib/mongodb"; // MongoDB bağlantı modülü

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const preview = searchParams.get("preview") === "true"; // Önizleme parametresi

    if (!filename) {
      return NextResponse.json(
        { message: "Dosya adı gerekli." },
        { status: 400 },
      );
    }

    // MongoDB bağlantısı
    const client = await clientPromise;
    const db = client.db("fileLogDB");
    const bucket = new GridFSBucket(db, { bucketName: "fs" });

    // Dosyayı GridFS'ten al
    const file = await db.collection("fs.files").findOne({ filename });

    if (!file) {
      return NextResponse.json(
        { message: "Dosya bulunamadı." },
        { status: 404 },
      );
    }

    // Dosyayı stream olarak al
    const downloadStream = bucket.openDownloadStream(file._id);

    // Stream'i Response ile uyumlu hale getirme
    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => {
          controller.enqueue(chunk); // Stream'den gelen veriyi ekle
        });

        downloadStream.on("end", () => {
          controller.close(); // Stream sonlandığında kapat
        });

        downloadStream.on("error", (err) => {
          controller.error(err); // Hata durumunda bildir
        });
      },
    });

    // Response başlıklarını ayarla
    const headers = new Headers();
    headers.set("Content-Type", file.contentType);

    // "Önizleme" mi yoksa "İndirme" mi kontrol et
    if (preview) {
      headers.set(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(filename)}"`,
      ); // Önizleme
    } else {
      // Türkçe karakterler için UTF-8 desteği sağlayarak başlık ayarlama
      const encodedFilename = encodeURIComponent(filename);
      headers.set(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodedFilename}`, // İndirme
      );
    }

    // Log kaydı ekle
    const logsCollection = db.collection("logs");
    await logsCollection.insertOne({
      serviceId: preview ? "preview" : "download",
      detail: `Dosya '${filename}' ${preview ? "önizlendi" : "indirildi"}.`,
      timestamp: new Date(),
    });

    // Response'u döndür
    return new Response(readableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ message: "Bir hata oluştu." }, { status: 500 });
  }
}
