import Parser from "rss-parser";
import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "WSI/1.0 (World Startup Intelligence)" },
});

export interface RSSItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly source: string;
  readonly publishedAt: string;
  readonly category: string;
}

const FUNDING_FEEDS = [
  { url: "https://techcrunch.com/category/venture/feed/", source: "TechCrunch", id: "rss_techcrunch" },
];

const NEWS_FEEDS = [
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat", id: "rss_venturebeat" },
];

async function fetchFeed(feedUrl: string, source: string): Promise<RSSItem[]> {
  const feed = await parser.parseURL(feedUrl);
  return (feed.items ?? []).slice(0, 15).map((item, i) => ({
    id: item.guid ?? item.link ?? `${source}-${i}`,
    title: item.title ?? "",
    description: item.contentSnippet ?? item.content ?? "",
    url: item.link ?? "",
    source,
    publishedAt: item.pubDate ?? new Date().toISOString(),
    category: "Funding",
  }));
}

export async function getLiveFunding(): Promise<RSSItem[]> {
  const results: RSSItem[] = [];

  for (const feed of FUNDING_FEEDS) {
    try {
      const items = await cacheGetOrFetch(
        `feed:rss:${feed.id}`,
        () => fetchFeed(feed.url, feed.source),
        CACHE_TTL.streaming
      );
      results.push(...items);
      await reportSourceUp(feed.id);
    } catch {
      await reportSourceDown(feed.id);
    }
  }

  return results.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getLiveRSSNews(): Promise<RSSItem[]> {
  const results: RSSItem[] = [];

  for (const feed of NEWS_FEEDS) {
    try {
      const items = await cacheGetOrFetch(
        `feed:rss:${feed.id}`,
        () => fetchFeed(feed.url, feed.source),
        CACHE_TTL.streaming
      );
      results.push(...items);
    } catch {
      // silently skip failed feeds
    }
  }

  return results.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
