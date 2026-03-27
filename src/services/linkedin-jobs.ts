import * as cheerio from "cheerio";
import { cacheGetOrFetch, CACHE_TTL } from "./cache";

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

// Global semaphore — only one outbound LinkedIn scrape runs at a time
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

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function fetchJobIds(company: string): Promise<string[]> {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(company)}&location=Worldwide&start=0&count=25`;

  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return [];

  const html = await res.text();

  // Extract job IDs from data-entity-urn="urn:li:jobPosting:XXXXXXX"
  const ids: string[] = [];
  const urnMatches = html.matchAll(/jobPosting:(\d+)/g);
  for (const match of urnMatches) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }

  // Fallback: extract from href="/jobs/view/title-at-company-XXXXXXX"
  if (ids.length === 0) {
    const hrefMatches = html.matchAll(/\/jobs\/view\/[^"]*?-(\d+)/g);
    for (const match of hrefMatches) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }
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
      $("h2.top-card-layout__title").text().trim() ||
      $("h2.topcard__title").text().trim() ||
      $("h1").first().text().trim();

    if (!title) return null;

    const companyName =
      $("a.topcard__org-name-link").text().trim() ||
      $(".top-card-layout__company").text().trim() ||
      company;

    const location =
      $("span.topcard__flavor--bullet").first().text().trim() ||
      $(".top-card-layout__bullet").text().trim() ||
      "Not specified";

    const description =
      $(".show-more-less-html__markup").text().trim() ||
      $(".description__text").text().trim();

    const postedAt = $("time").attr("datetime") || "";

    // Employment type is the first job criteria item
    const employmentType =
      $(".description__job-criteria-text").first().text().trim() || "Full-time";

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
      await acquireSemaphore();

      try {
        const jobIds = await fetchJobIds(company);
        if (jobIds.length === 0) return [];

        const listings: JobListing[] = [];
        for (const id of jobIds.slice(0, 12)) {
          const detail = await fetchJobDetail(id, company);
          if (detail) listings.push(detail);
          await delay(600);
        }

        return listings;
      } finally {
        await delay(1_500);
        releaseSemaphore();
      }
    },
    CACHE_TTL.onDemand
  );
}
