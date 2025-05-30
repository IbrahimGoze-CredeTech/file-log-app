import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket, Db } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  let db: Db | undefined;
  try {
    const client = await clientPromise;
    db = client.db();
    const bucket = new GridFSBucket(db, {
      chunkSizeBytes: 1024 * 1024, // 1MB chunks
    });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı!" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    return new Promise((resolve) => {
      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
        metadata: { size: file.size },
      });

      uploadStream.on("error", (error) => {
        console.error("Upload error:", error);
        resolve(
          NextResponse.json(
            { error: `Yükleme hatası: ${error.message}` },
            { status: 500 },
          ),
        );
      });

      uploadStream.on("finish", () => {
        console.log(`Dosya yüklendi: ${file.name}`);
        resolve(
          NextResponse.json({
            message: "Dosya başarıyla yüklendi",
            fileId: uploadStream.id.toString(),
          }),
        );
      });

      uploadStream.write(Buffer.from(buffer));
      uploadStream.end();
    });
  } catch (error: unknown) {
    console.error("API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    return NextResponse.json(
      { error: `API Hatası: ${errorMessage}` },
      { status: 500 },
    );
  }
}
