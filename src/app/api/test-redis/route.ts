import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  await redis.set("test", "central-turnos");

  const value = await redis.get("test");

  return NextResponse.json({
    success: true,
    value,
  });
}