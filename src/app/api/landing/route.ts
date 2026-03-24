import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export interface LandingPageData {
  companyName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtext: string;
  ctaButton: string;
  features: { title: string; description: string; icon: string }[];
  howItWorks: { step: string; title: string; description: string }[];
  socialProof: string;
  faqItems: { question: string; answer: string }[];
  footerTagline: string;
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { idea, name } = body;

  if (!idea || typeof idea !== "string" || idea.length < 5) {
    return Response.json(
      { success: false, error: "Idea must be at least 5 characters" },
      { status: 400 }
    );
  }

  let text: string;
  try {
    const result = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `Generate the complete text content for a startup landing page:

Startup idea: "${idea}"
Company name: ${name || "Generate a name"}

Provide these sections as a JSON object (return ONLY valid JSON, no markdown):
{
  "companyName": "string",
  "tagline": "string (max 10 words)",
  "heroHeadline": "string (compelling, max 15 words)",
  "heroSubtext": "string (2 sentences explaining the value)",
  "ctaButton": "string (e.g., 'Get Early Access')",
  "features": [
    {"title": "string", "description": "string", "icon": "string (emoji)"}
  ],
  "howItWorks": [
    {"step": "1", "title": "string", "description": "string"}
  ],
  "socialProof": "string (a compelling stat or quote)",
  "faqItems": [
    {"question": "string", "answer": "string"}
  ],
  "footerTagline": "string"
}`,
      maxTokens: 1500,
    });
    text = result.text;
  } catch {
    return Response.json({ success: false, error: "AI service temporarily unavailable. Please try again." }, { status: 503 });
  }

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let landingData: LandingPageData;
  try {
    landingData = JSON.parse(cleaned);
  } catch {
    return Response.json(
      { success: false, error: "Failed to parse AI response as JSON" },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    data: landingData,
  });
}
