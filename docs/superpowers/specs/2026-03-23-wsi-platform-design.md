# WSI — World Startup Intelligence Platform Design Spec

## Vision

A real-time startup intelligence platform that replaces Crunchbase by delivering **predictive intelligence, not historical data**. WSI answers questions no other platform can: "What should I build?", "Is my idea viable?", "Who would fund this?" — all backed by live data from 15+ sources, synthesized by AI.

**Core thesis:** Crunchbase is a rearview mirror. WSI is a windshield.

## Target Users

| User | Need | Current Alternative | WSI Advantage |
|------|------|---------------------|---------------|
| Zero-to-one founder | "What should I build?" | ChatGPT (no live data), Reddit (noise) | AI-guided idea discovery backed by live market evidence |
| Active founder | Competitive intel, investor discovery | Crunchbase ($29-99/mo, stale data) | Real-time signals, predictive matching |
| Investor / Accelerator | Deal flow, sector trends | CB Insights ($50K+/yr) | Same intelligence at $49-199/mo |

## Architecture: Real-Time Intelligence Orchestrator

WSI is NOT a database. It is a **live intelligence orchestrator** that queries the world on demand and synthesizes answers.

### Data Strategy: Hybrid Live

```
STREAMING LAYER (always on, background polling)
├── RSS feeds (TechCrunch, startup news via awesome-tech-rss) — free, unlimited
├── NewsData.io API (paid $49/mo for 10K req/day — required for real-time)
├── SEC EDGAR FULL-TEXT RSS (free, real-time filings)
├── ProductHunt API (daily, free)
├── HackerNews Firebase API (free, real-time)
├── GitHub trending API (free, daily)
└── Aggregated into: Live Ticker, Market Pulse, Funding Feed

ON-DEMAND LAYER (user-triggered queries)
├── Google Trends (unofficial pytrends or SerpAPI $50/mo — search interest)
├── Growjo API (free tier — company growth data)
├── Exa.ai search API ($100/mo — neural web search for competitors, companies)
├── Serper.dev ($50/mo — Google SERP results for job postings, hiring signals)
├── Reddit API (free tier — community sentiment)
├── USPTO PatentsView API (free — patent filings)
├── App Store RSS feeds (free — app rankings)
├── OpenAlex API (free — academic/research signals)
└── Synthesized by AI into: Opportunity Radar, Idea Validator, X-Ray, Match

REMOVED (not viable):
├── LinkedIn — no public API, active anti-scraping. Replace with Exa.ai people search.
├── SimilarWeb — API starts at $500/mo. Replace with Exa.ai for traffic estimates.
├── Twitter/X — API starts at $100/mo basic. Use Exa.ai social search instead.
└── Glassdoor — restricted API. Use Serper.dev to search job boards.
```

### Caching: Upstash Redis (NOT in-memory)

In-memory caches die on serverless cold starts. All caching uses **Upstash Redis** (free tier: 10K commands/day, paid: $0.2/100K commands):

```
Cache TTL by data type:
├── Streaming feeds (RSS, HN, news):     5 min TTL
├── Funding data (SEC, NewsData):         10 min TTL
├── On-demand query results:              30 min TTL (keyed by query hash)
├── AI synthesis results:                 60 min TTL (expensive to regenerate)
├── Market Pulse narratives:              15 min TTL
└── Opportunity Radar scores:             2 hour TTL
```

### User Data: Supabase

No startup/market data is stored. Supabase holds user data only:

```sql
-- Auth handled by Supabase Auth (email + Google OAuth)

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  skills TEXT[],            -- ["python", "marketing", "sales"]
  location TEXT,            -- "Bangalore, IN"
  budget_range TEXT,        -- "0-10k" | "10k-50k" | "50k-500k" | "500k+"
  interests TEXT[],         -- ["AI", "FinTech", "CleanTech"]
  subscription_tier TEXT DEFAULT 'free',  -- free | starter | pro | enterprise
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  idea_text TEXT NOT NULL,
  validation_result JSONB,  -- cached viability report
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  messages JSONB NOT NULL DEFAULT '[]',
  active_idea_id UUID REFERENCES saved_ideas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,     -- "validate" | "xray" | "match" | "copilot_query"
  period TEXT NOT NULL,     -- "2026-03" (monthly) or "2026-03-23" (daily)
  count INT DEFAULT 1,
  UNIQUE(user_id, action, period)
);
```

