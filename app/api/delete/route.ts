import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(request: Request) {
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
    const filesCollection = db.collection("fs.files");
    const logsCollection = db.collection("logs");
    // Dosyayı filename alanına göre sil
    const result = await filesCollection.deleteOne({ filename });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Silinecek dosya bulunamadı." },
        { status: 404 }
      );
    }
    await logsCollection.insertOne({
      serviceId: "delete",
      detail: `Dosya '${filename}' silindi.`,
      datesTemp: new Date(),
    });
    return NextResponse.json({ message: "Dosya başarıyla silindi." });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Dosya silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
