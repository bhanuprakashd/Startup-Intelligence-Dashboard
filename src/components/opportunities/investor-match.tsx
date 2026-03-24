"use client";

import {
  AlertTriangle,
  DollarSign,
  Loader2,
  MapPin,
  Rocket,
  Zap,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InvestorMatchResult {
  idea: string;
  sector: string;
  stage: string;
  location: string;
  aiAnalysis: string;
  sourcesQueried: number;
  sourcesSucceeded: number;
}

const STAGES = [
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c", label: "Series C" },
  { value: "growth", label: "Growth" },
];

export function InvestorMatch() {
  const [idea, setIdea] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("seed");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<InvestorMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = idea.trim() && sector.trim();

  const handleMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          sector: sector.trim(),
          stage,
          location: location.trim(),
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

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Investor Match</h2>
            <p className="text-[10px] text-muted-foreground">
              Describe your startup — we&apos;ll find the best-fit investors for
              your stage, sector, and location
            </p>
          </div>
        </div>

        <form onSubmit={handleMatch} className="space-y-3">
          {/* Idea field */}
          <div>
            <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Startup Idea
            </label>
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. AI-powered legal document review for SMBs"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none"
            />
          </div>

          {/* Sector + Stage row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Sector
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g. LegalTech, FinTech, SaaS"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground focus:border-emerald-500/30 focus:outline-none appearance-none cursor-pointer"
              >
                {STAGES.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                    className="bg-zinc-900 text-foreground"
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Button row */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Location <span className="normal-case">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, London, Remote"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Find Investors
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching investor databases and funding records...
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-emerald-500/30" />
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
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Match Summary */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Investor Match Results</h3>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {result.sourcesSucceeded}/{result.sourcesQueried} sources
              </span>
            </div>

            {/* Match metadata chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                {STAGES.find((s) => s.value === result.stage)?.label ?? result.stage}
              </span>
              <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-[10px] font-medium text-teal-400">
                {result.sector}
              </span>
              {result.location && (
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-400">
                  {result.location}
                </span>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold">AI Analysis</h3>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-medium text-violet-400">
                Powered by AI
              </span>
            </div>
            <div className="text-[12px] leading-relaxed text-foreground/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_h1]:text-sm [&_h1]:font-bold [&_h1]:mb-1 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:text-[11px] [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-foreground/70">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.aiAnalysis}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
