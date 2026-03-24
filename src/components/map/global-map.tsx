"use client";

import { Globe2, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ECOSYSTEMS = [
  { city: "San Francisco", country: "US", startups: 12840, funding: 89_200_000_000, growth: 8.2, rank: 1, x: 15, y: 40, topSectors: ["AI", "SaaS", "FinTech"] },
  { city: "New York", country: "US", startups: 9320, funding: 52_100_000_000, growth: 6.5, rank: 2, x: 25, y: 38, topSectors: ["FinTech", "Media", "HealthTech"] },
  { city: "London", country: "GB", startups: 8150, funding: 41_300_000_000, growth: 7.1, rank: 3, x: 47, y: 30, topSectors: ["FinTech", "AI", "CleanTech"] },
  { city: "Beijing", country: "CN", startups: 7600, funding: 38_700_000_000, growth: 5.8, rank: 4, x: 77, y: 36, topSectors: ["AI", "EV", "BioTech"] },
  { city: "Bangalore", country: "IN", startups: 6200, funding: 28_400_000_000, growth: 12.4, rank: 5, x: 70, y: 52, topSectors: ["SaaS", "AI", "FinTech"] },
  { city: "Berlin", country: "DE", startups: 4800, funding: 19_600_000_000, growth: 9.3, rank: 6, x: 51, y: 29, topSectors: ["Mobility", "FinTech", "AI"] },
  { city: "Singapore", country: "SG", startups: 4200, funding: 16_800_000_000, growth: 11.2, rank: 7, x: 77, y: 58, topSectors: ["FinTech", "Logistics", "AI"] },
  { city: "Tel Aviv", country: "IL", startups: 3900, funding: 15_200_000_000, growth: 6.8, rank: 8, x: 55, y: 42, topSectors: ["Cybersecurity", "AI", "AgriTech"] },
  { city: "Shanghai", country: "CN", startups: 3700, funding: 14_100_000_000, growth: 4.2, rank: 9, x: 82, y: 40, topSectors: ["FinTech", "AI", "EV"] },
  { city: "Paris", country: "FR", startups: 3500, funding: 12_800_000_000, growth: 10.1, rank: 10, x: 48, y: 32, topSectors: ["AI", "CleanTech", "HealthTech"] },
  { city: "Tokyo", country: "JP", startups: 3200, funding: 11_500_000_000, growth: 3.8, rank: 11, x: 87, y: 36, topSectors: ["Robotics", "AI", "Gaming"] },
  { city: "Sao Paulo", country: "BR", startups: 2800, funding: 9_300_000_000, growth: 14.6, rank: 12, x: 32, y: 67, topSectors: ["FinTech", "EdTech", "Logistics"] },
  { city: "Stockholm", country: "SE", startups: 2600, funding: 8_200_000_000, growth: 7.5, rank: 13, x: 52, y: 24, topSectors: ["FinTech", "Gaming", "CleanTech"] },
  { city: "Toronto", country: "CA", startups: 2400, funding: 7_800_000_000, growth: 8.9, rank: 14, x: 23, y: 33, topSectors: ["AI", "FinTech", "HealthTech"] },
  { city: "Seoul", country: "KR", startups: 2200, funding: 6_900_000_000, growth: 5.6, rank: 15, x: 84, y: 36, topSectors: ["Gaming", "AI", "EV"] },
  { city: "Dubai", country: "AE", startups: 1800, funding: 5_400_000_000, growth: 18.2, rank: 16, x: 60, y: 48, topSectors: ["FinTech", "PropTech", "Logistics"] },
  { city: "Lagos", country: "NG", startups: 1200, funding: 2_100_000_000, growth: 22.5, rank: 17, x: 46, y: 56, topSectors: ["FinTech", "AgriTech", "EdTech"] },
  { city: "Nairobi", country: "KE", startups: 900, funding: 1_400_000_000, growth: 19.8, rank: 18, x: 56, y: 58, topSectors: ["FinTech", "AgriTech", "CleanTech"] },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [2, 5], [2, 9], [3, 8], [4, 6], [1, 13], [6, 3],
  [7, 2], [5, 12], [11, 1], [16, 17],
];

interface EcoPopupData {
  readonly city: string;
  readonly country: string;
  readonly startups: number;
  readonly funding: number;
  readonly growth: number;
  readonly rank: number;
  readonly topSectors: readonly string[];
  readonly x: number;
  readonly y: number;
}

export function GlobalMap() {
  const [hovered, setHovered] = useState<EcoPopupData | null>(null);

  return (
    <div className="glass gradient-border overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Global Startup Ecosystems</h3>
          <Badge
            variant="secondary"
            className="bg-indigo-500/10 text-2xs text-indigo-400"
          >
            {ECOSYSTEMS.length} hubs tracked
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> 10K+
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60" /> 5K+
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/30" /> 1K+
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[420px] w-full bg-[#080810]">
        <svg
          viewBox="0 0 100 70"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid */}
          {Array.from({ length: 13 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0" y1={i * 5 + 5} x2="100" y2={i * 5 + 5}
              stroke="white" strokeOpacity="0.02" strokeWidth="0.1"
            />
          ))}
          {Array.from({ length: 19 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 5 + 5} y1="0" x2={i * 5 + 5} y2="70"
              stroke="white" strokeOpacity="0.02" strokeWidth="0.1"
            />
          ))}

          {/* Connection lines */}
          {CONNECTIONS.map(([from, to], i) => {
            const a = ECOSYSTEMS[from];
            const b = ECOSYSTEMS[to];
            return (
              <line
                key={`conn-${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#818cf8" strokeOpacity="0.08" strokeWidth="0.15"
                strokeDasharray="0.5 0.5"
              />
            );
          })}

          {/* Ecosystem markers */}
          {ECOSYSTEMS.map((eco) => {
            const intensity = Math.min(1, eco.startups / 12000);
            const r = 0.6 + intensity * 1.8;
            const isHovered = hovered?.city === eco.city;

            return (
              <g
                key={eco.city}
                onMouseEnter={() => setHovered(eco)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                {/* Outer glow */}
                <circle
                  cx={eco.x} cy={eco.y} r={r * 4}
                  fill="#818cf8"
                  fillOpacity={isHovered ? 0.12 : 0.04}
                  className="transition-all duration-300"
                />
                {/* Pulse ring */}
                <circle
                  cx={eco.x} cy={eco.y} r={r * 2.5}
                  fill="none" stroke="#818cf8"
                  strokeOpacity={isHovered ? 0.4 : 0.1}
                  strokeWidth="0.1"
                  className={isHovered ? "animate-pulse" : ""}
                />
                {/* Core */}
                <circle
                  cx={eco.x} cy={eco.y} r={r}
                  fill={`rgba(129,140,248,${0.4 + intensity * 0.6})`}
                  className="transition-all duration-300"
                />
                {/* Bright center */}
                <circle
                  cx={eco.x} cy={eco.y} r={r * 0.4}
                  fill="white"
                  fillOpacity={0.6 + intensity * 0.4}
                />
                {/* Label (show top 6 always, rest on hover) */}
                {(eco.rank <= 6 || isHovered) && (
                  <text
                    x={eco.x}
                    y={eco.y - r - 1.5}
                    textAnchor="middle"
                    className="fill-white/70 text-[1.6px] font-medium"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    {eco.city}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover popup */}
        {hovered && (
          <div
            className="glass absolute z-20 w-56 rounded-lg border border-white/10 p-3 shadow-2xl"
            style={{
              left: `${Math.min(75, Math.max(5, hovered.x))}%`,
              top: `${Math.min(60, Math.max(5, hovered.y - 15))}%`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">{hovered.city}</p>
                <p className="text-2xs text-muted-foreground">
                  {hovered.country} — Rank #{hovered.rank}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-2xs font-bold text-indigo-400">
                {hovered.rank}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div>
                <p className="text-micro text-muted-foreground">Startups</p>
                <p className="text-xs font-semibold">
                  {formatNumber(hovered.startups)}
                </p>
              </div>
              <div>
                <p className="text-micro text-muted-foreground">Funding</p>
                <p className="text-xs font-semibold">
                  {formatCurrency(hovered.funding)}
                </p>
              </div>
              <div>
                <p className="text-micro text-muted-foreground">Growth</p>
                <p className="text-xs font-semibold text-emerald-400">
                  +{hovered.growth}%
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              {hovered.topSectors.map((s) => (
                <span
                  key={s}
                  className="rounded bg-white/5 px-1.5 py-0.5 text-micro text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-[#080810]/50" />
      </div>

      {/* Bottom ecosystem strip */}
      <div className="grid grid-cols-3 gap-px border-t border-white/5 bg-white/[0.02] sm:grid-cols-6">
        {ECOSYSTEMS.slice(0, 6).map((eco) => (
          <div
            key={eco.city}
            className="group flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-2xs font-bold text-indigo-400">
              {eco.rank}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium">{eco.city}</p>
              <div className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-micro text-muted-foreground">
                  {formatNumber(eco.startups)}
                </span>
                <TrendingUp className="ml-1 h-2.5 w-2.5 text-emerald-400" />
                <span className="text-micro text-emerald-400">
                  +{eco.growth}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
