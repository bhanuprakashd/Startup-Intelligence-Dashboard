import { NextResponse } from "next/server";
import { getLiveFunding } from "@/services/rss";

export async function GET() {
  const funding = await getLiveFunding();

  return NextResponse.json({
    success: true,
    data: funding,
    meta: {
      source: "rss",
      refreshedAt: new Date().toISOString(),
      total: funding.length,
    },
  });
}
