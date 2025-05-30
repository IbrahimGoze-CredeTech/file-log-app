import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("fileLogDB");

    // Delete all files and their chunks
    await db.collection("fs.chunks").deleteMany({});
    await db.collection("fs.files").deleteMany({});

    // Log the deletion
    const logsCollection = db.collection("logs");
    await logsCollection.insertOne({
      serviceId: "delete_all",
      detail: "Tüm dosyalar silindi.",
      datesTemp: new Date(),
    });

    return NextResponse.json({ message: "Tüm dosyalar başarıyla silindi." });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Tüm dosyalar silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
