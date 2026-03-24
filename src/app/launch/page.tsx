import Link from "next/link";
import {
  LayoutDashboard,
  Globe,
  Zap,
  Newspaper,
  CheckCircle2,
  Crosshair,
  Users,
  FileText,
  Search,
  Map,
  HelpCircle,
  MonitorSmartphone,
  Bot,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const tools = [
  {
    icon: LayoutDashboard,
    title: "Overview Dashboard",
    desc: "Your startup intelligence command center with live metrics and trend signals.",
  },
  {
    icon: Globe,
    title: "Global Map",
    desc: "Visualize startup ecosystems, funding hotspots, and talent clusters worldwide.",
  },
  {
    icon: Zap,
    title: "Live Funding Feed",
    desc: "Real-time funding rounds, acquisitions, and investment news as they happen.",
  },
  {
    icon: Newspaper,
    title: "Intelligence News",
    desc: "Curated startup news aggregated from HackerNews, TechCrunch, and top sources.",
  },
  {
    icon: CheckCircle2,
    title: "Idea Validator",
    desc: "Score your idea against market demand, competition, and timing signals in seconds.",
  },
  {
    icon: Crosshair,
    title: "Competitive X-Ray",
    desc: "Deep-dive competitor analysis with funding, positioning, and weakness mapping.",
  },
  {
    icon: Users,
    title: "Investor Match",
    desc: "Find the exact investors who back companies like yours with verified contact intel.",
  },
  {
    icon: FileText,
    title: "Pitch Deck Generator",
    desc: "AI-crafted pitch decks tailored to your idea, market, and target investors.",
  },
  {
    icon: Search,
    title: "Name + Domain Checker",
    desc: "Discover available brand names with domain, trademark, and social handle checks.",
  },
  {
    icon: Map,
    title: "90-Day Roadmap",
    desc: "A personalized launch roadmap with weekly milestones and accountability checkpoints.",
  },
  {
    icon: HelpCircle,
    title: "Founder Match Quiz",
    desc: "Discover your founder archetype and get ideas matched to your unique strengths.",
  },
  {
    icon: MonitorSmartphone,
    title: "Landing Page Generator",
    desc: "Generate conversion-optimized landing pages for your startup in under 60 seconds.",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Your always-on AI advisor for strategy, GTM, fundraising, and founder decisions.",
  },
];

const journey = [
  { step: "Quiz", label: "Discover your idea", color: "from-indigo-500 to-violet-500" },
  { step: "Validate", label: "Score market fit", color: "from-violet-500 to-purple-500" },
  { step: "X-Ray", label: "Map competitors", color: "from-purple-500 to-fuchsia-500" },
  { step: "Name", label: "Claim your brand", color: "from-fuchsia-500 to-pink-500" },
  { step: "Landing", label: "Launch your page", color: "from-pink-500 to-rose-500" },
  { step: "Pitch", label: "Craft your deck", color: "from-rose-500 to-orange-500" },
  { step: "Roadmap", label: "Plan 90 days", color: "from-orange-500 to-amber-500" },
  { step: "Investors", label: "Find your backers", color: "from-amber-500 to-green-500" },
];

const faqs = [
  {
    q: "Is WSI really free?",
    a: "Yes. The Free tier gives you 3 idea validations per month, a live dashboard, and 3 AI Copilot queries per day — forever free. No credit card required to start.",
  },
  {
    q: "Where does the data come from?",
    a: "WSI aggregates real-time data from open APIs including HackerNews, Reddit, GitHub Trending, ProductHunt, and public funding databases. All data is live, not cached weeks-old snapshots.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "WSI's AI is grounded in live market data, which dramatically reduces hallucinations. Every insight is tied to real signals — funding patterns, search trends, and community activity.",
  },
  {
    q: "Can I export my results?",
    a: "Pro tier users can export pitch decks, validation reports, roadmaps, and investor lists as PDF or structured data. Starter users get in-app access to all generated content.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your ideas, analyses, and generated assets are private to your account. We never share or train on your personal startup data.",
  },
  {
    q: "Who built this?",
    a: "WSI was built by founders, for founders — a team obsessed with reducing the time from 'I have an idea' to 'I have traction.' We dogfood every single tool ourselves.",
  },
];

const competitors = [
  {
    name: "Crunchbase",
    type: "Database only",
    price: "$99/mo",
    ai: false,
    guidance: false,
    live: false,
  },
  {
    name: "CB Insights",
    type: "Enterprise reports",
    price: "$50K/yr",
    ai: false,
    guidance: false,
    live: false,
  },
  {
    name: "ChatGPT",
    type: "General AI",
    price: "$20/mo",
    ai: true,
    guidance: false,
    live: false,
  },
  {
    name: "WSI",
    type: "Full founder OS",
    price: "$0–49/mo",
    ai: true,
    guidance: true,
    live: true,
    highlight: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaunchPage() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0f] text-[#e4e4e7] overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">W</span>
            <span className="text-white">SI</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#tools" className="hover:text-white transition-colors">Tools</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 transition-opacity"
          >
            Open Dashboard →
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">

        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #818cf8 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass gradient-border text-xs text-indigo-300 font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-dot" />
            Live data · AI-powered · 13 tools
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              From Zero to Startup
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              in Minutes
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
          >
            The AI-powered intelligence platform that helps you discover, validate, and launch startup ideas — backed by live market data.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20 text-base"
            >
              Start Free →
            </Link>
            <button className="px-8 py-4 rounded-xl font-semibold text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-all text-base glass">
              ▶ Watch Demo
            </button>
          </div>

          {/* Micro-copy */}
          <p className="text-zinc-500 text-sm">
            No credit card required&nbsp;&nbsp;·&nbsp;&nbsp;13 AI tools&nbsp;&nbsp;·&nbsp;&nbsp;Real-time data
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ── Social Proof Bar ─────────────────────────────────────────────── */}
      <section className="bg-[#080810] border-y border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-zinc-600 text-xs uppercase tracking-widest font-medium mb-6">
            Powered by live data from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {["HackerNews", "Reddit", "GitHub", "ProductHunt", "TechCrunch"].map((source) => (
              <span
                key={source}
                className="text-zinc-500 font-semibold text-sm tracking-wide hover:text-zinc-300 transition-colors cursor-default"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">The problem</span>
              <h2
                className="font-black leading-tight mt-4 mb-6"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
              >
                <span className="text-white">Every other tool</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  gives you data.
                </span>
                <br />
                <span className="text-zinc-400 font-bold">None tells you what to DO with it.</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed">
                Founders drown in market reports, paid databases, and AI tools that hallucinate. WSI is the only platform that combines live market signals with structured AI guidance to actually move you forward.
              </p>
            </div>

            {/* Right – Comparison table */}
            <div className="glass gradient-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-zinc-500 font-medium">Tool</th>
                    <th className="text-center px-3 py-3 text-zinc-500 font-medium">Live Data</th>
                    <th className="text-center px-3 py-3 text-zinc-500 font-medium">AI Guidance</th>
                    <th className="text-right px-4 py-3 text-zinc-500 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => (
                    <tr
                      key={c.name}
                      className={`border-b border-white/5 last:border-0 transition-colors ${
                        c.highlight
                          ? "bg-indigo-500/10"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className={`font-semibold ${c.highlight ? "text-indigo-300" : "text-zinc-300"}`}>
                          {c.name}
                          {c.highlight && (
                            <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">YOU</span>
                          )}
                        </div>
                        <div className="text-zinc-600 text-xs">{c.type}</div>
                      </td>
                      <td className="text-center px-3 py-3.5">
                        {c.live ? (
                          <span className="text-green-400 text-base">✓</span>
                        ) : (
                          <span className="text-zinc-700 text-base">✗</span>
                        )}
                      </td>
                      <td className="text-center px-3 py-3.5">
                        {c.guidance ? (
                          <span className="text-green-400 text-base">✓</span>
                        ) : (
                          <span className="text-zinc-700 text-base">✗</span>
                        )}
                      </td>
                      <td className={`text-right px-4 py-3.5 font-mono font-semibold text-sm ${c.highlight ? "text-indigo-300" : "text-zinc-400"}`}>
                        {c.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </section>

      {/* ── 13 Intelligence Tools ────────────────────────────────────────── */}
      <section id="tools" className="py-28 bg-[#080810]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">The arsenal</span>
            <h2
              className="font-black mt-4 mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
            >
              <span className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                13 Intelligence Tools
              </span>
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-base">
              Every tool you need from idea to launch — in one platform. No more switching between 10 different apps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="glass gradient-border rounded-xl p-5 hover:bg-white/[0.03] transition-all group animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Journey ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">The journey</span>
            <h2
              className="font-black mt-4 mb-4"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              <span className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                The complete founder journey.
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                No other platform offers this.
              </span>
            </h2>
          </div>

          {/* Flow */}
          <div className="flex flex-wrap justify-center gap-0">
            {journey.map(({ step, label, color }, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-black/30 mb-2`}>
                    <span className="text-white font-black text-xs text-center leading-tight px-1">{step}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] text-center leading-tight max-w-[60px]">{label}</span>
                </div>
                {i < journey.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-zinc-700 mx-1 mb-4 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-zinc-600 text-sm mt-10">
            Each step feeds the next — your data flows through the entire platform automatically.
          </p>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Pricing</span>
            <h2
              className="font-black mt-4 mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
            >
              <span className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                Start free. Scale when ready.
              </span>
            </h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              No hidden fees. Cancel anytime. Your startup data is always yours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <div className="glass gradient-border rounded-2xl p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-1">Free</h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-zinc-500 text-sm mb-1">/mo</span>
                </div>
                <p className="text-zinc-500 text-xs">Perfect to explore WSI and validate your first ideas.</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  "3 idea validations/month",
                  "Live startup dashboard",
                  "3 AI Copilot queries/day",
                  "Public funding feed",
                  "Name & domain checker",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className="block text-center py-3 rounded-xl border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white transition-all text-sm font-medium"
              >
                Get started free
              </Link>
            </div>

            {/* Starter – Most Popular */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/50 to-violet-600/50 shadow-xl shadow-indigo-500/10">
              <div className="bg-[#0f0f1a] rounded-2xl p-6 flex flex-col h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-white font-bold text-lg mb-1">Starter</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-black text-white">$19</span>
                    <span className="text-zinc-500 text-sm mb-1">/mo</span>
                  </div>
                  <p className="text-zinc-500 text-xs">For founders actively building and validating.</p>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {[
                    "Unlimited validations",
                    "All 13 tools unlocked",
                    "50 AI Copilot queries/day",
                    "Competitive X-Ray",
                    "Investor Match",
                    "Pitch Deck Generator",
                    "90-Day Roadmap",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/"
                  className="block text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 transition-opacity text-sm"
                >
                  Start with Starter →
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="glass gradient-border rounded-2xl p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-1">Pro</h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-zinc-500 text-sm mb-1">/mo</span>
                </div>
                <p className="text-zinc-500 text-xs">For power founders and early-stage teams.</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  "Everything in Starter",
                  "Unlimited AI Copilot",
                  "Export reports (PDF)",
                  "API access",
                  "Priority AI processing",
                  "Team workspace (3 seats)",
                  "White-label pitch decks",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className="block text-center py-3 rounded-xl border border-violet-500/30 text-violet-300 hover:border-violet-500/50 hover:text-violet-200 transition-all text-sm font-medium"
              >
                Go Pro
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 bg-[#080810]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">FAQ</span>
            <h2
              className="font-black mt-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              <span className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                Questions answered.
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="glass gradient-border rounded-xl group"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <span className="font-semibold text-white text-sm">{q}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0d0d14] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2
            className="font-black mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Start building your
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              startup today.
            </span>
          </h2>
          <p className="text-zinc-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Join 1,000+ founders already using WSI to discover better ideas, move faster, and raise smarter.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:opacity-90 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/25"
          >
            Start Free — No credit card required
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-zinc-600 text-sm mt-5">
            Join 1,000+ founders already using WSI
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#080810] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">W</span>
                <span className="text-white">SI</span>
              </span>
              <span className="text-zinc-700 text-xs">Startup Intelligence Platform</span>
            </div>

            <nav className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
              <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-zinc-300 transition-colors">About</a>
            </nav>

            <div className="text-right">
              <p className="text-zinc-600 text-xs">© 2025 WSI. All rights reserved.</p>
              <p className="text-zinc-700 text-xs mt-1">Built with live data from open APIs</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
