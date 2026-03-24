import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { searchReddit } from "@/services/reddit";
import { searchGitHub } from "@/services/github-trending";
import { searchProductHunt } from "@/services/producthunt";
import { getHNStories } from "@/services/hackernews";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export interface XRayCompetitor {
  readonly name: string;
  readonly source: string;
  readonly description: string;
  readonly url: string;
}

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

  // Query all sources in parallel
  const [redditResults, githubResults, phResults, hnResults] =
    await Promise.allSettled([
      searchReddit(idea),
      searchGitHub(idea),
      searchProductHunt(idea),
      getHNStories(),
    ]);

  const reddit = redditResults.status === "fulfilled" ? redditResults.value : [];
  const github = githubResults.status === "fulfilled" ? githubResults.value : [];
  const ph = phResults.status === "fulfilled" ? phResults.value : [];
  const hn = hnResults.status === "fulfilled" ? hnResults.value : [];

  const sourcesQueried = 4;
  const sourcesSucceeded = [redditResults, githubResults, phResults, hnResults].filter(
    (r) => r.status === "fulfilled"
  ).length;

  // Extract competitors from raw source data
  const competitors: XRayCompetitor[] = [];

  for (const repo of github.slice(0, 8)) {
    competitors.push({
      name: repo.fullName,
      source: "GitHub",
      description: `${repo.description || "No description"} — ${repo.stars.toLocaleString()} stars, ${repo.language}`,
      url: repo.url,
    });
  }

  for (const product of ph.slice(0, 6)) {
    competitors.push({
      name: product.name,
      source: "ProductHunt",
      description: product.tagline,
      url: product.url,
    });
  }

  const ideaKeyword = idea.toLowerCase().split(" ")[0];
  const relevantHN = hn
    .filter((s) => s.title.toLowerCase().includes(ideaKeyword))
    .slice(0, 4);
  for (const story of relevantHN) {
    competitors.push({
      name: story.title,
      source: "Hacker News",
      description: `Score: ${story.score}, Comments: ${story.comments}`,
      url: story.url,
    });
  }

  const relevantReddit = reddit
    .filter((r) => r.score > 20 || r.comments > 10)
    .slice(0, 4);
  for (const post of relevantReddit) {
    competitors.push({
      name: `r/${post.subreddit}: ${post.title.slice(0, 80)}`,
      source: "Reddit",
      description: `${post.score} upvotes, ${post.comments} comments`,
      url: post.url,
    });
  }

  // Build context summary for AI
  const githubSummary =
    github.length > 0
      ? github
          .slice(0, 10)
          .map((r) => `- ${r.fullName} (${r.stars} stars, ${r.language}): ${r.description}`)
          .join("\n")
      : "No GitHub repos found.";

  const phSummary =
    ph.length > 0
      ? ph
          .slice(0, 8)
          .map((p) => `- ${p.name}: ${p.tagline}`)
          .join("\n")
      : "No ProductHunt products found.";

  const redditSummary =
    reddit.length > 0
      ? reddit
          .slice(0, 8)
          .map((r) => `- [r/${r.subreddit}] ${r.title} (${r.score} upvotes, ${r.comments} comments)`)
          .join("\n")
      : "No Reddit discussions found.";

  const hnFiltered = hn.filter((s) =>
    s.title.toLowerCase().includes(ideaKeyword)
  );
  const hnSummary =
    hnFiltered.length > 0
      ? hnFiltered
          .slice(0, 6)
          .map((s) => `- ${s.title} (score: ${s.score}, comments: ${s.comments})`)
          .join("\n")
      : "No relevant HN stories found.";

  let aiAnalysis = "AI analysis unavailable — source data shown below.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a competitive intelligence analyst. A founder wants to understand the competitive landscape for this idea:

"${idea}"

Here is raw data I collected from multiple sources:

## GitHub Repositories (open-source & technical competitors):
${githubSummary}

## ProductHunt Products (launched startups & products):
${phSummary}

## Reddit Discussions (community mentions of competitors):
${redditSummary}

## Hacker News Stories (tech startup activity):
${hnSummary}

Based on this REAL data, provide a structured competitive landscape analysis:

1. **Direct Competitors** — List companies/products building exactly this (name, what they do, funding if known, key strengths/weaknesses)
2. **Indirect / Adjacent Competitors** — List players solving the same problem differently or targeting adjacent markets
3. **Open-Source Alternatives** — Highlight any open-source projects from GitHub that users might use instead
4. **Whitespace Analysis** — What is nobody doing well? Where are the clear gaps in the current landscape?
5. **Moat Opportunities** — What would make a new entrant defensible? What unique angle could differentiate from the above?
6. **Competitive Positioning Recommendation** — In 2-3 sentences, how should a new entrant position themselves given this landscape?

Be concise and cite specific products/repos from the data above. Do not invent competitors not present in the data. If data is sparse, say so and reason from first principles.`,
      maxOutputTokens: 1800,
    });
    aiAnalysis = text;
  } catch {
    // AI failed but we still have source data
  }

  return Response.json({
    success: true,
    data: {
      idea,
      aiAnalysis,
      competitors,
      sourcesQueried,
      sourcesSucceeded,
    },
  });
}
