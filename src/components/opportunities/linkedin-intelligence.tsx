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
  User,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { HiringSignal, LinkedInResult } from "@/app/api/linkedin/route";
import type { PeopleResult } from "@/app/api/linkedin-people/route";

type Tab = "jobs" | "people";

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
    <div className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5", SIGNAL_COLORS[signal.color] ?? "bg-white/5 text-foreground/60")}>
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
          <p className="text-[12px] font-semibold text-foreground/90 leading-snug">{job.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />{job.location}
            </span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-3xs text-muted-foreground">{job.employmentType}</span>
            {job.postedAt && <span className="text-3xs text-muted-foreground">{new Date(job.postedAt).toLocaleDateString()}</span>}
          </div>
        </div>
        {job.applyUrl && (
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1.5 text-micro font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors">
            Apply <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
      {job.description && (
        <div className="mt-2">
          <p className="text-[11px] leading-relaxed text-foreground/60">
            {expanded ? job.description : `${job.description.slice(0, 160)}...`}
          </p>
          <button onClick={() => setExpanded((p) => !p)} className="mt-1 text-micro text-indigo-400 hover:underline">
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-white/5 text-muted-foreground",
};

function PersonCard({ profile }: { profile: PeopleResult["profiles"][number] }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[12px] font-semibold text-foreground/90">{profile.name}</p>
              <span className={cn("rounded-full px-1.5 py-0.5 text-3xs font-semibold", CONFIDENCE_STYLE[profile.confidence ?? "medium"])}>
                {profile.confidence} confidence
              </span>
            </div>
            {profile.headline && (
              <p className="mt-0.5 text-[11px] leading-snug text-foreground/70">{profile.headline}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {profile.company && (
                <span className="text-[11px] text-muted-foreground">{profile.company}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />{profile.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1.5 text-micro font-medium text-blue-400 hover:bg-blue-500/20 transition-colors">
          Profile <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}

function JobsTab() {
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
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to fetch job listings");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job listings. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe, OpenAI, Notion, Figma"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/30 focus:outline-none" />
        </div>
        <button type="submit" disabled={!company.trim() || isLoading}
          className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Scanning...</> : <><TrendingUp className="h-4 w-4" />Analyze</>}
        </button>
      </form>

      {isLoading && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />Fetching live job listings &amp; running AI analysis...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {result.hiringSignals.length > 0 && (
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Hiring Signals</h3>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-micro font-medium text-indigo-400">{result.jobs.length} open roles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hiringSignals.map((s) => <SignalBadge key={s.label} signal={s} />)}
              </div>
            </div>
          )}
          <div className="glass gradient-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold">AI Hiring Intelligence</h3>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-micro font-medium text-violet-400">Powered by AI</span>
            </div>
            <div className="text-[12px] leading-relaxed text-foreground/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.aiInsights}</ReactMarkdown>
            </div>
          </div>
          {result.jobs.length > 0 ? (
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BriefcaseBusiness className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Job Listings</h3>
                <span className="text-2xs text-muted-foreground">{result.jobs.length} roles at {result.company}</span>
              </div>
              <div className="space-y-2">{result.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
            </div>
          ) : (
            <div className="glass gradient-border rounded-xl p-4 text-center">
              <p className="text-[12px] text-muted-foreground">No job listings found for <strong className="text-foreground">{result.company}</strong>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PeopleTab() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<PeopleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/linkedin-people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to search people");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "People search failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Satya Nadella, Jensen Huang, Sam Altman"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500/30 focus:outline-none" />
        </div>
        <button type="submit" disabled={!name.trim() || isLoading}
          className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Searching...</> : <><Search className="h-4 w-4" />Search</>}
        </button>
      </form>

      {isLoading && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />Finding LinkedIn profiles &amp; running AI analysis...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="glass gradient-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold">AI Profile Intelligence</h3>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-micro font-medium text-violet-400">Powered by AI</span>
            </div>
            <div className="text-[12px] leading-relaxed text-foreground/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.aiInsights}</ReactMarkdown>
            </div>
          </div>

          {result.profiles.length > 0 && (
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Profiles Found</h3>
                <span className="text-2xs text-muted-foreground">{result.profiles.length} result{result.profiles.length !== 1 ? "s" : ""} for &ldquo;{result.name}&rdquo;</span>
              </div>
              <div className="space-y-2">{result.profiles.map((p) => <PersonCard key={p.slug || p.name} profile={p} />)}</div>
            </div>
          )}

          {/* Always show direct LinkedIn search link */}
          <div className="glass gradient-border rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-foreground/90">Search LinkedIn directly</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {result.profiles.length === 0
                    ? "No AI results found — search LinkedIn to find this person manually."
                    : "Verify or find more profiles on LinkedIn."}
                </p>
              </div>
              <a
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(result.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-[12px] font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                Open LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LinkedInIntelligence() {
  const [activeTab, setActiveTab] = useState<Tab>("jobs");

  return (
    <div className="space-y-5">
      <div className="glass gradient-border rounded-xl p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">LinkedIn Intelligence</h2>
            <p className="text-2xs text-muted-foreground">
              Search job listings by company or find people by name
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1 mb-5">
          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[12px] font-medium transition-all",
              activeTab === "jobs"
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Job Search
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[12px] font-medium transition-all",
              activeTab === "people"
                ? "bg-blue-500/20 text-blue-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            People Search
          </button>
        </div>

        {activeTab === "jobs" ? <JobsTab /> : <PeopleTab />}
      </div>
    </div>
  );
}
