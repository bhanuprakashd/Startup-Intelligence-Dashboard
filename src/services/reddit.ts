import { cacheGetOrFetch, CACHE_TTL } from "./cache";

export interface RedditSignal {
  readonly title: string;
  readonly subreddit: string;
  readonly score: number;
  readonly comments: number;
  readonly url: string;
  readonly created: string;
}

export async function searchReddit(query: string): Promise<RedditSignal[]> {
  const cacheKey = `signal:reddit:${query.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=25`;
      const res = await fetch(url, {
        headers: { "User-Agent": "WSI/1.0 startup-intelligence" },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return [];

      const json = await res.json();
      const posts = json?.data?.children ?? [];

      return posts
        .map((post: any) => ({
          title: post.data.title,
          subreddit: post.data.subreddit,
          score: post.data.score,
          comments: post.data.num_comments,
          url: `https://reddit.com${post.data.permalink}`,
          created: new Date(post.data.created_utc * 1000).toISOString(),
        }))
        .filter((p: RedditSignal) => p.score > 5);
    },
    CACHE_TTL.onDemand
  );
}
