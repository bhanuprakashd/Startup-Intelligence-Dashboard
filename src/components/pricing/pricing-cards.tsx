"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  Globe,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

type BillingCycle = "monthly" | "annual";

interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  cta: string;
  badge?: string;
  features: PricingFeature[];
  highlighted?: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for exploring startup intelligence.",
    cta: "Get Started Free",
    features: [
      { label: "3 idea validations per month", included: true },
      { label: "Basic dashboard (overview, map, feeds)", included: true },
      { label: "3 AI Copilot queries per day", included: true },
      { label: "Community support", included: true },
      { label: "Unlimited validations", included: false },
      { label: "All 13 intelligence tools", included: false },
      { label: "Competitive X-Ray", included: false },
      { label: "Investor Match", included: false },
      { label: "Pitch Deck Generator", included: false },
      { label: "Name + Domain Checker", included: false },
      { label: "90-Day Roadmap", included: false },
      { label: "Export reports (PDF)", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    annualPrice: 15,
    description: "Everything you need to validate and launch your startup.",
    cta: "Start 7-Day Free Trial",
    badge: "MOST POPULAR",
    highlighted: true,
    features: [
      { label: "Unlimited validations", included: true },
      { label: "All 13 intelligence tools", included: true },
      { label: "50 AI Copilot queries per day", included: true },
      { label: "Competitive X-Ray", included: true },
      { label: "Investor Match", included: true },
      { label: "Pitch Deck Generator", included: true },
      { label: "Name + Domain Checker", included: true },
      { label: "90-Day Roadmap", included: true },
      { label: "Founder Match Quiz", included: true },
      { label: "Landing Page Generator", included: true },
      { label: "Email support", included: true },
      { label: "Export reports (PDF)", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Unlimited power for serious founders and teams.",
    cta: "Start 7-Day Free Trial",
    features: [
      { label: "Everything in Starter", included: true },
      { label: "Unlimited AI Copilot", included: true },
      { label: "Export reports (PDF)", included: true },
      { label: "API access (1K calls/mo)", included: true },
      { label: "Priority AI (faster responses)", included: true },
      { label: "Custom alerts", included: true },
      { label: "Priority support", included: true },
      { label: "Unlimited validations", included: true },
      { label: "All 13 intelligence tools", included: true },
      { label: "Competitive X-Ray", included: true },
      { label: "Investor Match", included: true },
      { label: "Pitch Deck Generator", included: true },
      { label: "Name + Domain Checker", included: true },
    ],
  },
];

const COMPARISON_FEATURES = [
  { label: "Idea validations / month", free: "3", starter: "Unlimited", pro: "Unlimited" },
  { label: "AI Copilot queries / day", free: "3", starter: "50", pro: "Unlimited" },
  { label: "Intelligence tools", free: "Basic", starter: "All 13", pro: "All 13" },
  { label: "Competitive X-Ray", free: false, starter: true, pro: true },
  { label: "Investor Match", free: false, starter: true, pro: true },
  { label: "Pitch Deck Generator", free: false, starter: true, pro: true },
  { label: "Name + Domain Checker", free: false, starter: true, pro: true },
  { label: "90-Day Roadmap", free: false, starter: true, pro: true },
  { label: "Founder Match Quiz", free: false, starter: true, pro: true },
  { label: "Landing Page Generator", free: false, starter: true, pro: true },
  { label: "Export reports (PDF)", free: false, starter: false, pro: true },
  { label: "API access", free: false, starter: false, pro: true },
  { label: "Priority AI", free: false, starter: false, pro: true },
  { label: "Custom alerts", free: false, starter: false, pro: true },
  { label: "Support", free: "Community", starter: "Email", pro: "Priority" },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-emerald-400" />
    ) : (
      <X className="mx-auto h-4 w-4 text-zinc-600" />
    );
  }
  return <span className="text-sm text-zinc-300">{value}</span>;
}

export function PricingCards() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0f", color: "#e4e4e7" }}
    >
      {/* Header */}
      <header
        className="glass sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: "linear-gradient(135deg, #818cf8, #34d399)",
            }}
          >
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">
            WSI
          </span>
          <span className="hidden text-xs text-zinc-500 sm:block">
            World Startup Intelligence
          </span>
        </div>

        <div className="w-32" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Headline */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <Zap className="h-3 w-3" />
            Pricing
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-white" : "text-zinc-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling((b) => (b === "monthly" ? "annual" : "monthly"))
            }
            className="relative h-6 w-11 rounded-full transition-colors focus:outline-none"
            style={{
              backgroundColor:
                billing === "annual"
                  ? "#818cf8"
                  : "rgba(255,255,255,0.1)",
            }}
            aria-label="Toggle billing cycle"
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform"
              style={{
                left: billing === "annual" ? "calc(100% - 1.375rem)" : "0.125rem",
              }}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${billing === "annual" ? "text-white" : "text-zinc-500"}`}
          >
            Annual
          </span>
          {billing === "annual" && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing cards */}
        <div className="mb-20 grid gap-6 lg:grid-cols-3 lg:items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-px ${tier.highlighted ? "gradient-border shadow-2xl shadow-indigo-500/10" : ""}`}
              style={
                tier.highlighted
                  ? { transform: "scale(1.03)" }
                  : {}
              }
            >
              <div
                className="relative flex flex-col rounded-2xl p-7"
                style={{
                  backgroundColor: tier.highlighted ? "#111118" : "#0e0e16",
                  border: tier.highlighted
                    ? "none"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold tracking-widest text-white"
                      style={{
                        background:
                          "linear-gradient(90deg, #818cf8, #34d399)",
                      }}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <h2 className="mb-1 text-lg font-semibold text-white">
                  {tier.name}
                </h2>
                <p className="mb-6 text-sm text-zinc-500">{tier.description}</p>

                {/* Price */}
                <div className="mb-6 flex items-end gap-1">
                  <span className="text-5xl font-bold text-white">
                    $
                    {billing === "annual"
                      ? tier.annualPrice
                      : tier.monthlyPrice}
                  </span>
                  <span className="mb-1 text-sm text-zinc-500">
                    {tier.monthlyPrice === 0
                      ? "forever"
                      : billing === "annual"
                        ? "/mo billed annually"
                        : "/mo"}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href="/"
                  className={`mb-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "text-white hover:opacity-90"
                      : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                  }`}
                  style={
                    tier.highlighted
                      ? {
                          background:
                            "linear-gradient(135deg, #818cf8, #6366f1)",
                        }
                      : {}
                  }
                >
                  {tier.cta}
                </Link>

                {/* Feature list */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600" />
                      )}
                      <span
                        className={
                          feature.included ? "text-zinc-300" : "text-zinc-600"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">
            Full feature comparison
          </h2>
          <div
            className="glass overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-4 gap-0 border-b px-6 py-4"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="text-sm font-medium text-zinc-500">Feature</div>
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`text-center text-sm font-semibold ${tier.highlighted ? "text-indigo-300" : "text-zinc-300"}`}
                >
                  {tier.name}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {COMPARISON_FEATURES.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-4 gap-0 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
                style={
                  i !== COMPARISON_FEATURES.length - 1
                    ? { borderBottom: "1px solid rgba(255,255,255,0.04)" }
                    : {}
                }
              >
                <div className="text-sm text-zinc-400">{row.label}</div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.free} />
                </div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.starter} />
                </div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.pro} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="mb-3 text-zinc-400">
            Questions? Chat with our AI Copilot.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-indigo-200"
          >
            <MessageSquare className="h-4 w-4" />
            Open AI Copilot on Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
