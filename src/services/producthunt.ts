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
      // ProductHunt's public search page (producthunt.com/search/posts?q=...) returns
      // server-side-rendered HTML, not JSON. The official GraphQL API requires an API key
      // (PRODUCTHUNT_API_KEY). Without it, we cannot retrieve structured product data.
      //
      // To enable ProductHunt results:
      //   1. Create an app at https://www.producthunt.com/v2/oauth/applications
      //   2. Set PRODUCTHUNT_API_KEY in your Vercel environment variables
      //   3. Implement the GraphQL query below
      //
      // Until the key is configured, return an empty array so the rest of the
      // X-Ray scan still works.
      const apiKey = process.env.PRODUCTHUNT_API_KEY;
      if (!apiKey) {
        return [];
      }

      try {
        const graphqlQuery = `
          query SearchPosts($query: String!) {
            search(query: $query, first: 8) {
              edges {
                node {
                  ... on Post {
                    name
                    tagline
                    website
                    createdAt
                  }
                }
              }
            }
          }
        `;

        const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ query: graphqlQuery, variables: { query } }),
          signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) return [];

        const json = await res.json();
        const edges = json?.data?.search?.edges ?? [];

        return edges
          .map((edge: any) => edge?.node)
          .filter(Boolean)
          .slice(0, 8)
          .map((item: any) => ({
            name: item.name ?? "Unknown",
            tagline: item.tagline ?? "",
            url: item.website ?? "https://www.producthunt.com",
            date: item.createdAt ?? new Date().toISOString(),
          }));
      } catch {
        return [];
      }
    },
    CACHE_TTL.onDemand
  );
}