### API Cost Budget (Monthly)

| Service | Plan | Cost | Purpose |
|---------|------|------|---------|
| NewsData.io | Business | $49/mo | 10K req/day real-time news |
| Exa.ai | Growth | $100/mo | Neural search for competitors, companies, people |
| SerpAPI or Serper.dev | Starter | $50/mo | Google Trends + job posting search |
| OpenAI GPT-4o-mini | Pay-as-you-go | ~$50-150/mo | AI synthesis (use mini for most, 4o for deep analysis) |
| Upstash Redis | Pay-as-you-go | ~$10/mo | Serverless cache |
| Supabase | Free → Pro | $0-25/mo | Auth + user data |
| Vercel | Pro | $20/mo | Hosting, edge functions, SSE |
| **Total** | | **$279-404/mo** | Breaks even at ~15 Starter or 6 Pro subscribers |

### Signal Triangulation Engine

An opportunity is only surfaced when **3+ independent signals from different source categories** converge.

**Signal categories** (an opportunity needs signals from at least 3 different categories):

| Category | Sources | What it measures |
|----------|---------|-----------------|
| Demand | Google Trends, Reddit, HN | Are people searching for / asking about this? |
| Hiring | Serper.dev job search | Are companies hiring for this problem? |
| Funding | SEC EDGAR, NewsData | Is money flowing into this space? |
| Competition | Exa.ai, ProductHunt, GitHub | How crowded is the market? |
| Regulatory | News, government RSS | Are laws creating tailwinds/headwinds? |
| Innovation | USPTO, OpenAlex, GitHub | Is new tech enabling this? |

**Confidence score formula:**

```
confidence = (
  signal_count_weight     * min(signals_found / 5, 1.0)     # 0-30 pts: more signals = higher
  + signal_strength_weight * avg(individual_signal_scores)    # 0-30 pts: how strong each signal is
  + recency_weight         * avg(signal_freshness_scores)     # 0-20 pts: newer signals = higher
  + diversity_weight       * (categories_covered / 6)         # 0-20 pts: more categories = higher
)

Where:
  signal_count_weight = 30
  signal_strength_weight = 30
  recency_weight = 20
  diversity_weight = 20

Individual signal scores (0-1):
  Google Trends: normalized YoY growth (capped at 500% = 1.0)
  Job postings: count / 20 (capped at 1.0)
  Funding deals: count in last 90 days / 10 (capped at 1.0)
  Reddit threads: count in last 30 days / 15 (capped at 1.0)
  Competition: inverted — fewer funded competitors = higher score

Signal freshness (0-1):
  < 7 days old = 1.0
  < 30 days = 0.7
  < 90 days = 0.4
  > 90 days = 0.1
```

**Example with real scoring:**

```
Signal 1: Google Trends "AI compliance" up 280% YoY → strength: 0.56, freshness: 1.0
Signal 2: 4 job postings this week → strength: 0.20, freshness: 1.0
Signal 3: EU AI Act news (regulatory) → strength: 0.80, freshness: 1.0
Signal 4: 2 funded competitors (low) → strength: 0.80, freshness: 0.7
Signal 5: 12 Reddit threads in 30 days → strength: 0.80, freshness: 0.7

confidence = 30 * min(5/5, 1.0) + 30 * avg(0.56, 0.20, 0.80, 0.80, 0.80)
           + 20 * avg(1.0, 1.0, 1.0, 0.7, 0.7) + 20 * (5/6)
           = 30 + 30*0.632 + 20*0.88 + 20*0.833
           = 30 + 19.0 + 17.6 + 16.7
           = 83.3 → displayed as 83

→ OPPORTUNITY: "AI-powered compliance for SMBs"
   Confidence: 83/100 | Competition: Low | Demand: Rising | TAM: $18B
   Evidence chain: [links to all 5 source queries with timestamps]
```

This is what makes WSI credible. Not opinions — scored evidence chains with transparent methodology.

