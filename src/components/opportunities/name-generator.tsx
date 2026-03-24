"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

interface NameResult {
  name: string;
  reason: string;
  domain: string;
  available: boolean;
}

interface NamesData {
  idea: string;
  names: NameResult[];
}

function NameCard({ item }: { item: NameResult }) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-4 flex flex-col gap-3 transition-all duration-300",
        item.available
          ? "border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.08)]"
          : "border border-white/[0.06]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold tracking-tight text-foreground leading-tight">
          {item.name}
        </h3>
        {item.available ? (
          <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-micro font-semibold uppercase text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Available
          </span>
        ) : (
          <span className="shrink-0 flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-micro font-semibold uppercase text-red-400">
            <XCircle className="h-2.5 w-2.5" />
            Taken
          </span>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {item.reason}
      </p>

      <div className="flex items-center gap-1.5 mt-auto">
        <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
        <span
          className={cn(
            "text-[11px] font-mono",
            item.available ? "text-emerald-400" : "text-muted-foreground/60 line-through"
          )}
        >
          {item.domain}
        </span>
      </div>
    </div>
  );
}

export function NameGenerator() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<NamesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/names", {
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
      setError(err instanceof Error ? err.message : "Name generation failed. Check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableCount = result?.names.filter((n) => n.available).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Startup Name Generator</h2>
            <p className="text-2xs text-muted-foreground">
              Describe your idea — AI generates 10 names and checks .com availability live
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-3">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. AI-powered meal planning for athletes"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Names
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI is brainstorming names... Checking domain availability...
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-violet-500/30" />
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
          {/* Summary bar */}
          <div className="glass gradient-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold">
                {result.names.length} names generated
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-micro font-semibold text-emerald-400">
                {availableCount} .com available
              </span>
            </div>
            <span className="text-2xs text-muted-foreground truncate max-w-[200px]">
              for &quot;{result.idea}&quot;
            </span>
          </div>

          {/* Name cards grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {result.names.map((item, i) => (
              <NameCard key={i} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
