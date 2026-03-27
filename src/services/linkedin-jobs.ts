import * as cheerio from "cheerio";
import { cacheGetOrFetch, CACHE_TTL } from "./cache";

// Global semaphore — only one outbound LinkedIn scrape runs at a time
// to avoid triggering LinkedIn's rate limiting / IP bans.
let scrapeInProgress = false;
const scrapeQueue: Array<() => void> = [];

function acquireSemaphore(): Promise<void> {
  return new Promise((resolve) => {
    if (!scrapeInProgress) {
      scrapeInProgress = true;
      resolve();
    } else {
      scrapeQueue.push(resolve);
    }
  });
}

function releaseSemaphore(): void {
  const next = scrapeQueue.shift();
  if (next) {
    next();
  } else {
    scrapeInProgress = false;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface JobListing {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly employmentType: string;
  readonly description: string;
  readonly applyUrl: string;
  readonly postedAt: string;
  readonly source: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function fetchJobIds(company: string): Promise<string[]> {
  // LinkedIn guest job search API — returns HTML cards
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(company)}&location=Worldwide&start=0&count=25`;

  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);

  const ids: string[] = [];
  $("li[data-entity-urn]").each((_, el) => {
    const urn = $(el).attr("data-entity-urn") ?? "";
    const match = urn.match(/(\d+)$/);
    if (match) ids.push(match[1]);
  });

  // Fallback: parse job IDs from anchor hrefs
  if (ids.length === 0) {
    $("a[href*='/jobs/view/']").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const match = href.match(/\/jobs\/view\/(\d+)/);
      if (match && !ids.includes(match[1])) ids.push(match[1]);
    });
  }

  return ids.slice(0, 20);
}

async function fetchJobDetail(jobId: string, company: string): Promise<JobListing | null> {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;

  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $(".top-card-layout__title").text().trim() ||
      $("h2.top-card-layout__title").text().trim() ||
      $("h1").first().text().trim();

    const companyName =
      $(".topcard__org-name-link").text().trim() ||
      $(".top-card-layout__company").text().trim() ||
      company;

    const location =
      $(".topcard__flavor--bullet").text().trim() ||
      $(".top-card-layout__bullet").text().trim() ||
      "Not specified";

    const description =
      $(".show-more-less-html__markup").text().trim() ||
      $(".description__text").text().trim();

    const postedAt =
      $("time").attr("datetime") ||
      $(".posted-time-ago__text").text().trim() ||
      "";

    const employmentType =
      $(".job-criteria__text").first().text().trim() || "Full-time";

    if (!title) return null;

    return {
      id: jobId,
      title,
      company: companyName,
      location,
      employmentType,
      description: description.slice(0, 800),
      applyUrl: `https://www.linkedin.com/jobs/view/${jobId}`,
      postedAt,
      source: "LinkedIn",
    };
  } catch {
    return null;
  }
}

export async function fetchCompanyJobs(company: string): Promise<JobListing[]> {
  const cacheKey = `jobs:linkedin:${company.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      // Acquire semaphore — only one LinkedIn scrape at a time globally
      await acquireSemaphore();

      try {
        const jobIds = await fetchJobIds(company);
        if (jobIds.length === 0) return [];

        const listings: JobListing[] = [];
        for (const id of jobIds.slice(0, 12)) {
          const detail = await fetchJobDetail(id, company);
          if (detail) listings.push(detail);
          await delay(600); // 600ms between each LinkedIn request
        }

        return listings;
      } finally {
        // Always release — even if an error is thrown
        await delay(1_500); // extra cooldown before next scrape can start
        releaseSemaphore();
      }
    },
    CACHE_TTL.onDemand
  );
}
