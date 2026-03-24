"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const MOCK_DATA = [
  { name: "AI", value: 32.1, color: "#8B5CF6" },
  { name: "FinTech", value: 18.5, color: "#10B981" },
  { name: "HealthTech", value: 14.2, color: "#EF4444" },
  { name: "CleanTech", value: 11.8, color: "#22C55E" },
  { name: "Cybersecurity", value: 8.4, color: "#6366F1" },
  { name: "SaaS", value: 6.2, color: "#3B82F6" },
  { name: "EdTech", value: 4.5, color: "#F59E0B" },
  { name: "Other", value: 4.3, color: "#6B7280" },
];

export function SectorBreakdown() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[280px] animate-shimmer rounded-lg" />;
  }

  return (
    <div className="flex items-center gap-4 p-3">
      <ResponsiveContainer width="55%" height={280}>
        <PieChart>
          <Pie data={MOCK_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
            {MOCK_DATA.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", color: "#e4e4e7" }}
            formatter={(value) => [`$${value}B`, "Funding"]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2.5">
        {MOCK_DATA.map((sector) => (
          <div key={sector.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: sector.color }} />
            <span className="flex-1 text-[11px] text-muted-foreground">{sector.name}</span>
            <span className="text-[11px] font-semibold">${sector.value}B</span>
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full" style={{ width: `${(sector.value / 32.1) * 100}%`, backgroundColor: sector.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
