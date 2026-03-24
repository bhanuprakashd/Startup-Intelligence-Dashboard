"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Loader2,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

interface Signal {
  category: string;
  source: string;
  description: string;
  strength: number;
  url: string;
}

interface ValidationResult {
  idea: string;
  overallScore: number;
  confidence: "high" | "medium" | "low";
  scores: {
    demand: number;
    competition: number;
    innovation: number;
    community: number;
  };
  signalCount: number;
  sourcesQueried: number;
  sourcesSucceeded: number;
  categoriesCovered: number;
  aiAnalysis: string;
  signals: Signal[];
}

function ScoreRing({
  score,
  size = 80,
  label,
}: {
  score: number;
  size?: number;
  label: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const catColors: Record<string, string> = {
    demand: "text-emerald-400 bg-emerald-400/10",
    competition: "text-amber-400 bg-amber-400/10",
    innovation: "text-blue-400 bg-blue-400/10",
    community: "text-violet-400 bg-violet-400/10",
  };

  return (
    <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase",
          catColors[signal.category] ?? "text-muted-foreground bg-white/5"
        )}
      >
        {signal.category}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-relaxed text-foreground/80">
          {signal.description}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">
            via {signal.source}
          </span>
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-indigo-400"
              style={{ width: `${signal.strength * 100}%` }}
            />
          </div>
          {signal.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-indigo-400 hover:underline"
            >
              <ExternalLink className="inline h-2.5 w-2.5" /> source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function IdeaValidator() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Idea Validator</h2>
            <p className="text-[10px] text-muted-foreground">
              Describe your startup idea — we&apos;ll scan Reddit, GitHub,
              HackerNews &amp; ProductHunt in real-time
            </p>
          </div>
        </div>

        <form onSubmit={handleValidate} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. AI-powered compliance tool for small businesses"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Validate
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Querying Reddit, GitHub, HackerNews, ProductHunt...
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-indigo-500/30" />
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
          {/* Score Overview */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Viability Report</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                    result.confidence === "high"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : result.confidence === "medium"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-red-400/10 text-red-400"
                  )}
                >
                  {result.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {result.sourcesSucceeded}/{result.sourcesQueried} sources |{" "}
                {result.signalCount} signals
              </span>
            </div>

            {/* Score rings */}
            <div className="flex justify-center gap-6">
              <ScoreRing score={result.overallScore} size={90} label="Overall" />
              <ScoreRing score={result.scores.demand} size={70} label="Demand" />
              <ScoreRing score={result.scores.competition} size={70} label="Low Competition" />
              <ScoreRing score={result.scores.innovation} size={70} label="Innovation" />
              <ScoreRing score={result.scores.community} size={70} label="Community" />
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

          {/* Signal Evidence */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold">Evidence Chain</h3>
              <span className="text-[10px] text-muted-foreground">
                {result.signals.length} live signals from{" "}
                {result.categoriesCovered} categories
              </span>
            </div>
            <div className="space-y-2">
              {result.signals.map((signal, i) => (
                <SignalCard key={i} signal={signal} />
              ))}
              {result.signals.length === 0 && (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No strong signals found. Try a more specific idea description.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
