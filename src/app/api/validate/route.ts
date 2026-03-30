import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { orchestrateQuery } from "@/services/orchestrator";
import { triangulate } from "@/services/triangulation";

export const maxDuration = 300;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { idea } = body;

  if (!idea || typeof idea !== "string" || idea.length < 5) {
    return Response.json(
      { success: false, error: "Idea must be at least 5 characters" },
      { status: 400 }
    );
  }

  // Step 1: Orchestrate — query all free sources in parallel
  const orchestration = await orchestrateQuery(idea);

  // Step 2: Triangulate — score the signals
  const triangulation = triangulate(orchestration.signals);

  // Step 3: AI Synthesis — generate the viability report
  const signalSummary = orchestration.signals
    .map((s) => `[${s.category}/${s.source}] ${s.description} (strength: ${s.strength.toFixed(2)})`)
    .join("\n");

  let aiAnalysis = "AI analysis unavailable — source data shown below.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a startup analyst. A user wants to validate this startup idea:

"${idea}"

Here are the live market signals I collected from Reddit, GitHub, HackerNews, and ProductHunt:

${signalSummary || "No signals found from automated sources."}

Signal Triangulation Score: ${triangulation.overallScore}/100
- Demand: ${triangulation.scores.demand}/100
- Competition (higher = less competition): ${triangulation.scores.competition}/100
- Innovation (open source activity): ${triangulation.scores.innovation}/100
- Community (discussion/interest): ${triangulation.scores.community}/100
- Categories covered: ${triangulation.categoriesCovered}/4
- Total signals: ${triangulation.signalCount}

Based on these REAL signals, provide a structured viability analysis:

1. **Overall Verdict** (1 sentence: viable/promising/risky/weak)
2. **Demand Analysis** — Is there evidence people want this? Cite the signals.
3. **Competition Landscape** — Who else is building this? How crowded?
4. **Timing** — Is this the right time? What catalysts exist?
5. **Red Flags** — List 2-3 honest concerns (be specific, not generic)
6. **Green Flags** — List 2-3 reasons this could work
7. **Suggested Pivots** — If the idea is weak, suggest 1-2 better angles based on the signals
8. **Next Steps** — 3 concrete actions the founder should take this week

Be concise, data-driven, and honest. Cite specific signals from the data above. Do not make up data.`,
      maxOutputTokens: 1500,
    });
    aiAnalysis = text;
  } catch {
    // AI failed but we still have source data
  }

  return Response.json({
    success: true,
    data: {
      idea,
      overallScore: triangulation.overallScore,
      confidence: triangulation.confidence,
      scores: triangulation.scores,
      signalCount: triangulation.signalCount,
      sourcesQueried: orchestration.sourcesQueried,
      sourcesSucceeded: orchestration.sourcesSucceeded,
      categoriesCovered: triangulation.categoriesCovered,
      aiAnalysis,
      signals: orchestration.signals.map((s) => ({
        category: s.category,
        source: s.source,
        description: s.description,
        strength: s.strength,
        url: s.url,
      })),
    },
    meta: {
      source: "wsi-validator",
      refreshedAt: new Date().toISOString(),
    },
  });
}
