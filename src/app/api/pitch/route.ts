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
  const { idea, sector, stage } = body;

  if (!idea || typeof idea !== "string" || idea.length < 5) {
    return Response.json(
      { success: false, error: "Idea must be at least 5 characters" },
      { status: 400 }
    );
  }

  // Step 1: Gather live market signals via orchestrator
  const orchestration = await orchestrateQuery(idea);

  // Step 2: Build signals summary for the prompt
  const signalsSummary = orchestration.signals
    .map((s) => `[${s.category}/${s.source}] ${s.description} (strength: ${s.strength.toFixed(2)})`)
    .join("\n") || "No live signals found — use general market knowledge.";

  // Step 3: Generate pitch deck with AI
  let pitchDeck = "AI analysis unavailable — source data shown below.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a world-class pitch deck consultant. Create a complete 10-slide pitch deck outline for:

Idea: "${idea}"
Sector: ${sector || "Not specified"}
Stage: ${stage || "Not specified"}

Live market signals:
${signalsSummary}

Generate each slide with:
- **Slide title**
- **Key message** (1 sentence)
- **Bullet points** (3-5 per slide)
- **Speaker notes** (what to SAY on this slide)

Slides:
1. Title Slide (company name suggestion, tagline, one-liner)
2. Problem (pain point, who suffers, cost of status quo)
3. Solution (your approach, key differentiator, demo description)
4. Market Size (TAM/SAM/SOM with numbers — use the market signals)
5. Business Model (how you make money, pricing, unit economics)
6. Traction (milestones to hit in first 6 months, early validation plan)
7. Competition (landscape from signals, your positioning, unfair advantage)
8. Go-to-Market (first 100 customers strategy, channels, partnerships)
9. Team (what roles to hire first, ideal founder profile)
10. The Ask (how much to raise, use of funds, next milestones)

Be specific with numbers. Use the market signals for real data. Format with markdown.`,
      maxTokens: 3000,
    });
    pitchDeck = text;
  } catch {
    // AI failed but we still have source data
  }

  return Response.json({
    success: true,
    data: {
      idea,
      sector: sector || null,
      stage: stage || null,
      pitchDeck,
      signalCount: orchestration.signals.length,
    },
  });
}
