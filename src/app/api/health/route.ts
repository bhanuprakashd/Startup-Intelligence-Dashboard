import { NextResponse } from "next/server";
import { getAllSourceHealth } from "@/services/source-health";

export async function GET() {
  const health = await getAllSourceHealth();
  const sources = Object.values(health);
  const upCount = sources.filter((s) => s.status === "up").length;

  return NextResponse.json({
    success: true,
    data: {
      sources: health,
      summary: { total: sources.length, up: upCount, down: sources.length - upCount },
    },
    meta: { refreshedAt: new Date().toISOString() },
  });
}