## Six Intelligence Products

### 1. Opportunity Radar (Passive — Dashboard)

**Question:** "What should I build?"

**How it works:**
- Background AI continuously cross-references streaming data
- Identifies market gaps where: demand is rising + competition is low + market is large enough
- Each opportunity has:
  - Problem statement (who suffers, how much they pay for bad solutions)
  - Evidence chain (3-5 linked live signals)
  - Confidence score (0-100, based on signal strength)
  - Competition assessment (live scan of funded + unfunded players)
  - TAM estimate (with source)
  - Difficulty rating (technical, regulatory, capital requirements)
  - Best-fit founder profile (skills, location, budget range)
- Updated every few hours as new signals flow in
- Users can filter by: sector, geography, difficulty, budget range, founder skills

### 2. Idea Validator (Active — User Query)

**Question:** "Is my idea any good?"

**How it works:**
- User inputs: idea description (1-2 sentences)
- AI orchestrator fans out to 8+ live sources simultaneously:
  - Google Trends (demand signal)
  - Competitive scan (who else is doing this — funded, unfunded, adjacent)
  - Job postings (are companies hiring for this problem?)
  - Social sentiment (Reddit, Twitter, HN — are people complaining about this problem?)
  - Regulatory landscape (any tailwinds or headwinds?)
  - Patent filings (is someone blocking this space?)
  - Market sizing (bottom-up from available data)
  - Similar startup outcomes (who tried this before, what happened?)
- Returns a **Viability Report**:
  - Overall score (0-100)
  - Demand score, Competition score, Timing score, Feasibility score
  - Red flags (honest — "3 well-funded competitors", "declining search interest")
  - Green flags ("regulatory tailwind", "no incumbent under $50K/yr")
  - Suggested pivots if score is low
  - "Next steps if you proceed" checklist

### 3. Market Pulse (Passive — Streaming Dashboard)

**Question:** "What's happening in X sector right now?"

**How it works:**
- Per-sector live view combining all streaming sources
- Not a list of articles — a **synthesized narrative** updated every 5 minutes:
  - "AI sector: 3 deals closed today totaling $280M. Sentiment is bullish after Google's open-source announcement. Hiring up 12% WoW. Two new YC companies launched in computer vision."
- Includes: funding feed, news, social sentiment gauge, hiring trends chart, weekly deal volume
- Users pick sectors to watch (personalized)

### 4. Investor Match (Active — User Query)

**Question:** "Who would fund this?"

