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
  readonly confidence: "high" | "medium" | "low";
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// AI knows the LinkedIn profiles of notable founders, investors, and executives
// from its training data. We ask for structured profile data + LinkedIn URL directly
// rather than trying to scrape LinkedIn (which blocks server-side requests with 999).
export async function searchPeople(name: string): Promise<PersonProfile[]> {
  const cacheKey = `people:ai:${name.toLowerCase().replace(/\s+/g, "_")}`;

  return cacheGetOrFetch(
    cacheKey,
    async () => {
      const { text } = await generateText({
        model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
        prompt: `You are a professional intelligence database. The user is searching for: "${name}"

Return a JSON array of matching LinkedIn profiles you know about. Include up to 5 results for people who match this name.

For each person return:
- name: their full real name
- headline: their current role/title (e.g. "CEO at NVIDIA", "Partner at Andreessen Horowitz")
- company: their current or most recent employer
- location: city/country
- linkedinSlug: their LinkedIn profile slug (the part after linkedin.com/in/)
- confidence: "high" if you are certain of their LinkedIn slug, "medium" if likely correct, "low" if uncertain
- summary: 1-2 sentence professional bio

Focus on startup founders, investors, executives, and tech leaders. If you don't know the LinkedIn slug with confidence, omit that field rather than guess.

Return ONLY valid JSON array, no explanation:
[{"name":"...","headline":"...","company":"...","location":"...","linkedinSlug":"...","confidence":"high","summary":"..."}]`,
        maxOutputTokens: 800,
      });

      // Extract JSON from response
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return [];

      let raw: Array<{
        name?: string;
        headline?: string;
        company?: string;
        location?: string;
        linkedinSlug?: string;
        confidence?: string;
        summary?: string;
      }>;

      try {
        raw = JSON.parse(match[0]);
      } catch {
        return [];
      }

      return raw
        .filter((p) => p.name && p.name.length > 1)
        .map((p) => ({
          slug: p.linkedinSlug ?? "",
          name: p.name ?? "",
          headline: p.headline ?? "",
          company: p.company ?? "",
          location: p.location ?? "",
          profileUrl: p.linkedinSlug
            ? `https://www.linkedin.com/in/${p.linkedinSlug}`
            : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name ?? "")}`,
          source: "AI + LinkedIn",
          confidence: (p.confidence === "high" || p.confidence === "medium" || p.confidence === "low")
            ? p.confidence as "high" | "medium" | "low"
            : "medium" as const,
        }))
        .slice(0, 5);
    },
    CACHE_TTL.onDemand
  );
}
