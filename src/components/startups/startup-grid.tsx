"use client";

import { ExternalLink, Loader2, MessageSquare, Rocket, ThumbsUp, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLiveHN } from "@/hooks/use-live-hn";
import { cn } from "@/lib/utils";

const CARD_COLORS = [
  "#8B5CF6", "#10B981", "#EF4444", "#6366F1",
  "#F59E0B", "#F97316", "#84CC16", "#A855F7",
  "#22D3EE", "#EC4899", "#14B8A6", "#F43F5E",
  "#3B82F6", "#8B5CF6", "#10B981",
];

export function StartupGrid() {
  const { data: stories, isLoading } = useLiveHN();

  return (
    <div className="glass gradient-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Trending on Hacker News</h3>
          {stories && stories.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-indigo-500/10 text-2xs text-indigo-400"
            >
              Top {stories.length}
            </Badge>
          )}
        </div>
        <span className="text-2xs text-muted-foreground">
          Ranked by HN score
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Fetching trending stories…</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!stories || stories.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <TrendingUp className="h-8 w-8 opacity-30" />
          <p className="text-sm">No trending startups found</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && stories && stories.length > 0 && (
        <div className="grid gap-px bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const initial = story.title.charAt(0).toUpperCase();
            return (
              <div
                key={story.id}
                className="group relative flex flex-col gap-3 bg-[#111118] p-4 transition-all hover:bg-white/[0.03]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Icon + title */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-[11px] font-semibold leading-snug">
                        {story.title}
                      </h4>
                      <p className="mt-0.5 text-2xs text-muted-foreground">
                        by {story.author}
                      </p>
                    </div>
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>

                {/* Source tag */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-micro font-medium"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {story.source}
                  </span>
                </div>

                {/* Metrics row */}
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-micro text-muted-foreground">Score</p>
                    <p className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
                      <ThumbsUp className="h-2.5 w-2.5" />
                      {story.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-micro text-muted-foreground">Comments</p>
                    <p className="flex items-center gap-0.5 text-[11px] font-semibold">
                      <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" />
                      {story.comments}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
