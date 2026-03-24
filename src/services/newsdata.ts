import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

export interface NewsItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly imageUrl: string | null;
  readonly source: string;
  readonly publishedAt: string;
  readonly category: string;
  readonly sentiment: "positive" | "neutral" | "negative";
}

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  source_id: string;
  pubDate: string;
  category: string[];
  sentiment: string;
}

function mapCategory(cats: string[]): string {
  const catMap: Record<string, string> = {
    technology: "Tech",
    business: "Business",
    science: "Science",
    health: "HealthTech",
    environment: "CleanTech",
    education: "EdTech",
    politics: "Policy",
  };
  for (const c of cats) {
    if (catMap[c]) return catMap[c];
  }
  return "Startup";
}

function mapSentiment(s: string): "positive" | "neutral" | "negative" {
  if (s === "positive") return "positive";
  if (s === "negative") return "negative";
  return "neutral";
}

async function fetchNews(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=startup%20OR%20funding%20OR%20venture%20capital&language=en&size=20`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const json = await res.json();

  if (json.status !== "success" || !json.results) return [];

  return json.results.map((a: NewsDataArticle) => ({
    id: a.article_id,
    title: a.title,
    description: a.description ?? "",
    url: a.link,
    imageUrl: a.image_url,
    source: a.source_id,
    publishedAt: a.pubDate,
    category: mapCategory(a.category ?? []),
    sentiment: mapSentiment(a.sentiment ?? "neutral"),
  }));
}

export async function getLiveNews(): Promise<NewsItem[]> {
  try {
    const result = await cacheGetOrFetch(
      "feed:newsdata",
      fetchNews,
      CACHE_TTL.streaming
    );
    await reportSourceUp("newsdata");
    return result;
  } catch (error) {
    await reportSourceDown("newsdata");
    return [];
  }
}
