"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { FundingTimeline } from "./funding-timeline";
import { SectorBreakdown } from "./sector-breakdown";
import { TopEcosystems } from "./top-ecosystems";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "timeline", label: "Funding Timeline" },
  { id: "sectors", label: "Sector Breakdown" },
  { id: "ecosystems", label: "Top Ecosystems" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ChartTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("timeline");

  return (
    <div className="glass gradient-border flex flex-col rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Analytics</h3>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-0 border-b border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-3 py-2 text-[11px] font-medium transition-all",
              activeTab === tab.id
                ? "border-b-2 border-indigo-400 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-1">
        {activeTab === "timeline" && <FundingTimeline />}
        {activeTab === "sectors" && <SectorBreakdown />}
        {activeTab === "ecosystems" && <TopEcosystems />}
      </div>
    </div>
  );
}
