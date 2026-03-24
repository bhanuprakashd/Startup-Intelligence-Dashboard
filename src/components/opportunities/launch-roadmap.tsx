"use client";

import {
  AlertTriangle,
  Flag,
  Loader2,
  Map,
  Rocket,
  Target,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RoadmapResult {
  idea: string;
  skills: string;
  budget: string;
  roadmap: string;
}

const BUDGET_OPTIONS = [
  { value: "$0 - bootstrapped", label: "$0 — Bootstrapped" },
  { value: "$1,000", label: "$1,000" },
  { value: "$5,000", label: "$5,000" },
  { value: "$10,000+", label: "$10,000+" },
];

const PHASE_CONFIGS = [
  {
    label: "Phase 1: Validate",
    weeks: "Weeks 1–4",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    dot: "bg-amber-400",
    icon: Target,
  },
  {
    label: "Phase 2: Build MVP",
    weeks: "Weeks 5–8",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    dot: "bg-blue-400",
    icon: Rocket,
  },
  {
    label: "Phase 3: Launch & Get Customers",
    weeks: "Weeks 9–12",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    dot: "bg-emerald-400",
    icon: Flag,
  },
];

function parsePhases(roadmap: string): { summary: string; phases: string[][] } {
  const lines = roadmap.split("\n");
  const phaseKeywords = [
    "phase 1",
    "phase 2",
    "phase 3",
  ];

  const phaseIndices: number[] = [];
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    if (phaseKeywords.some((kw) => lower.includes(kw))) {
      phaseIndices.push(i);
    }
  });

  if (phaseIndices.length < 3) {
    // Fallback: split roughly into thirds
    const third = Math.floor(lines.length / 3);
    return {
      summary: "",
      phases: [
        lines.slice(0, third),
        lines.slice(third, third * 2),
        lines.slice(third * 2),
      ],
    };
  }

  const phase1Lines = lines.slice(phaseIndices[0], phaseIndices[1]);
  const phase2Lines = lines.slice(phaseIndices[1], phaseIndices[2]);
  const phase3Lines = lines.slice(phaseIndices[2]);

  // Anything before phase 1 is a preamble/summary
  const summaryLines = lines.slice(0, phaseIndices[0]);

  return {
    summary: summaryLines.join("\n").trim(),
    phases: [phase1Lines, phase2Lines, phase3Lines],
  };
}

function RoadmapText({ text }: { text: string }) {
  return (
    <div className="text-[11px] leading-relaxed text-foreground/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_h1]:text-[13px] [&_h1]:font-bold [&_h1]:mb-1 [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_hr]:my-2 [&_hr]:border-white/10">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function LaunchRoadmap() {
  const [idea, setIdea] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("$0 - bootstrapped");
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          skills: skills.trim() || undefined,
          budget,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg: string;
        try { errMsg = JSON.parse(errText).error ?? errText; } catch { errMsg = errText; }
        throw new Error(errMsg.slice(0, 200));
      }

      const json = await res.json();
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const parsed = result ? parsePhases(result.roadmap) : null;

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Map className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">90-Day Launch Roadmap</h2>
            <p className="text-[10px] text-muted-foreground">
              Input your idea, skills &amp; budget — AI builds a week-by-week action plan to launch
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          {/* Idea input */}
          <div className="relative">
            <Map className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. AI-powered meal planner for busy parents"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none"
              required
            />
          </div>

          {/* Skills + budget row */}
          <div className="flex gap-3">
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (e.g. Python developer, marketer)"
              className="h-9 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none"
            />
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12px] text-foreground focus:border-emerald-500/30 focus:outline-none"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your personalized 90-day plan...
              </>
            ) : (
              <>
                <Map className="h-4 w-4" />
                Generate Roadmap
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-2/3 animate-shimmer rounded-full bg-emerald-500/30" />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && parsed && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary / preamble */}
          {parsed.summary && (
            <div className="glass gradient-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Map className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Your 90-Day Roadmap</h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                  AI Generated
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/70">
                {parsed.summary}
              </p>
            </div>
          )}

          {/* Phase cards */}
          {parsed.phases.map((phaseLines, phaseIndex) => {
            const cfg = PHASE_CONFIGS[phaseIndex];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div key={phaseIndex} className="glass gradient-border rounded-xl overflow-hidden">
                {/* Phase header */}
                <div className={`flex items-center gap-3 px-5 py-3 ${cfg.bg} border-b ${cfg.border}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg} border ${cfg.border}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-[13px] font-bold ${cfg.color}`}>{cfg.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{cfg.weeks}</p>
                  </div>
                  {/* Timeline dot connector */}
                  <div className="ml-auto flex items-center gap-1">
                    {[0, 1, 2, 3].map((w) => (
                      <div key={w} className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${cfg.dot} opacity-70`} />
                        {w < 3 && <div className="h-px w-4 bg-white/10" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase content */}
                <div className="p-5">
                  <RoadmapText text={phaseLines.join("\n")} />
                </div>
              </div>
            );
          })}

          {/* Raw full roadmap fallback if parsing produced no phases */}
          {parsed.phases.every((p) => p.length === 0) && (
            <div className="glass gradient-border rounded-xl p-5">
              <RoadmapText text={result.roadmap} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
