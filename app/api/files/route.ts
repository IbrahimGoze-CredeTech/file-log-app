import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("fileLogDB");
    const logsCollection = db.collection("fs.files");

    const logs = await logsCollection.find({}).toArray();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { message: "Dosyalar alınamadı." },
      { status: 500 }
    );
  }
}
