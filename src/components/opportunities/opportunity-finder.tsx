"use client";

import {
  ArrowRight,
  Brain,
  DollarSign,
  Flame,
  Info,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MARKET_GAPS = [
  {
    id: "1",
    title: "AI-Powered Compliance for SMBs",
    sector: "RegTech",
    problem: "Small businesses spend $12K+/yr on manual regulatory compliance. No affordable AI solution exists below enterprise tier.",
    marketSize: "$18.4B by 2028",
    competition: "Low",
    competitionColor: "text-emerald-400",
    demand: 92,
    regions: ["US", "EU", "UK"],
    signals: ["3 unicorns in enterprise RegTech", "No SMB-focused player", "New EU AI Act creates surge in demand"],
    difficulty: "Medium",
    tags: ["B2B", "SaaS", "AI"],
  },
  {
    id: "2",
    title: "Vertical SaaS for Independent Pharmacies",
    sector: "HealthTech",
    problem: "40K+ independent pharmacies in the US still use legacy software from the 2000s. No modern cloud-native POS+inventory+telehealth platform.",
    marketSize: "$7.2B TAM",
    competition: "Very Low",
    competitionColor: "text-emerald-400",
    demand: 88,
    regions: ["US", "IN", "BR"],
    signals: ["Pharmacy chains are digital", "Indies left behind", "Telehealth regulations opening up"],
    difficulty: "Medium",
    tags: ["Vertical SaaS", "Healthcare", "B2B"],
  },
  {
    id: "3",
    title: "Carbon Credit Marketplace for Farmers",
    sector: "CleanTech",
    problem: "Farmers can earn carbon credits through regenerative agriculture but lack accessible, transparent marketplaces. Current platforms charge 30-50% fees.",
    marketSize: "$50B voluntary carbon market",
    competition: "Medium",
    competitionColor: "text-amber-400",
    demand: 85,
    regions: ["US", "BR", "AU", "EU"],
    signals: ["Microsoft buying $1B in credits", "Farmer adoption growing 40% YoY", "Verification tech maturing"],
    difficulty: "Hard",
    tags: ["Marketplace", "AgriTech", "ESG"],
  },
  {
    id: "4",
    title: "AI Tutor for Trade Skills",
    sector: "EdTech",
    problem: "Massive skilled trades shortage (500K+ unfilled jobs in US alone). No AI-powered, hands-on learning platform for plumbing, electrical, HVAC.",
    marketSize: "$4.8B trades education",
    competition: "Very Low",
    competitionColor: "text-emerald-400",
    demand: 78,
    regions: ["US", "DE", "AU", "UK"],
    signals: ["Gen Z interest in trades rising", "Government subsidies increasing", "AR/VR hardware costs dropping"],
    difficulty: "Medium",
    tags: ["EdTech", "AI", "B2C"],
  },
  {
    id: "5",
    title: "Embedded Insurance for Gig Workers",
    sector: "InsurTech",
    problem: "85M US gig workers have no employer-provided insurance. Current solutions are expensive and not designed for variable income patterns.",
    marketSize: "$12B gig insurance gap",
    competition: "Low",
    competitionColor: "text-emerald-400",
    demand: 91,
    regions: ["US", "IN", "UK", "BR"],
    signals: ["Gig economy growing 15% YoY", "Regulatory pressure for gig worker protections", "Embedded finance APIs maturing"],
    difficulty: "Hard",
    tags: ["InsurTech", "FinTech", "B2C"],
  },
  {
    id: "6",
    title: "AI-Powered Supply Chain for D2C Brands",
    sector: "Logistics",
    problem: "Small D2C brands overpay 30-40% on logistics vs Amazon. No aggregated AI-optimized fulfillment network for sub-$10M revenue brands.",
    marketSize: "$22B D2C logistics",
    competition: "Medium",
    competitionColor: "text-amber-400",
    demand: 82,
    regions: ["US", "EU", "IN"],
    signals: ["ShipBob at $2B valuation", "Long tail of D2C brands underserved", "AI routing can cut costs 25%"],
    difficulty: "Hard",
    tags: ["Logistics", "AI", "B2B"],
  },
];

const TRENDING_SECTORS = [
  { name: "AI Infrastructure", growth: "+340%", deals: 89, heat: 98 },
  { name: "Climate Tech", growth: "+180%", deals: 67, heat: 92 },
  { name: "Defense Tech", growth: "+220%", deals: 34, heat: 88 },
  { name: "Vertical AI Agents", growth: "+420%", deals: 56, heat: 96 },
  { name: "Digital Health", growth: "+85%", deals: 78, heat: 75 },
  { name: "Space Tech", growth: "+150%", deals: 23, heat: 70 },
  { name: "Quantum Computing", growth: "+300%", deals: 12, heat: 65 },
  { name: "Robotics", growth: "+120%", deals: 45, heat: 72 },
];

const FOUNDER_TIPS = [
  { icon: Target, tip: "Look for industries with high demand scores (>80) and low competition" },
  { icon: DollarSign, tip: "Markets >$5B TAM with no clear winner are prime for disruption" },
  { icon: MapPin, tip: "Build where you are — ecosystem support matters for early traction" },
  { icon: Users, tip: "Talk to 50 potential customers before writing a single line of code" },
];

export function OpportunityFinder({ onNavigate }: { readonly onNavigate?: (section: string) => void } = {}) {
  const [selectedGap, setSelectedGap] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Opportunities are <span className="font-medium text-foreground">AI-curated</span> and updated periodically.
          Use <span className="font-medium text-indigo-400">Validate Idea</span> for real-time analysis of a specific concept.
        </p>
      </div>

      {/* Intro banner */}
      <div className="glass gradient-border relative overflow-hidden rounded-xl p-5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">AI Opportunity Finder</h2>
              <p className="text-2xs text-muted-foreground">
                Market gaps identified from funding patterns, search trends, and competitive analysis
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FOUNDER_TIPS.map((t, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.03] p-2.5">
                <t.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <p className="text-2xs leading-relaxed text-muted-foreground">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two columns: Gaps + Trending */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Market Gaps — 2/3 width */}
        <div className="glass gradient-border rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold">Underserved Market Gaps</h3>
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-micro font-medium text-amber-400">
                {MARKET_GAPS.length} opportunities
              </span>
            </div>
            <span className="text-2xs text-muted-foreground">
              Updated daily via AI analysis
            </span>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {MARKET_GAPS.map((gap) => (
              <div
                key={gap.id}
                className={cn(
                  "cursor-pointer px-4 py-4 transition-all hover:bg-white/[0.02]",
                  selectedGap === gap.id && "bg-white/[0.03]"
                )}
                onClick={() => setSelectedGap(selectedGap === gap.id ? null : gap.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-semibold">{gap.title}</h4>
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-micro font-medium text-violet-400">
                        {gap.sector}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {gap.problem}
                    </p>
                  </div>

                  {/* Demand meter */}
                  <div className="shrink-0 text-center">
                    <div className="relative h-10 w-10">
                      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"
                        />
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none" stroke="#818cf8" strokeWidth="3"
                          strokeDasharray={`${gap.demand * 0.94} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-micro font-bold">
                        {gap.demand}
                      </span>
                    </div>
                    <p className="mt-0.5 text-3xs text-muted-foreground">Demand</p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-2xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {gap.marketSize}
                  </span>
                  <span className={cn("flex items-center gap-1", gap.competitionColor)}>
                    <Target className="h-3 w-3" />
                    Competition: {gap.competition}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Difficulty: {gap.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {gap.regions.join(", ")}
                  </span>
                </div>

                {/* Expanded details */}
                {selectedGap === gap.id && (
                  <div className="mt-3 space-y-2 rounded-lg bg-white/[0.02] p-3 animate-fade-in-up">
                    <p className="text-2xs font-medium text-indigo-400">
                      Market Signals
                    </p>
                    <ul className="space-y-1">
                      {gap.signals.map((signal, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-2xs text-muted-foreground">
                          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {gap.tags.map((tag) => (
                        <span key={tag} className="rounded bg-white/5 px-2 py-0.5 text-micro text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                      <a
                        href="#validate"
                        className="ml-auto flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-1 text-micro font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Target className="h-2.5 w-2.5" />
                        Validate This Idea
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trending Sectors — 1/3 width */}
        <div className="glass gradient-border rounded-xl">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-semibold">Hottest Sectors</h3>
            </div>
            <span className="text-micro text-muted-foreground">Q1 2026 data</span>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {TRENDING_SECTORS.map((sector, i) => (
              <div key={sector.name} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-2xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[11px] font-medium">{sector.name}</p>
                  <p className="text-micro text-muted-foreground">
                    {sector.deals} deals this quarter
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold text-emerald-400">
                    {sector.growth}
                  </p>
                  {/* Heat bar */}
                  <div className="mt-0.5 h-1 w-12 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${sector.heat}%`,
                        background: `linear-gradient(90deg, #818cf8, ${sector.heat > 90 ? "#ef4444" : "#22d3ee"})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom insight */}
          <div className="border-t border-white/5 p-4">
            <div className="rounded-lg bg-gradient-to-r from-violet-500/5 to-indigo-500/5 p-3">
              <p className="text-2xs font-medium text-indigo-400">AI Insight</p>
              <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
                Vertical AI Agents are the fastest-growing sector with 420% deal growth.
                The sweet spot: industry-specific agents for healthcare, legal, and finance
                where domain expertise creates strong moats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
