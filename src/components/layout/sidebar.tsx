"use client";

import {
  BarChart3,
  Brain,
  BriefcaseBusiness,
  DollarSign,
  Globe2,
  Layout,
  LayoutDashboard,
  Lightbulb,
  Map,
  Newspaper,
  Presentation,
  Rocket,
  Scan,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
  { id: "map", label: "Global Map", icon: Globe2, badge: null },
  { id: "funding", label: "Funding", icon: TrendingUp, badge: null },
  { id: "news", label: "News", icon: Newspaper, badge: null },
  { id: "validate", label: "Validate Idea", icon: Target, badge: null },
  { id: "xray", label: "Competitive X-Ray", icon: Scan, badge: null },
  { id: "investors", label: "Investor Match", icon: DollarSign, badge: null },
  { id: "pitch", label: "Pitch Deck", icon: Presentation, badge: "NEW" },
  { id: "names", label: "Name + Domain", icon: Sparkles, badge: "NEW" },
  { id: "roadmap", label: "90-Day Roadmap", icon: Map, badge: "NEW" },
  { id: "profile", label: "Founder Match", icon: Brain, badge: "NEW" },
  { id: "landing", label: "Landing Page", icon: Layout, badge: "NEW" },
  { id: "linkedin", label: "LinkedIn Intel", icon: BriefcaseBusiness, badge: "NEW" },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb, badge: "AI" },
  { id: "startups", label: "Startups", icon: Rocket, badge: null },
  { id: "sectors", label: "Sectors", icon: BarChart3, badge: null },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

const LIVE_STATS = [
  { label: "AI tools", value: "13" },
  { label: "Data sources", value: "4" },
  { label: "Ecosystems", value: "18" },
  { label: "API status", value: "Live" },
];

export function Sidebar({
  activeSection,
  onSectionChange,
}: {
  readonly activeSection: SectionId;
  readonly onSectionChange: (id: SectionId) => void;
}) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-white/5 bg-[#0d0d14] lg:flex">
      <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
        <p className="mb-1.5 px-3 text-micro font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Dashboard
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-all",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive && "text-indigo-400")} />
              {item.label}
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-3xs font-semibold",
                    item.badge === "AI"
                      ? "bg-violet-500/10 text-violet-400"
                      : "bg-white/5 text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live stats */}
      <div className="border-t border-white/5 p-3">
        <p className="mb-2 px-1 text-micro font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Live Stats
        </p>
        <div className="space-y-2">
          {LIVE_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between px-1">
              <span className="text-2xs text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-2xs font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
