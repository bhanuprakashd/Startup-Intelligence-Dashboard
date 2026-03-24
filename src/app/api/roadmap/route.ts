import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { idea, skills, budget } = body;

  if (!idea || typeof idea !== "string" || idea.length < 5) {
    return Response.json(
      { success: false, error: "Idea must be at least 5 characters" },
      { status: 400 }
    );
  }

  let roadmap: string;
  try {
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      prompt: `Create a detailed 90-day launch roadmap for this startup:

Idea: "${idea}"
Founder skills: ${skills || "Technical (software developer)"}
Budget: ${budget || "$0 - bootstrapped"}

Structure the plan as 12 weeks in 3 phases:

**Phase 1: Validate (Weeks 1-4)**
For each week, provide:
- Week N: [Title]
- Goal: [What to achieve]
- Tasks: [3-5 specific actionable tasks]
- Milestone: [How you know this week succeeded]
- Tools: [Free tools to use]

**Phase 2: Build MVP (Weeks 5-8)**
Same format per week.

**Phase 3: Launch & Get First Customers (Weeks 9-12)**
Same format per week.

End with:
- **Total estimated cost** (use free tools where possible)
- **Key risk** at each phase and mitigation
- **First revenue target** and when to expect it

Be extremely specific and actionable. Every task should be something the founder can DO today. No vague advice. Use real tool names, real platform names, real strategies.`,
      maxTokens: 3000,
    });
    roadmap = text;
  } catch {
    return Response.json({ success: false, error: "AI service temporarily unavailable. Please try again." }, { status: 503 });
  }

  return Response.json({
    success: true,
    data: {
      idea,
      skills: skills || "Technical (software developer)",
      budget: budget || "$0 - bootstrapped",
      roadmap,
    },
  });
}
