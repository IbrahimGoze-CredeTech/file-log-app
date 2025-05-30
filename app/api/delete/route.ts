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
    const logsCollection = db.collection("logs");
    const existingFile = await db.collection("fs.files").findOne({ filename });

    if (!existingFile) {
      return NextResponse.json(
        { message: "Dosya bulunamadı." },
        { status: 404 }
      );
    }

    // Dosyanın chunks'larını sil
    const deleteChunksResult = await db
      .collection("fs.chunks")
      .deleteMany({ files_id: existingFile._id });

    // Dosyanın metadata'sını (fs.files) sil
    const deleteFileResult = await db
      .collection("fs.files")
      .deleteOne({ _id: existingFile._id });

    if (
      deleteFileResult.deletedCount === 0 ||
      deleteChunksResult.deletedCount === 0
    ) {
      return NextResponse.json(
        { message: "Dosya silinemedi." },
        { status: 500 }
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
