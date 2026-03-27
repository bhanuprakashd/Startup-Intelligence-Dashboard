import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { fetchCompanyJobs, type JobListing } from "@/services/linkedin-jobs";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 300;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export interface LinkedInResult {
  readonly company: string;
  readonly jobs: JobListing[];
  readonly aiInsights: string;
  readonly hiringSignals: HiringSignal[];
}

export interface HiringSignal {
  readonly label: string;
  readonly count: number;
  readonly color: string;
}

function extractHiringSignals(jobs: JobListing[]): HiringSignal[] {
  const categories: Record<string, { keywords: string[]; color: string }> = {
    Engineering: { keywords: ["engineer", "developer", "software", "backend", "frontend", "fullstack", "devops", "sre", "ml", "ai", "data"], color: "indigo" },
    Sales: { keywords: ["sales", "account executive", "ae", "sdr", "bdr", "business development", "revenue"], color: "emerald" },
    Marketing: { keywords: ["marketing", "growth", "content", "seo", "demand gen", "brand", "social media"], color: "violet" },
    Product: { keywords: ["product manager", "pm", "product owner", "product lead", "ux", "design", "researcher"], color: "amber" },
    Operations: { keywords: ["operations", "ops", "finance", "hr", "people", "legal", "compliance", "recruiting"], color: "rose" },
    Support: { keywords: ["support", "success", "customer", "onboarding", "implementation"], color: "cyan" },
  };

  return Object.entries(categories)
    .map(([label, { keywords, color }]) => ({
      label,
      count: jobs.filter((j) =>
        keywords.some((kw) => j.title.toLowerCase().includes(kw))
      ).length,
      color,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function POST(req: Request) {
  // Inbound rate limit: 10 requests per 60s per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { success, remaining, reset } = await checkRateLimit(ip);

  if (!success) {
    return Response.json(
      { success: false, error: `Rate limit exceeded. Try again after ${new Date(reset * 1000).toISOString()}.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(reset - Math.floor(Date.now() / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { company } = body;

  if (!company || typeof company !== "string" || company.trim().length < 2) {
    return Response.json(
      { success: false, error: "Company name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const jobs = await fetchCompanyJobs(company.trim());

  if (jobs.length === 0) {
    return Response.json({
      success: true,
      data: {
        company: company.trim(),
        jobs: [],
        aiInsights: "No job listings found for this company. They may not be actively hiring, or the company name may not match listings exactly.",
        hiringSignals: [],
      },
    });
  }

  const hiringSignals = extractHiringSignals(jobs);

  const jobSummary = jobs
    .slice(0, 15)
    .map((j) => `- ${j.title} (${j.location}, ${j.employmentType}):\n  ${j.description.slice(0, 200)}`)
    .join("\n\n");

  let aiInsights = "AI analysis unavailable.";
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `You are a startup intelligence analyst. Analyze this company's current job listings and extract strategic intelligence.

Company: ${company.trim()}
Total open roles: ${jobs.length}

Job listings:
${jobSummary}

Provide a structured analysis:

1. **Growth Phase** — What stage is this company in based on hiring? (early-stage, scaling, late-stage, enterprise, etc.)
2. **Strategic Priorities** — What are they clearly building or expanding into based on these roles?
3. **Tech Stack Signals** — What technologies, platforms, or tools are mentioned in job descriptions?
4. **Team Expansion Areas** — Which departments/functions are growing fastest?
5. **Competitive Intelligence** — What does this hiring pattern reveal about their strategy, product direction, or market position?
6. **Hiring Urgency** — Are these signs of rapid scaling, steady growth, or reactive hiring?

Be concise and specific. Base everything on the actual job listings provided.`,
      maxOutputTokens: 1200,
    });
    aiInsights = text;
  } catch (err) {
    console.error("[linkedin] AI insights failed:", err instanceof Error ? err.message : err);
  }

  return Response.json(
    {
      success: true,
      data: {
        company: company.trim(),
        jobs,
        aiInsights,
        hiringSignals,
      },
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}
