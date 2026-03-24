import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

interface HNStory {
  readonly id: number;
  readonly title: string;
  readonly url: string | null;
  readonly score: number;
  readonly by: string;
  readonly time: number;
  readonly descendants: number;
}

export interface HNItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly source: string;
  readonly score: number;
  readonly author: string;
  readonly comments: number;
  readonly publishedAt: string;
  readonly hnUrl: string;
}

const STARTUP_KEYWORDS = [
  "startup", "founder", "funding", "vc", "seed", "series",
  "yc", "launch", "saas", "ai", "fintech", "raise",
];

function isStartupRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return STARTUP_KEYWORDS.some((kw) => lower.includes(kw));
}

async function fetchTopStories(): Promise<HNItem[]> {
  const idsRes = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    { signal: AbortSignal.timeout(10_000) }
  );
  const ids: number[] = await idsRes.json();
  const top50 = ids.slice(0, 50);

  const stories = await Promise.allSettled(
    top50.map(async (id) => {
      const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { signal: AbortSignal.timeout(5_000) }
      );
      return res.json() as Promise<HNStory>;
    })
  );

  return stories
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((s) => s && s.title && isStartupRelated(s.title))
    .slice(0, 15)
    .map((s) => ({
      id: String(s.id),
      title: s.title,
      url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
      source: "Hacker News",
      score: s.score,
      author: s.by,
      comments: s.descendants ?? 0,
      publishedAt: new Date(s.time * 1000).toISOString(),
      hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
    }));
}

export async function getHNStories(): Promise<HNItem[]> {
  try {
    const result = await cacheGetOrFetch(
      "feed:hackernews",
      fetchTopStories,
      CACHE_TTL.streaming
    );
    await reportSourceUp("hackernews");
    return result;
  } catch (error) {
    await reportSourceDown("hackernews");
    return [];
  }
}
