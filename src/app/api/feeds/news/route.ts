import { NextResponse } from "next/server";
import { getLiveNews } from "@/services/newsdata";

export async function GET() {
  const news = await getLiveNews();

  return NextResponse.json({
    success: true,
    data: news,
    meta: {
      source: "newsdata",
      refreshedAt: new Date().toISOString(),
      total: news.length,
    },
  });
}