**How it works:**
- Input: your idea, stage, location, sector
- AI scans:
  - Recent deals in your sector (who invested, at what stage, what amounts)
  - Investor thesis statements (from their websites, interviews, Twitter)
  - Portfolio gaps (what they DON'T have yet)
  - Geographic preference (do they fund in your region?)
  - Stage preference (seed, A, B?)
- Returns ranked list of 10-20 investors with:
  - Match score and reasoning
  - Recent relevant deals
  - How to reach them (public info — Twitter, email format, AngelList)
  - Red flags ("hasn't done a seed deal in 18 months")

### 5. Competitive X-Ray (Active — User Query)

**Question:** "Who else is doing this?"

**How it works:**
- Input: idea description or sector
- AI finds ALL players — not just funded ones:
  - Funded competitors (from funding databases)
  - Unfunded competitors (ProductHunt, GitHub, IndieHackers)
  - Adjacent players who could pivot into your space
  - Enterprise incumbents with relevant products
- For each competitor:
  - Funding raised, team size, traffic estimates
  - Strengths and weaknesses (from reviews, social mentions)
  - Market positioning
- Identifies: whitespace (what nobody is doing), moat opportunities, differentiation angles
- Visual competitive map (2D positioning chart)

### 6. Founder Copilot (Active — Conversational AI)

**Question:** "Guide me step by step."

**How it works:**
- Persistent conversational AI in the right panel
- Context-aware: knows what you're viewing on the dashboard
- Guides through a structured journey:
  1. Discovery: "Tell me your skills, interests, budget, location"
  2. Matching: "Based on your profile, here are 3 opportunities from the Radar"
  3. Validation: "Let's validate #2 — I'll run the Idea Validator"
  4. Deep dive: "Here's the competitive landscape" (triggers X-Ray)
  5. Planning: "Here's a 90-day action plan to test this"
  6. Investor prep: "When you're ready, here's who to talk to" (triggers Match)
- Remembers conversation history (stored per user)
- Can answer ad-hoc questions anytime: "What's the EV market like in India right now?"
  → Fetches live data, synthesizes, responds with sources

## UX: Dashboard + Chat (Split Screen)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [WSI Logo + LIVE] [═══ Funding Ticker scrolling ═══] [Clock] [⟳] [☀]│
├─────────┬──────────────────────────────────┬────────────────────────┤
│         │                                  │                        │
│SIDEBAR  │  MAIN INTELLIGENCE PANEL         │  AI COPILOT CHAT       │
│         │                                  │                        │
│ Radar   │  Switches based on sidebar:      │  Always present.       │
│ Validate│  - KPI cards (always on top)     │  Context-aware of      │
│ Pulse   │  - Opportunity Radar cards       │  what's on screen.     │
│ Match   │  - Idea Validator results        │                        │
│ X-Ray   │  - Market Pulse live stream      │  "Analyze the EV       │
│ Copilot │  - Investor Match results        │   charging market      │
│         │  - Competitive X-Ray map         │   in Southeast Asia"   │
│─────────│  - Global ecosystem map          │                        │
│ Sectors │                                  │  → Rich response with  │
│ Settings│  Charts, maps, feeds —           │    live data, charts,  │
│         │  all with live indicators        │    and source links    │
│         │                                  │                        │
├─────────┴──────────────────────────────────┴────────────────────────┤
│ STATUS: Sources 12/15 live │ Last signal: 4s ago │ Next refresh: 28s│
└─────────────────────────────────────────────────────────────────────┘
```

### Layout Rules
- Chat panel: collapsible, 30% width when open
- Main panel: 70% when chat open, 100% when chat closed
- Sidebar: 52px collapsed (icons only), 200px expanded
- Mobile: chat becomes full-screen overlay, sidebar becomes bottom tabs
- KPI row always visible regardless of active section

### Chat Panel Behaviors
- Typing a question triggers on-demand queries to live sources
- Responses include inline charts, cards, and source citations
- Can reference dashboard content: "Tell me more about opportunity #3"
- Persistent session — remembers your ideas, validations, progress
- Quick actions: "/validate [idea]", "/xray [competitor]", "/match [sector]"

## Revenue Model

```
Free ($0/mo)
├── Market Pulse for 1 sector (24h delayed)
├── Top 3 opportunities on Radar (refreshed weekly)
├── 3 Copilot queries per day
└── Basic global map

Starter ($19/mo) — Aspiring founders
├── Full Opportunity Radar (real-time)
├── Idea Validator (10 validations/mo)
├── Market Pulse for 3 sectors (real-time)
├── Copilot (50 queries/day)
├── Competitive X-Ray (5/mo)
└── Weekly email brief

Pro ($49/mo) — Active founders
├── Everything in Starter (unlimited)
├── Investor Match (unlimited)
├── Competitive X-Ray (unlimited)
├── Custom alerts (sector shifts, new competitors)
├── Export reports (PDF, Notion)
├── API access (1K calls/mo)
└── Priority Copilot (faster, deeper responses)

Enterprise ($199+/mo) — Accelerators, VCs
├── Everything in Pro
├── White-label dashboards
├── Bulk API access
├── Custom AI reports
├── Team collaboration
└── Dedicated support
```

## Technical Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | SSR + API routes as BFF, streaming responses |
| AI | OpenAI GPT-4o-mini (bulk) + GPT-4o (deep) | Mini for synthesis/summaries, 4o for complex analysis |
| Streaming | Server-Sent Events (SSE) via Next.js Route Handlers | Real-time feed updates to dashboard |
| On-demand queries | Promise.allSettled + AI synthesis | Fan out to sources in parallel, graceful partial failure |
| Cache | Upstash Redis (serverless) | Persists across cold starts, pay-per-use, global edge |
| User data | Supabase (auth + user preferences only) | Auth, profiles, idea history, usage tracking |
| Chat | Vercel AI SDK + OpenAI tool_use | Streaming chat with function calling for live queries |
| Styling | Tailwind + shadcn/ui | Premium dark theme already built |
| Charts | Recharts | Already integrated |
| Maps | SVG (current) → Mapbox GL (Phase 3) | Interactive ecosystem visualization |
| Deployment | Vercel Pro | Edge functions, streaming, 100GB bandwidth |

### AI Orchestration Pattern

```
User Query: "Is an AI compliance tool for SMBs viable?"
                    │
                    ▼
          ┌─── AI ORCHESTRATOR (GPT-4o-mini) ───┐
          │  1. Parse query into search terms     │
          │  2. Determine which sources to query   │
          │  3. Generate source-specific queries   │
          └──┬──┬──┬──┬──┬──┬────────────────────┘
             │  │  │  │  │  │
             ▼  ▼  ▼  ▼  ▼  ▼  (Promise.allSettled — all parallel)
          Google  Serper  Reddit  USPTO   News   Exa.ai
          Trends  Jobs    API    Patents  Data   Search
             │  │  │  │  │  │
             ▼  ▼  ▼  ▼  ▼  ▼
          ┌─── RESULTS FILTER ───────────────────┐
          │  Drop failed sources (allSettled)     │
          │  Require minimum 3 successful sources │
          │  If <3: return partial with warning   │
          └──────────────────────────────────────┘
                    │
                    ▼
          ┌─── AI SYNTHESIZER (GPT-4o) ──────────┐
          │  Structured output via JSON mode:      │
          │  {                                     │
          │    overall_score: number,              │
          │    demand: { score, evidence[] },      │
          │    competition: { score, players[] },  │
          │    timing: { score, catalysts[] },     │
          │    red_flags: string[],                │
          │    green_flags: string[],              │
          │    sources: { url, label, fetched }[]  │
          │  }                                     │
          └────────────────────────────────────────┘
                    │
                    ▼
          Viability Report rendered as rich card
          with scores, flags, and linked sources
```

### Viability Report API Contract

```typescript
// POST /api/validate
// Request
interface ValidateRequest {
  idea: string;           // 1-500 characters
  user_context?: {        // optional, from profile
    skills: string[];
    location: string;
    budget_range: string;
  };
}

// Response (streamed via SSE for progressive rendering)
interface ViabilityReport {
  overall_score: number;  // 0-100
  scores: {
    demand: number;       // 0-100
    competition: number;  // 0-100 (higher = less competition = better)
    timing: number;       // 0-100
    feasibility: number;  // 0-100
  };
  evidence: {
    category: "demand" | "hiring" | "funding" | "competition" | "regulatory" | "innovation";
    signal: string;       // human-readable description
    strength: number;     // 0-1
    source_url: string;
    source_name: string;
    fetched_at: string;   // ISO timestamp
  }[];
  red_flags: string[];
  green_flags: string[];
  suggested_pivots: string[];   // if score < 50
  next_steps: string[];         // if score >= 50
  sources_queried: number;
  sources_succeeded: number;
  generated_at: string;
}
```

### Degradation Strategy

External APIs fail. The system must handle this gracefully:

```
Source health tracking (Upstash Redis):
├── Each source has a health key: "source:newsdata:health"
├── On success: set to "up", TTL 5 min
├── On failure: set to "down", TTL 1 min (retry sooner)
├── On 3 consecutive failures: set to "circuit_open", TTL 15 min (stop trying)
└── Status bar reads these keys to show "Sources 10/12 live"

Degradation levels:
├── All sources up:        Full intelligence, high confidence scores
├── 1-2 sources down:      Full intelligence, slightly lower confidence, warning badge
├── 3-4 sources down:      Partial intelligence, show "limited data" warning
├── 5+ sources down:       Switch to cached-only mode, show "degraded" banner
└── All sources down:      Show last cached results with "offline" indicator

Per-feature minimums:
├── Opportunity Radar:     Needs 3+ source categories → degrade to "fewer opportunities"
├── Idea Validator:        Needs 3+ sources → if <3, return partial report with caveat
├── Market Pulse:          Needs news + 1 other → if only news, show news-only mode
├── Competitive X-Ray:     Needs Exa.ai → if down, fall back to Serper.dev Google search
├── Investor Match:        Needs Exa.ai + news → if partial, reduce match list
└── Copilot:               Always works (AI can answer from context even if sources fail)
```

### Rate Limiting & Usage Enforcement

```
Enforcement via usage_tracking table + Upstash Redis counters:

Per-request flow:
1. Read user tier from Supabase (cached in Redis, 5 min TTL)
2. Check Redis counter: "usage:{user_id}:{action}:{period}"
3. If under limit → increment counter, proceed
4. If at limit → return 429 with upgrade prompt

Limits by tier:
├── Free:     3 copilot queries/day, 0 validations, 0 xrays, 0 matches
├── Starter:  50 copilot/day, 10 validate/mo, 5 xray/mo, 0 matches
├── Pro:      unlimited copilot, unlimited validate, unlimited xray, unlimited match
└── Enterprise: unlimited everything + API access

Free tier delay mechanism:
├── Free users get Market Pulse data from a "delayed" Redis key
├── Background job copies "live" keys to "delayed" keys every 24 hours
├── Free users read "delayed:pulse:{sector}" instead of "pulse:{sector}"
└── Simple key prefix swap, no separate pipeline needed
```

### Security

```
API Key Management:
├── All external API keys stored in Vercel environment variables
├── Never exposed to client — all calls go through /api/ BFF routes
├── Keys rotated quarterly via Vercel CLI

Authentication:
├── Supabase Auth (email + Google OAuth)
├── JWT tokens validated on every /api/ request via middleware
├── Row-level security (RLS) on all Supabase tables

Prompt Injection Mitigation:
├── User inputs (idea text, chat messages) are sanitized before AI prompts
├── AI system prompts are hardcoded, not user-modifiable
├── Structured output mode (JSON) prevents free-form injection
├── Copilot has strict tool_use definitions — it can only call defined functions

Rate Limiting:
├── Per-IP rate limiting via Vercel Edge Middleware (60 req/min)
├── Per-user rate limiting via Redis counters (see above)
└── AI endpoints have separate stricter limits (10 req/min per user)
```

### Monitoring & Observability

```
Source Health Dashboard (internal):
├── Upstash Redis stores per-source health status
├── Status bar on frontend shows live source count
├── Vercel Analytics for request metrics
└── Alert via webhook to Slack if 3+ sources go down

Key Metrics:
├── Source uptime per provider (% of checks returning "up")
├── P95 latency per source
├── AI synthesis latency (target: <15s for validator)
├── Cache hit rate (target: >60% for streaming layer)
├── User engagement: queries/day, validations/week, retention
└── Revenue: MRR, conversion rate free→paid, churn
```

## Implementation Phases

**Starting point:** Existing Next.js 16 codebase with Tailwind, shadcn/ui, Recharts, premium dark theme, sidebar navigation, KPI cards, funding feed, news feed, startup grid, global map, chart tabs, and static Opportunity Finder. All components use mock data.

### Phase 1: Core Platform Refactor + Chat + Live Feeds (Week 1-2)

**Goal:** Transform static dashboard into live platform with AI chat.

- Refactor page layout: add collapsible right panel for AI Copilot chat (30/70 split)
- Install Vercel AI SDK, configure OpenAI API connection
- Build basic Copilot chat with streaming responses
- Set up Upstash Redis for caching
- Build streaming data services:
  - RSS feed aggregator (awesome-tech-rss, TechCrunch, etc.)
  - HackerNews Firebase API integration
  - NewsData.io integration (replace mock news with live)
- Wire live feeds into existing Market Pulse / News Feed components
- Replace mock funding ticker with live RSS data
- Set up Supabase project: auth (email + Google), user_profiles table
- Add login/signup flow

### Phase 2: Opportunity Radar + Idea Validator (Week 3-4)

**Goal:** The two features that differentiate WSI from everything else.

- Build AI orchestrator service (`src/services/orchestrator.ts`):
  - Parallel query fan-out using Promise.allSettled
  - Source adapters: Exa.ai, Serper.dev, Reddit API, Google Trends, USPTO
  - Result normalization into common Signal type
- Build Signal Triangulation Engine (`src/services/triangulation.ts`):
  - Confidence scoring per the formula in this spec
  - Minimum 3-category requirement
- Build Idea Validator:
  - POST /api/validate endpoint
  - SSE streaming for progressive result rendering
  - Viability Report UI component with scores, evidence, flags
- Build Opportunity Radar:
  - Background job (Vercel Cron) runs triangulation every 2 hours
  - Results cached in Upstash Redis
  - Radar UI: filterable cards with demand meters, evidence chains
- Replace static Opportunity Finder with live Radar + Validator

### Phase 3: Competitive X-Ray + Investor Match (Week 5-6)

**Goal:** Complete the intelligence product suite.

- Build Competitive X-Ray:
  - POST /api/xray endpoint
  - Exa.ai search for funded competitors, ProductHunt launches, GitHub repos
  - AI synthesis into structured competitive landscape
  - 2D positioning chart visualization (Recharts scatter plot)
- Build Investor Match:
  - POST /api/match endpoint
  - Exa.ai search for recent investor activity by sector
  - AI scoring of investor-idea fit
  - Ranked list UI with match reasoning
- Add Copilot tool_use functions: /validate, /xray, /match as callable tools
- Connect Copilot context to active dashboard view

### Phase 4: Monetization + Production Readiness (Week 7-8)

**Goal:** Turn the platform into a business.

- Stripe integration: subscription checkout, webhook handling, portal
- Usage tracking: Redis counters + Supabase usage_tracking table
- Tier enforcement middleware on all /api/ endpoints
- Free tier: delayed data mechanism (24h key copy job)
- Export: PDF report generation for validation/xray results
- Email alerts: weekly digest via Resend.com
- Landing page with product demo, pricing, testimonials placeholder
- Mobile responsive pass (chat overlay, bottom tabs)
- Source health monitoring dashboard (internal)
- Error boundaries and degradation UX throughout

## Success Criteria

1. User can go from "I have no idea" to "here's a validated opportunity with investor targets" in under 30 minutes
2. Every piece of intelligence links to live source data — no hallucination, no stale claims
3. Opportunity Radar surfaces at least 10 unique, evidence-backed gaps per sector
4. Idea Validator returns results in under 15 seconds (parallel queries)
5. Platform feels alive — ticker moving, feeds updating, indicators pulsing
6. Free tier is useful enough to create word of mouth; paid tier is valuable enough to convert at 5%+

## Competitive Positioning (Honest Assessment)

| Competitor | Their strength | Their weakness | WSI's angle |
|------------|---------------|----------------|-------------|
| Crunchbase | Massive verified database, brand trust | No prediction, no "what to build", data goes stale | WSI doesn't compete on data volume — competes on *synthesis and guidance* |
| CB Insights | Deep analyst-quality intelligence | $50K/yr, enterprise sales cycle, no self-serve | WSI is self-serve, AI-generated (not analyst), 100x cheaper. Won't match their depth initially, but can match their *format* |
| ChatGPT/Claude | Powerful AI, conversational, broad knowledge | No live data, hallucination risk, no startup domain | WSI adds live data + evidence chains + structured tools. The AI is *grounded* |
| Perplexity | Live search + AI synthesis, fast | Generic — no startup domain, no persistent state, no structured outputs | WSI is Perplexity but vertical: startup-specific queries, persistent user journey, structured reports |
| PitchBook | Comprehensive deal data, investor trusted | $20K+/yr, investor-focused, no founder tools | WSI is founder-first. Different buyer, different price point, different UX |

**What WSI is NOT:**
- NOT a better Crunchbase database (we don't have their data volume and won't for years)
- NOT a cheaper CB Insights (we can't match human analyst depth)

**What WSI IS:**
- The first platform that connects live market signals → AI synthesis → actionable founder guidance
- Perplexity for startups — but with structured tools (Validate, X-Ray, Match) not just chat
- Priced for individuals ($19-49/mo), not enterprises

**WSI's real moat:** The founder journey. Once a user has validated 5 ideas, saved 3, tracked 2 sectors, and matched investors — switching costs are high. The intelligence is generic, but the *context* is personal.
