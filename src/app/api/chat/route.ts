import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `You are WSI Copilot — an AI startup intelligence assistant. You help founders and entrepreneurs with:

1. Startup idea discovery and validation
2. Market analysis and sizing
3. Competitive landscape analysis
4. Investor matching
5. Industry trends and signals

Rules:
- Be concise and data-driven. Lead with insights, not fluff.
- When discussing markets, cite specific numbers when you can.
- Be honest about uncertainty — say "I don't have live data on this" when relevant.
- Format responses with markdown: use bold for key points, bullet lists for data.
- If the user describes a startup idea, analyze it across: demand, competition, timing, feasibility.
- Never make up funding amounts, company names, or investor names. Say "based on general patterns" when speculating.
- You are NOT a general chatbot. Keep responses focused on startups, markets, and entrepreneurship.

You are currently helping the user explore the WSI platform. They can see a dashboard with live funding feeds, startup ecosystem maps, news, and opportunity analysis.`;

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { messages } = body;

  try {
    const result = streamText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      system: SYSTEM_PROMPT,
      messages,
    });
    return result.toTextStreamResponse();
  } catch {
    return Response.json({ success: false, error: "AI service unavailable" }, { status: 503 });
  }
}
