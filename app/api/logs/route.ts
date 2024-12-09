import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const GET = async () => {
  const client = await clientPromise;
  const db = client.db("fileLogDB");
  const logsCollection = db.collection("logs");

  const logs = await logsCollection.find({}).sort({ timestamp: -1 }).toArray();
  return NextResponse.json(logs);
};
