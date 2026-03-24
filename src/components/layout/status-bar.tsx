"use client";

import { Activity, Circle, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { DATA_SOURCES } from "@/lib/constants";

export function StatusBar({
  lastRefreshed,
  nextRefreshIn,
}: {
  readonly lastRefreshed: Date | null;
  readonly nextRefreshIn: number;
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastRefreshed) return;
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshed.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const nextSec = Math.max(0, Math.ceil(nextRefreshIn / 1000));

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] px-4 py-1.5">
      <div className="flex items-center justify-between text-2xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-emerald-400" />
            Updated {lastRefreshed ? `${secondsAgo}s ago` : "..."}
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Database className="h-3 w-3" />
            Sources:
          </span>
          <div className="hidden items-center gap-2.5 sm:flex">
            {DATA_SOURCES.map((source) => (
              <span key={source.id} className="flex items-center gap-1">
                <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
                <span className="text-micro">{source.name}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Next refresh:</span>
          <span className="font-mono font-semibold text-foreground/80">
            {nextSec}s
          </span>
          {/* Progress bar */}
          <div className="ml-1 h-1 w-16 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-indigo-400/50 transition-all"
              style={{ width: `${(1 - nextRefreshIn / 60000) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
