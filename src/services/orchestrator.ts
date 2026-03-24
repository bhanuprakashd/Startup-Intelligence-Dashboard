import { searchReddit, type RedditSignal } from "./reddit";
import { searchGitHub, type GitHubSignal } from "./github-trending";
import { searchProductHunt, type ProductHuntSignal } from "./producthunt";
import { getHNStories, type HNItem } from "./hackernews";

export type SignalCategory = "demand" | "competition" | "innovation" | "community";

export interface Signal {
  readonly category: SignalCategory;
  readonly source: string;
  readonly description: string;
  readonly strength: number; // 0-1
  readonly url: string;
  readonly fetchedAt: string;
}

export interface OrchestrationResult {
  readonly signals: Signal[];
  readonly sourcesQueried: number;
  readonly sourcesSucceeded: number;
  readonly query: string;
}

function redditToSignals(results: RedditSignal[], query: string): Signal[] {
  if (results.length === 0) return [];

  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const totalComments = results.reduce((sum, r) => sum + r.comments, 0);

  const signals: Signal[] = [
    {
      category: "demand",
      source: "Reddit",
      description: `${results.length} discussions found for "${query}" with avg score ${Math.round(avgScore)} and ${totalComments} total comments`,
      strength: Math.min(results.length / 15, 1.0),
      url: results[0]?.url ?? "",
      fetchedAt: new Date().toISOString(),
    },
  ];

  // High-engagement posts are individual signals
  const hotPosts = results.filter((r) => r.score > 50 || r.comments > 20);
  for (const post of hotPosts.slice(0, 3)) {
    signals.push({
      category: "community",
      source: `r/${post.subreddit}`,
      description: `"${post.title}" — ${post.score} upvotes, ${post.comments} comments`,
      strength: Math.min(post.score / 200, 1.0),
      url: post.url,
      fetchedAt: post.created,
    });
  }

  return signals;
}

function githubToSignals(results: GitHubSignal[], query: string): Signal[] {
  if (results.length === 0) return [];

  const totalStars = results.reduce((sum, r) => sum + r.stars, 0);

  const signals: Signal[] = [
    {
      category: "innovation",
      source: "GitHub",
      description: `${results.length} repos found for "${query}" with ${totalStars.toLocaleString()} total stars`,
      strength: Math.min(results.length / 15, 1.0),
      url: results[0]?.url ?? "",
      fetchedAt: new Date().toISOString(),
    },
  ];

  // Top repos are competition signals
  const topRepos = results.filter((r) => r.stars > 100);
  for (const repo of topRepos.slice(0, 3)) {
    signals.push({
      category: "competition",
      source: "GitHub",
      description: `${repo.fullName} — ${repo.stars.toLocaleString()} stars, ${repo.language}. "${repo.description}"`,
      strength: Math.min(repo.stars / 5000, 1.0),
      url: repo.url,
      fetchedAt: repo.updatedAt,
    });
  }

  return signals;
}

function phToSignals(results: ProductHuntSignal[]): Signal[] {
  if (results.length === 0) return [];

  return [
    {
      category: "competition",
      source: "ProductHunt",
      description: `${results.length} products found — ${results.map((r) => r.name).join(", ")}`,
      strength: Math.min(results.length / 10, 1.0),
      url: results[0]?.url ?? "",
      fetchedAt: new Date().toISOString(),
    },
  ];
}

function hnToSignals(stories: HNItem[], query: string): Signal[] {
  const related = stories.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase().split(" ")[0])
  );

  if (related.length === 0) return [];

  return [
    {
      category: "demand",
      source: "Hacker News",
      description: `${related.length} trending stories related to "${query}" on HN front page`,
      strength: Math.min(related.length / 5, 1.0),
      url: related[0]?.hnUrl ?? "",
      fetchedAt: new Date().toISOString(),
    },
  ];
}

export async function orchestrateQuery(query: string): Promise<OrchestrationResult> {
  const sources = [
    { name: "reddit", fn: () => searchReddit(query).then((r) => redditToSignals(r, query)) },
    { name: "github", fn: () => searchGitHub(query).then((r) => githubToSignals(r, query)) },
    { name: "producthunt", fn: () => searchProductHunt(query).then((r) => phToSignals(r)) },
    { name: "hackernews", fn: () => getHNStories().then((r) => hnToSignals(r, query)) },
  ];

  const results = await Promise.allSettled(sources.map((s) => s.fn()));

  const allSignals: Signal[] = [];
  let succeeded = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      allSignals.push(...result.value);
      succeeded++;
    }
  }

  return {
    signals: allSignals,
    sourcesQueried: sources.length,
    sourcesSucceeded: succeeded,
    query,
  };
}
