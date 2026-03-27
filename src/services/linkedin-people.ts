import * as cheerio from "cheerio";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { cacheGetOrFetch, CACHE_TTL } from "./cache";

export interface PersonProfile {
  readonly slug: string;
  readonly name: string;
  readonly headline: string;
  readonly company: string;
  readonly location: string;
  readonly profileUrl: string;
  readonly source: string;
}

// Reuse the same semaphore pattern as linkedin-jobs.ts
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
  "Accept-Encoding": "gzip, deflate, br",
};

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Use AI to generate likely LinkedIn profile slug candidates for a name
async function generateSlugCandidates(name: string): Promise<string[]> {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const [first, ...rest] = parts;
  const last = rest.join("");
  const lastHyphen = rest.join("-");

  // Deterministic candidates based on common LinkedIn slug patterns
  const deterministic = [
    `${first}${last}`,
    `${first}-${lastHyphen}`,
    `${first}${last}1`,
    `${first}-${lastHyphen}-1`,
  ].filter(Boolean);

  // Ask AI for additional likely slugs (founders/execs often have custom slugs)
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `Generate 8 likely LinkedIn profile URL slugs for the person named "${name}".

LinkedIn slugs follow patterns like:
- firstname-lastname (e.g., satya-nadella)
- firstnamelastname (e.g., satyanadella)
- firstname-lastname-title (e.g., elon-musk-tesla)
- firstname-m-lastname (with middle initial)

Return ONLY a JSON array of slug strings, no explanation. Example: ["satya-nadella","satyanadella","satya-nadella-microsoft"]`,
      maxOutputTokens: 200,
    });

    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const aiSlugs: string[] = JSON.parse(match[0]);
      const cleaned = aiSlugs
        .filter((s) => typeof s === "string" && s.length > 0)
        .map((s) => s.toLowerCase().replace(/[^a-z0-9-]/g, ""))
        .filter((s) => s.length > 2);
      return [...new Set([...deterministic, ...cleaned])];
    }
  } catch {
    // Fall back to deterministic only
  }

  return deterministic;
}

// Fetch and parse a LinkedIn /in/ profile page
async function fetchProfile(slug: string): Promise<PersonProfile | null> {
  const url = `https://www.linkedin.com/in/${slug}`;

  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok || res.status === 999) return null;

    const html = await res.text();

    // Extract from JSON-LD structured data first (most reliable)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/m);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        const name = jsonLd.name;
        const headline = jsonLd.description || jsonLd.jobTitle || "";
        const company = jsonLd.worksFor?.[0]?.name || "";
        const location = jsonLd.address?.addressLocality || "";
        if (name && name.length > 1) {
          return { slug, name, headline, company, location, profileUrl: url, source: "LinkedIn" };
        }
      } catch {
        // Fall through to cheerio
      }
    }

    // Fallback: extract from inline JSON
    const nameMatch = html.match(/"name"\s*:\s*"([^"]{2,60})"/);
    const headlineMatch = html.match(/"headline"\s*:\s*"([^"]{0,200})"/);

    const $ = cheerio.load(html);
    const name =
      nameMatch?.[1] ||
      $('meta[property="og:title"]').attr("content")?.split(" | ")?.[0] ||
      $("h1").first().text().trim();

    if (!name || name.length < 2) return null;

    // Filter out LinkedIn UI strings masquerading as names
    if (name.toLowerCase().includes("linkedin") || name.toLowerCase().includes("sign in")) {
      return null;
    }

    const headline =
      headlineMatch?.[1] ||
      $('meta[property="og:description"]').attr("content") ||
      $(".top-card-layout__headline").text().trim() ||
      "";

    const $2 = cheerio.load(html);
    const location =
      $2(".top-card__subline-item").first().text().trim() ||
      $2('[class*="top-card"][class*="location"]').text().trim() ||
      "";

    return {
      slug,
      name,
      headline: headline.slice(0, 200),
      company: "",
      location,
      profileUrl: url,
      source: "LinkedIn",
    };
  } catch {
    return null;
  }
}

export async function searchPeople(name: string): Promise<PersonProfile[]> {
  const cacheKey = `people:linkedin:${name.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      await acquireSemaphore();

      try {
        const slugs = await generateSlugCandidates(name);
        const profiles: PersonProfile[] = [];

        for (const slug of slugs) {
          const profile = await fetchProfile(slug);
          if (profile) {
            // Deduplicate by name
            const isDuplicate = profiles.some(
              (p) => p.name.toLowerCase() === profile.name.toLowerCase()
            );
            if (!isDuplicate) profiles.push(profile);
          }
          await delay(600);
        }

        return profiles;
      } finally {
        await delay(1_500);
        releaseSemaphore();
      }
    },
    CACHE_TTL.onDemand
  );
}
