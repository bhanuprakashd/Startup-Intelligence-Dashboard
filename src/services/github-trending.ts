import { cacheGetOrFetch, CACHE_TTL } from "./cache";

export interface GitHubSignal {
  readonly name: string;
  readonly fullName: string;
  readonly description: string;
  readonly stars: number;
  readonly forks: number;
  readonly language: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export async function searchGitHub(query: string): Promise<GitHubSignal[]> {
  const cacheKey = `signal:github:${query.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      // GitHub search API — free, no auth needed (60 req/hour)
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=15`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "WSI/1.0",
          "Accept": "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return [];

      const json = await res.json();
      const items = json?.items ?? [];

      return items.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description ?? "",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language ?? "Unknown",
        url: repo.html_url,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
      }));
    },
    CACHE_TTL.onDemand
  );
}
