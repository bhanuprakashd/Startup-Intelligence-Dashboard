"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MOCK_DATA = [
  { city: "SF Bay Area", startups: 12840 },
  { city: "New York", startups: 9320 },
  { city: "London", startups: 8150 },
  { city: "Beijing", startups: 7600 },
  { city: "Bangalore", startups: 6200 },
  { city: "Berlin", startups: 4800 },
  { city: "Singapore", startups: 4200 },
  { city: "Tel Aviv", startups: 3900 },
];

export function TopEcosystems() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[280px] animate-shimmer rounded-lg" />;
  }

  return (
    <div className="p-3">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={MOCK_DATA} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#71717a" }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: "#71717a" }} stroke="rgba(255,255,255,0.06)" width={75} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", color: "#e4e4e7" }}
            formatter={(value) => [Number(value).toLocaleString(), "Startups"]}
          />
          <Bar dataKey="startups" fill="#818cf8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
