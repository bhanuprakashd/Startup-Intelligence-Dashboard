import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { searchReddit } from "@/services/reddit";
import { searchGitHub } from "@/services/github-trending";
import { getHNStories } from "@/services/hackernews";

export const maxDuration = 300;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { idea, sector, stage, location } = body;

  if (!idea || typeof idea !== "string") {
    return Response.json(
      { success: false, error: "Idea is required" },
      { status: 400 }
    );
  }

  const sectorStr = sector ?? "technology";
  const stageStr = stage ?? "seed";
  const locationStr = location ?? "global";

  // Query sources for investor context
  const [redditResults, githubResults, hnStories] = await Promise.allSettled([
    searchReddit(`${sectorStr} venture capital investors funding`),
    searchGitHub(`${sectorStr} investors venture capital list`),
    getHNStories(),
  ]);

  const redditContext = redditResults.status === "fulfilled"
    ? redditResults.value.slice(0, 10).map((r) => `[Reddit r/${r.subreddit}] "${r.title}" (${r.score} pts)`).join("\n")
    : "Reddit data unavailable";

  const githubContext = githubResults.status === "fulfilled"
    ? githubResults.value.slice(0, 5).map((r) => `[GitHub] ${r.fullName} — ${r.stars} stars: ${r.description}`).join("\n")
    : "GitHub data unavailable";

  const hnContext = hnStories.status === "fulfilled"
    ? hnStories.value
        .filter((s) => s.title.toLowerCase().includes(sectorStr.toLowerCase().split(" ")[0]))
        .slice(0, 5)
        .map((s) => `[HN] "${s.title}" (${s.score} pts)`)
        .join("\n")
    : "HN data unavailable";

  let sourcesSucceeded = 0;
  if (redditResults.status === "fulfilled") sourcesSucceeded++;
  if (githubResults.status === "fulfilled") sourcesSucceeded++;
  if (hnStories.status === "fulfilled") sourcesSucceeded++;

  let aiAnalysis = "AI analysis unavailable — source data shown below.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a startup fundraising advisor. A founder wants to find investors for:

**Idea:** "${idea}"
**Sector:** ${sectorStr}
**Stage:** ${stageStr}
**Location:** ${locationStr}

Here is live market context I gathered:

Reddit discussions:
${redditContext}

GitHub investor resources:
${githubContext}

HackerNews activity:
${hnContext}

Based on your knowledge of the venture capital landscape and the market context above, provide:

1. **Top 10 Investor Matches** — For each investor provide:
   - Name (VC firm or angel)
   - Why they're a match (cite their thesis, recent deals, or portfolio)
   - Stage preference
   - Typical check size
   - How to reach them (public info only — Twitter, website, AngelList)
   - Match score (1-10)

2. **Fundraising Strategy** — Given the stage and sector:
   - Recommended raise amount
   - Key milestones investors want to see
   - Common mistakes founders make in this sector

3. **Red Flags to Watch** — Investors to avoid or be careful with in this space

4. **Timing Advice** — Is this a good time to raise in ${sectorStr}? Why or why not?

Be specific with real investor names based on your training data. Acknowledge when you're less certain about recent activity. Format with markdown.`,
      maxOutputTokens: 2000,
    });
    aiAnalysis = text;
  } catch {
    // AI failed but we still have source data
  }

  return Response.json({
    success: true,
    data: {
      idea,
      sector: sectorStr,
      stage: stageStr,
      location: locationStr,
      aiAnalysis,
      sourcesQueried: 3,
      sourcesSucceeded,
    },
    meta: {
      source: "wsi-investor-match",
      refreshedAt: new Date().toISOString(),
    },
  });
}
