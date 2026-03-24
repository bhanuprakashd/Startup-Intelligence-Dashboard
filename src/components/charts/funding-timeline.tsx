"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MOCK_DATA = [
  { month: "Jan", funding: 18.2, deals: 320 },
  { month: "Feb", funding: 22.5, deals: 380 },
  { month: "Mar", funding: 28.1, deals: 420 },
  { month: "Apr", funding: 24.8, deals: 390 },
  { month: "May", funding: 31.2, deals: 450 },
  { month: "Jun", funding: 27.6, deals: 410 },
  { month: "Jul", funding: 35.4, deals: 480 },
  { month: "Aug", funding: 29.8, deals: 430 },
  { month: "Sep", funding: 38.1, deals: 510 },
  { month: "Oct", funding: 33.5, deals: 470 },
  { month: "Nov", funding: 41.2, deals: 540 },
  { month: "Dec", funding: 36.8, deals: 490 },
];

export function FundingTimeline() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[280px] animate-shimmer rounded-lg" />;
  }

  return (
    <div className="p-3">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={MOCK_DATA}>
          <defs>
            <linearGradient id="fundingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} stroke="rgba(255,255,255,0.06)" />
          <YAxis tick={{ fontSize: 10, fill: "#71717a" }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `$${v}B`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", color: "#e4e4e7" }}
            formatter={(value) => [`$${value}B`, "Funding"]}
          />
          <Area type="monotone" dataKey="funding" stroke="#818cf8" fill="url(#fundingGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
