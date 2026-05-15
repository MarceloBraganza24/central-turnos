import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const dbStatus = mongoose.connection.readyState === 1 ? "ok" : "error";

    return NextResponse.json({
      status: "ok",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error,
        status: "error",
        database: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}