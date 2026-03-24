import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

interface NameSuggestion {
  name: string;
  reason: string;
  domain: string;
}

interface NameResult extends NameSuggestion {
  available: boolean;
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { cache: "no-store", signal: AbortSignal.timeout(5_000) }
    );
    if (!res.ok) return false;
    const data = await res.json();
    // Status 3 = NXDOMAIN (domain does not exist), no Answer = likely available
    if (data.Status === 3 || !data.Answer || data.Answer.length === 0) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function parseAIResponse(text: string): NameSuggestion[] {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed as NameSuggestion[];
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { idea } = body;

  if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
    return Response.json(
      { success: false, error: "Idea must be at least 3 characters" },
      { status: 400 }
    );
  }

  let text: string;
  try {
    const result = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `Generate 10 creative startup name suggestions for this idea: "${idea.trim()}"

For each name provide:
1. The name
2. Why it works (1 sentence)
3. The .com domain to check

Return ONLY a JSON array, no other text:
[{"name": "ExampleName", "reason": "Short explanation", "domain": "examplename.com"}]`,
      maxTokens: 800,
    });
    text = result.text;
  } catch {
    return Response.json({ success: false, error: "AI service temporarily unavailable. Please try again." }, { status: 503 });
  }

  let suggestions: NameSuggestion[];
  try {
    suggestions = parseAIResponse(text);
  } catch {
    return Response.json(
      { success: false, error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  // Check domain availability for all suggestions in parallel
  const namesWithAvailability: NameResult[] = await Promise.all(
    suggestions.map(async (s) => {
      const available = await checkDomainAvailability(s.domain);
      return { ...s, available };
    })
  );

  return Response.json({
    success: true,
    data: {
      idea: idea.trim(),
      names: namesWithAvailability,
    },
  });
}
