"use client";

import {
  AlertTriangle,
  BriefcaseBusiness,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { HiringSignal, LinkedInResult } from "@/app/api/linkedin/route";

const SIGNAL_COLORS: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  violet: "bg-violet-500/10 text-violet-400",
  amber: "bg-amber-500/10 text-amber-400",
  rose: "bg-rose-500/10 text-rose-400",
  cyan: "bg-cyan-500/10 text-cyan-400",
};

function SignalBadge({ signal }: { signal: HiringSignal }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5",
        SIGNAL_COLORS[signal.color] ?? "bg-white/5 text-foreground/60"
      )}
    >
      <span className="text-[12px] font-semibold">{signal.label}</span>
      <span className="text-micro opacity-70">{signal.count} role{signal.count !== 1 ? "s" : ""}</span>
    </div>
  );
}

function JobCard({ job }: { job: LinkedInResult["jobs"][number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-foreground/90 leading-snug">
            {job.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-3xs text-muted-foreground">
              {job.employmentType}
            </span>
            {job.postedAt && (
              <span className="text-3xs text-muted-foreground">
                {new Date(job.postedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1.5 text-micro font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            Apply
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>

      {job.description && (
        <div className="mt-2">
          <p className="text-[11px] leading-relaxed text-foreground/60">
            {expanded ? job.description : `${job.description.slice(0, 160)}...`}
          </p>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="mt-1 text-micro text-indigo-400 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}

export function LinkedInIntelligence() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to fetch job listings");
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job listings. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">LinkedIn Intelligence</h2>
            <p className="text-2xs text-muted-foreground">
              Enter a company name to see real job listings + AI hiring signal analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Notion, Figma"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!company.trim() || isLoading}
            className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Analyze
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Fetching live job listings &amp; running AI analysis...
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Hiring Signals */}
          {result.hiringSignals.length > 0 && (
            <div className="glass gradient-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Hiring Signals</h3>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-micro font-medium text-indigo-400">
                  {result.jobs.length} open roles
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hiringSignals.map((signal) => (
                  <SignalBadge key={signal.label} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="glass gradient-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold">AI Hiring Intelligence</h3>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-micro font-medium text-violet-400">
                Powered by AI
              </span>
            </div>
            <div className="text-[12px] leading-relaxed text-foreground/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.aiInsights}
              </ReactMarkdown>
            </div>
          </div>

          {/* Job Listings */}
          {result.jobs.length > 0 && (
            <div className="glass gradient-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BriefcaseBusiness className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Job Listings</h3>
                <span className="text-2xs text-muted-foreground">
                  {result.jobs.length} roles at {result.company}
                </span>
              </div>
              <div className="space-y-2">
                {result.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {result.jobs.length === 0 && (
            <div className="glass gradient-border rounded-xl p-5 text-center">
              <p className="text-[12px] text-muted-foreground">
                No job listings found for <strong className="text-foreground">{result.company}</strong>.
                They may not be actively hiring, or try a slightly different company name.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
