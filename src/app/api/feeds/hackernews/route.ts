import { NextResponse } from "next/server";
import { getHNStories } from "@/services/hackernews";

export async function GET() {
  const stories = await getHNStories();

  return NextResponse.json({
    success: true,
    data: stories,
    meta: {
      source: "hackernews",
      refreshedAt: new Date().toISOString(),
      total: stories.length,
    },
  });
}
