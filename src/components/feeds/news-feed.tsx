"use client";

import { ArrowUpRight, Clock, ExternalLink, Loader2, Newspaper, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS, timeAgo } from "@/lib/constants";

interface HNItem {
  id: string;
  title: string;
  url: string;
  source: string;
  score: number;
  author: string;
  comments: number;
  publishedAt: string;
  hnUrl: string;
}

function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("gpt") || lower.includes("model")) return "AI";
  if (lower.includes("fintech") || lower.includes("banking") || lower.includes("payment")) return "FinTech";
  if (lower.includes("health") || lower.includes("bio") || lower.includes("medical")) return "HealthTech";
  if (lower.includes("climate") || lower.includes("energy") || lower.includes("green") || lower.includes("ev")) return "CleanTech";
  if (lower.includes("crypto") || lower.includes("web3") || lower.includes("blockchain")) return "Web3";
  if (lower.includes("saas") || lower.includes("cloud")) return "SaaS";
  if (lower.includes("yc") || lower.includes("launch") || lower.includes("startup")) return "Startup";
  if (lower.includes("funding") || lower.includes("raise") || lower.includes("series") || lower.includes("seed")) return "Funding";
  return "Tech";
}

const CAT_COLORS: Record<string, string> = {
  AI: "text-violet-400 bg-violet-400/10",
  FinTech: "text-amber-400 bg-amber-400/10",
  HealthTech: "text-red-400 bg-red-400/10",
  CleanTech: "text-emerald-400 bg-emerald-400/10",
  Web3: "text-pink-400 bg-pink-400/10",
  SaaS: "text-blue-400 bg-blue-400/10",
  Startup: "text-indigo-400 bg-indigo-400/10",
  Funding: "text-cyan-400 bg-cyan-400/10",
  Tech: "text-muted-foreground bg-white/5",
};

export function NewsFeed() {
  const { data: stories, isLoading, error, refetch } = useQuery<HNItem[]>({
    queryKey: ["live-hn"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/hackernews");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: 60_000,
  });

  return (
    <div className="glass gradient-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Live Intelligence Feed</h3>
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-micro font-medium text-blue-400">LIVE</span>
          </span>
        </div>
        <span className="text-2xs text-muted-foreground">
          Source: Hacker News (auto-refresh)
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-[11px] text-muted-foreground">Fetching live stories...</span>
        </div>
      ) : error || !stories?.length ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <p className="text-[11px] text-muted-foreground">Unable to fetch live data. Will retry automatically.</p>
          <button onClick={() => refetch()} className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors">Retry now</button>
        </div>
      ) : (
        <div className="grid gap-px bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 9).map((story) => {
            const category = detectCategory(story.title);
            return (
              <a
                key={story.id}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-2.5 bg-[#111118] p-4 transition-all hover:bg-white/[0.03]"
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-micro font-medium ${CAT_COLORS[category] ?? CAT_COLORS.Tech}`}
                  >
                    {category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-micro font-semibold text-emerald-400">
                      {story.score} pts
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="line-clamp-2 text-[13px] font-medium leading-snug">
                  {story.title}
                </h4>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                    <span className="font-medium text-foreground/60">
                      {story.source}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(story.publishedAt)}
                    </span>
                    <span>{story.comments} comments</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
