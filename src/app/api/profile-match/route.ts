import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { orchestrateQuery } from "@/services/orchestrator";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { skills, interests, budget, location, experience } = body;

  if (!Array.isArray(skills) || !Array.isArray(interests)) {
    return Response.json(
      { success: false, error: "skills and interests must be arrays" },
      { status: 400 }
    );
  }

  if (!budget || !location || !experience) {
    return Response.json(
      { success: false, error: "budget, location, and experience are required" },
      { status: 400 }
    );
  }

  // Query orchestrator for signals in the top 2 interest areas
  const topInterests = interests.slice(0, 2);
  const signalResults = await Promise.allSettled(
    topInterests.map((interest: string) => orchestrateQuery(interest))
  );

  const signalsSummary = signalResults
    .map((result, index) => {
      const interest = topInterests[index];
      if (result.status === "rejected") {
        return `[${interest}] No signals available`;
      }
      const signals = result.value.signals;
      if (signals.length === 0) {
        return `[${interest}] No market signals found`;
      }
      const lines = signals
        .slice(0, 5)
        .map((s) => `  - [${s.category}/${s.source}] ${s.description} (strength: ${s.strength.toFixed(2)})`)
        .join("\n");
      return `[${interest}]\n${lines}`;
    })
    .join("\n\n");

  let aiAnalysis = "AI analysis unavailable — source data shown below.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a startup matchmaker. Based on this founder profile, recommend the 5 best startup ideas they should pursue.

Profile:
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}
- Budget: ${budget}
- Location: ${location}
- Experience: ${experience}

Live market signals for their interest areas:
${signalsSummary || "No signals available from automated sources."}

For each recommendation provide:
1. **Idea Name** — catchy one-liner
2. **The Problem** — who has this problem and how big it is
3. **Why YOU** — specifically why this founder's skills/location/budget make them ideal
4. **Market Opportunity** — size and growth (cite signals if available)
5. **First Step** — what to do THIS WEEK
6. **Difficulty** — Easy / Medium / Hard
7. **Time to Revenue** — estimated weeks/months

Rank from best match to good match. Be specific to their profile — don't give generic ideas.`,
      maxTokens: 2500,
    });
    aiAnalysis = text;
  } catch {
    // AI failed but we still have source data
  }

  return Response.json({
    success: true,
    data: {
      profile: { skills, interests, budget, location, experience },
      aiAnalysis,
      signalsSummary,
    },
    meta: {
      source: "wsi-profile-match",
      refreshedAt: new Date().toISOString(),
    },
  });
}
