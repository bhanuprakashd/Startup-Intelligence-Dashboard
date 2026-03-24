import { cacheGetOrFetch, CACHE_TTL } from "./cache";

export interface ProductHuntSignal {
  readonly name: string;
  readonly tagline: string;
  readonly url: string;
  readonly date: string;
}

export async function searchProductHunt(query: string): Promise<ProductHuntSignal[]> {
  const cacheKey = `signal:ph:${query.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      // Use ProductHunt's public search page (no API key needed)
      const url = `https://www.producthunt.com/search/posts?q=${encodeURIComponent(query)}`;

      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "WSI/1.0 startup-intelligence",
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) return [];

        const text = await res.text();

        // Try to parse as JSON first
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            return json.slice(0, 10).map((item: any) => ({
              name: item.name ?? item.title ?? "Unknown",
              tagline: item.tagline ?? item.description ?? "",
              url: item.url ?? `https://www.producthunt.com`,
              date: item.created_at ?? new Date().toISOString(),
            }));
          }
        } catch {
          // Not JSON — return empty, PH search may require auth
        }

        return [];
      } catch {
        return [];
      }
    },
    CACHE_TTL.onDemand
  );
}
