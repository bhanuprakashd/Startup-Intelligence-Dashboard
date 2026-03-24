"use client";

import {
  Activity,
  Bot,
  Globe,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Sun,
  Wifi,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/constants";

const TICKER_DATA = [
  { company: "NeuralFlow AI", amount: 125_000_000, stage: "B", delta: 12.5 },
  { company: "GreenCharge", amount: 45_000_000, stage: "A", delta: 8.3 },
  { company: "MedVault", amount: 18_000_000, stage: "Seed", delta: -2.1 },
  { company: "QuantumSecure", amount: 72_000_000, stage: "A", delta: 15.7 },
  { company: "EduSpark", amount: 8_000_000, stage: "Seed", delta: 5.4 },
  { company: "FinLedger", amount: 200_000_000, stage: "C", delta: 22.0 },
  { company: "RoboHarvest", amount: 30_000_000, stage: "A", delta: -1.8 },
  { company: "SpaceLink", amount: 95_000_000, stage: "B", delta: 9.2 },
  { company: "CyberShield", amount: 55_000_000, stage: "B", delta: 18.4 },
  { company: "AgriBot", amount: 12_000_000, stage: "Seed", delta: 6.7 },
];

export function Header({
  onRefresh,
  isRefreshing,
  onSearchOpen,
  onCopilotToggle,
  isCopilotOpen,
}: {
  readonly onRefresh: () => void;
  readonly isRefreshing: boolean;
  readonly onSearchOpen: () => void;
  readonly onCopilotToggle: () => void;
  readonly isCopilotOpen: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <header className="sticky top-0 z-50 border-b border-border">
      {/* Top bar */}
      <div className="glass-strong flex h-12 items-center gap-3 px-4 lg:px-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Globe className="h-4 w-4 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 live-dot" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">WSI</span>
            <span className="hidden text-micro uppercase tracking-[0.2em] text-muted-foreground lg:inline">
              World Startup Intelligence
            </span>
          </div>
        </div>

        {/* Connection status */}
        <div className="ml-2 hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 md:flex">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span className="text-2xs font-medium text-emerald-400">LIVE</span>
        </div>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="ml-auto flex h-8 w-56 items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 text-xs text-muted-foreground transition-all hover:border-white/10 hover:bg-white/[0.06] lg:w-72"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search startups, markets...</span>
          <kbd className="ml-auto hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-micro font-mono text-muted-foreground sm:inline">
            /K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Copilot toggle */}
          <button
            onClick={onCopilotToggle}
            aria-label="Toggle AI Copilot"
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-medium transition-all ${
              isCopilotOpen
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-indigo-500/20 hover:text-foreground"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Live clock */}
          {mounted && (
            <div className="mr-2 hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground md:flex">
              <Activity className="h-3 w-3 text-emerald-400" />
              {time} UTC
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh data"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Ticker bar */}
      <div className="relative h-7 overflow-hidden border-t border-border bg-black/20">
        <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent" />

        <div className="flex h-full items-center animate-ticker">
          {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
            <div
              key={`${item.company}-${i}`}
              className="flex shrink-0 items-center gap-2 px-4"
            >
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-[11px] font-medium text-foreground/80">
                {item.company}
              </span>
              <span className="text-[11px] font-semibold text-indigo-400">
                {formatCurrency(item.amount)}
              </span>
              <span className="rounded bg-white/5 px-1 py-0.5 text-micro text-muted-foreground">
                {item.stage}
              </span>
              <span
                className={`text-2xs font-medium ${
                  item.delta >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.delta >= 0 ? "+" : ""}
                {item.delta}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
