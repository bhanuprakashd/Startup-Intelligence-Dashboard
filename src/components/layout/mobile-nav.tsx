"use client";

import {
  Brain,
  Globe2,
  LayoutDashboard,
  Menu,
  Rocket,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";
import type { SectionId } from "./sidebar";
import { cn } from "@/lib/utils";

const QUICK_NAV = [
  { id: "overview" as SectionId, icon: LayoutDashboard, label: "Home" },
  { id: "validate" as SectionId, icon: Target, label: "Validate" },
  { id: "profile" as SectionId, icon: Brain, label: "Match" },
  { id: "map" as SectionId, icon: Globe2, label: "Map" },
];

const ALL_NAV = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Global Map" },
  { id: "funding", label: "Funding" },
  { id: "news", label: "News" },
  { id: "validate", label: "Validate Idea" },
  { id: "xray", label: "Competitive X-Ray" },
  { id: "investors", label: "Investor Match" },
  { id: "pitch", label: "Pitch Deck" },
  { id: "names", label: "Name + Domain" },
  { id: "roadmap", label: "90-Day Roadmap" },
  { id: "profile", label: "Founder Match" },
  { id: "landing", label: "Landing Page" },
  { id: "linkedin", label: "LinkedIn Intel" },
  { id: "opportunities", label: "Opportunities" },
  { id: "startups", label: "Startups" },
  { id: "sectors", label: "Sectors" },
] as const;

export function MobileNav({
  activeSection,
  onSectionChange,
}: {
  readonly activeSection: SectionId;
  readonly onSectionChange: (id: SectionId) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/5 bg-[#0d0d14]/95 backdrop-blur-md lg:hidden">
        {QUICK_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5",
                isActive ? "text-indigo-400" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-micro font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-micro font-medium">More</span>
        </button>
      </nav>

      {/* Full menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0f]/95 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <span className="text-sm font-bold">All Tools</span>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {ALL_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setMenuOpen(false);
                }}
                className={cn(
                  "rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                  activeSection === item.id
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-white/[0.03] text-muted-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
