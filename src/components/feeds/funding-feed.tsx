"use client";

import { Clock, ExternalLink, Loader2, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { REFRESH_INTERVALS, timeAgo } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RSSItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export function FundingFeed() {
  const { data: items, isLoading, error, refetch } = useQuery<RSSItem[]>({
    queryKey: ["live-funding"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/funding");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.funding,
    staleTime: 30_000,
  });

  return (
    <div className="glass gradient-border flex flex-col rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold">Live Funding Feed</h3>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-micro font-medium text-emerald-400">LIVE</span>
          </span>
        </div>
        <span className="text-2xs text-muted-foreground">
          Source: TechCrunch Venture RSS
        </span>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-[11px] text-muted-foreground">Fetching live funding news...</span>
        </div>
      ) : error || !items?.length ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <p className="text-[11px] text-muted-foreground">Unable to fetch live funding data. Will retry automatically.</p>
          <button onClick={() => refetch()} className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors">Retry now</button>
        </div>
      ) : (
        <ScrollArea className="h-[380px]">
          <div className="divide-y divide-white/[0.03]">
            {items.map((item, i) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.03]",
                  i === 0 && "animate-fade-in-up"
                )}
              >
                {/* Source avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-400">
                  {item.source.charAt(0)}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {item.description.replace(/<[^>]*>/g, "").slice(0, 120)}
                  </p>
                </div>

                {/* Meta */}
                <div className="shrink-0 text-right">
                  <span className="text-2xs font-medium text-foreground/60">
                    {item.source}
                  </span>
                  <div className="mt-0.5 flex items-center justify-end gap-1.5">
                    <span className="flex items-center gap-0.5 text-micro text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.publishedAt)}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
