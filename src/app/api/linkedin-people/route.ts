import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { searchPeople, type PersonProfile } from "@/services/linkedin-people";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 300;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

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

  const profiles = await searchPeople(name.trim());

  if (profiles.length === 0) {
    return Response.json({
      success: true,
      data: {
        name: name.trim(),
        profiles: [],
        aiInsights:
          "No LinkedIn profiles found for this name. Try the full name (first + last) or check the spelling.",
      },
    });
  }

  const profileSummary = profiles
    .map(
      (p) =>
        `- ${p.name} | ${p.headline || "No headline"} | ${p.location || "Location unknown"} | ${p.profileUrl}`
    )
    .join("\n");

  let aiInsights = "AI analysis unavailable.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a startup intelligence analyst. Analyze these LinkedIn profiles found for the name "${name.trim()}":

${profileSummary}

Provide a brief analysis:
1. **Most Likely Match** — Which profile is most likely the person being searched? Why?
2. **Professional Summary** — What do these profiles tell us about the person(s)?
3. **Industry & Expertise** — What industry/domain are they in? Key skills or focus areas?
4. **Notable Signals** — Any interesting signals (career trajectory, company affiliations, seniority level)?

Be concise. Base everything on the profiles above.`,
      maxOutputTokens: 600,
    });
    aiInsights = text;
  } catch (err) {
    console.error("[linkedin-people] AI insights failed:", err instanceof Error ? err.message : err);
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
