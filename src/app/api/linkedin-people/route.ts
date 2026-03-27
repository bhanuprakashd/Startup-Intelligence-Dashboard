import { searchPeople, type PersonProfile } from "@/services/linkedin-people";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 300;

export interface PeopleResult {
  readonly name: string;
  readonly profiles: PersonProfile[];
  readonly aiInsights: string;
}

export async function POST(req: Request) {
  // Inbound rate limit: 10 requests per 60s per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { success, remaining, reset } = await checkRateLimit(ip);

  if (!success) {
    return Response.json(
      {
        success: false,
        error: `Rate limit exceeded. Try again after ${new Date(reset * 1000).toISOString()}.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(reset - Math.floor(Date.now() / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return Response.json(
      { success: false, error: "Name must be at least 2 characters" },
      { status: 400 }
    );
  }

  let profiles: PersonProfile[] = [];
  let aiInsights = "";

  try {
    profiles = await searchPeople(name.trim());
    aiInsights =
      profiles.length === 0
        ? "No profiles found in AI knowledge base. This person may not be a widely-known public figure. Use the LinkedIn search link below to find them directly."
        : `Found ${profiles.length} profile${profiles.length !== 1 ? "s" : ""} matching "${name.trim()}". ${profiles[0]?.headline ? `Top match: ${profiles[0].name} — ${profiles[0].headline}.` : ""}`;
  } catch (err) {
    console.error("[linkedin-people] searchPeople failed:", err instanceof Error ? err.message : err);
    aiInsights = "AI search unavailable. Use the LinkedIn search link below to find this person directly.";
  }


  return Response.json(
    {
      success: true,
      data: {
        name: name.trim(),
        profiles,
        aiInsights,
      },
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}
