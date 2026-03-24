"use client";

import {
  AlertTriangle,
  ExternalLink,
  Eye,
  Loader2,
  Rocket,
  Scan,
  Zap,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Competitor {
  name: string;
  source: string;
  description: string;
  url: string;
}

interface XRayResult {
  idea: string;
  aiAnalysis: string;
  competitors: Competitor[];
  sourcesQueried: number;
  sourcesSucceeded: number;
}

const SOURCE_COLORS: Record<string, string> = {
  reddit: "text-orange-400 bg-orange-400/10",
  github: "text-slate-300 bg-slate-300/10",
  producthunt: "text-rose-400 bg-rose-400/10",
  hackernews: "text-amber-400 bg-amber-400/10",
};

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const sourceKey = competitor.source.toLowerCase().replace(/\s/g, "");
  const colorClass =
    SOURCE_COLORS[sourceKey] ?? "text-indigo-400 bg-indigo-400/10";

  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-3xs font-semibold uppercase",
          colorClass
        )}
      >
        {competitor.source}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-foreground/90">
          {competitor.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/70">
          {competitor.description}
        </p>
        {competitor.url && (
          <a
            href={competitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-micro text-indigo-400 hover:underline"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View source
          </a>
        )}
      </div>
    </div>
  );
}

export function CompetitiveXRay() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<XRayResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/xray", {
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
      setError(err instanceof Error ? err.message : "X-Ray scan failed. Check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Eye className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Competitive X-Ray</h2>
            <p className="text-2xs text-muted-foreground">
              Enter your idea or sector — we&apos;ll scan Reddit, GitHub,
              ProductHunt &amp; HackerNews for competitors
            </p>
          </div>
        </div>

        <form onSubmit={handleScan} className="flex gap-3">
          <div className="flex-1 relative">
            <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. AI-powered invoice automation for freelancers"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Scan
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Scanning Reddit, GitHub, ProductHunt, HackerNews...
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-cyan-500/30" />
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
          {/* Competitors Found */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold">Competitors Found</h3>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-micro font-medium text-cyan-400">
                  {result.competitors.length} found
                </span>
              </div>
              <span className="text-2xs text-muted-foreground">
                {result.sourcesSucceeded}/{result.sourcesQueried} sources
              </span>
            </div>

            <div className="space-y-2">
              {result.competitors.map((competitor, i) => (
                <CompetitorCard key={i} competitor={competitor} />
              ))}
              {result.competitors.length === 0 && (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No direct competitors found. This could be a blue ocean opportunity!
                </p>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold">AI Analysis</h3>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-micro font-medium text-violet-400">
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
