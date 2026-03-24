"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly numericValue: number;
  readonly change?: number;
  readonly changeLabel?: string;
  readonly icon: LucideIcon;
  readonly color: string;
  readonly sparkData?: readonly number[];
  readonly loading?: boolean;
}

function useAnimatedNumber(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

function MiniSparkline({
  data,
  color,
}: {
  readonly data: readonly number[];
  readonly color: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h * 0.8 - h * 0.1}`)
    .join(" ");

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace("#", "")})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * h * 0.8 - h * 0.1}
        r="2"
        fill={color}
      />
    </svg>
  );
}

export function MetricCard({
  title,
  value,
  numericValue,
  change,
  changeLabel = "vs last week",
  icon: Icon,
  color,
  sparkData,
  loading,
}: MetricCardProps) {
  const animatedValue = useAnimatedNumber(numericValue);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 animate-shimmer">
        <div className="h-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass gradient-border group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        visible ? "animate-fade-in-up" : "opacity-0"
      )}
    >
      {/* Background glow */}
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">
            {value.startsWith("$")
              ? `$${animatedValue.toLocaleString()}`
              : animatedValue.toLocaleString()}
          </p>
          {change !== undefined && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  change >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {change >= 0 ? (
                  <ArrowUp className="h-2.5 w-2.5" />
                ) : (
                  <ArrowDown className="h-2.5 w-2.5" />
                )}
                {Math.abs(change).toFixed(1)}%
              </div>
              <span className="text-[10px] text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          {sparkData && <MiniSparkline data={sparkData} color={color} />}
        </div>
      </div>
    </div>
  );
}
