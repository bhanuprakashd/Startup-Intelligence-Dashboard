# WSI - World Startup Intelligence

> From zero to startup in minutes. AI-powered intelligence platform with 13 tools backed by live market data.

**Live:** [wsi-app.vercel.app](https://wsi-app.vercel.app)

## What is WSI?

WSI is a real-time startup intelligence platform that helps founders discover, validate, and launch startup ideas. Unlike Crunchbase (database) or CB Insights ($50K/yr), WSI combines **live market data** from free APIs with **AI synthesis** to deliver actionable intelligence at zero cost.

**The complete founder journey in one platform:**

```
Founder Quiz finds YOUR best idea
  -> Validate confirms it's viable with evidence
    -> X-Ray maps competitors
      -> Name + Domain gives you a brand
        -> Landing Page brings it to life
          -> Pitch Deck prepares for investors
            -> 90-Day Roadmap tells you what to do
              -> Investor Match finds who to pitch
```

## 13 Intelligence Tools

| Tool | Description |
|------|------------|
| **Overview Dashboard** | Live KPIs, global map, funding feed, news |
| **Global Map** | 18 startup ecosystems with interactive markers |
| **Live Funding Feed** | Real-time articles from TechCrunch Venture RSS |
| **Intelligence News** | Live HackerNews stories filtered for startups |
| **Idea Validator** | Input idea -> live signal triangulation + AI viability report |
| **Competitive X-Ray** | Scan GitHub, Reddit, ProductHunt, HN for competitors |
| **Investor Match** | AI finds top 10 matching investors with reasoning |
| **Pitch Deck Generator** | Full 10-slide pitch deck outline with market data |
| **Name + Domain Checker** | AI generates 10 names, checks .com availability live |
| **90-Day Launch Roadmap** | Week-by-week action plan based on your skills/budget |
| **Founder Match Quiz** | Multi-step quiz -> personalized idea recommendations |
| **Landing Page Generator** | AI generates a full landing page with live preview |
| **AI Copilot** | Chat assistant for any startup question |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | OpenRouter (nvidia/nemotron-3-super-120b-a12b:free) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| State | TanStack Query v5 |
| Cache | Upstash Redis (optional, falls back to in-memory) |
| Auth | Supabase (optional) |
| Deploy | Vercel |

## Live Data Sources (All Free, No API Keys Required)

| Source | Data |
|--------|------|
| HackerNews Firebase API | Startup-filtered trending stories |
| TechCrunch RSS | Venture/funding news |
| Reddit JSON API | Community discussions and sentiment |
| GitHub Search API | Open-source competitors and activity |
| ProductHunt | Launched products |
| Google DNS | Domain availability checking |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone
git clone https://github.com/bhanuprakashd/Startup-Intelligence-Dashboard.git
cd Startup-Intelligence-Dashboard

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Add your OpenRouter API key (required for AI features)
# Get a free key at https://openrouter.ai/keys
# Edit .env.local and add: OPENROUTER_API_KEY=sk-or-...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | AI features (free model available) |
| `UPSTASH_REDIS_REST_URL` | No | Caching (falls back to in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Caching |
| `NEWSDATA_API_KEY` | No | Additional news source |
| `NEXT_PUBLIC_SUPABASE_URL` | No | User authentication |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | User authentication |

## Architecture

```
User Query -> AI Orchestrator -> Promise.allSettled (parallel)
                                   |-> Reddit API
                                   |-> GitHub API
                                   |-> HackerNews API
                                   |-> ProductHunt
                                 -> Signal Triangulation Engine
                                   |-> Confidence scoring (0-100)
                                   |-> Category diversity check
                                   |-> Signal freshness weighting
                                 -> AI Synthesis (OpenRouter)
                                   |-> Structured viability report
                                   |-> Evidence chains with sources
```

## Project Structure

```
src/
├── app/
│   ├── api/           # 14 API endpoints (chat, validate, xray, match, pitch, names, roadmap, etc.)
│   ├── launch/        # Marketing landing page
│   ├── pricing/       # Pricing page
│   ├── login/         # Auth page
│   └── page.tsx       # Main dashboard
├── components/
│   ├── chat/          # AI Copilot chat panel
│   ├── charts/        # Recharts visualizations
│   ├── common/        # Shared components (metric cards, skeletons)
│   ├── feeds/         # Live funding + news feeds
│   ├── layout/        # Header, sidebar, status bar, mobile nav
│   ├── map/           # Global ecosystem map
│   ├── opportunities/ # Validator, X-Ray, Pitch, Names, Roadmap, Quiz, Landing
│   ├── pricing/       # Pricing cards
│   ├── startups/      # Startup grid
│   └── ui/            # shadcn/ui primitives
├── services/          # API adapters (Reddit, GitHub, HN, RSS, cache, orchestrator)
├── hooks/             # TanStack Query hooks
├── types/             # TypeScript interfaces
├── lib/               # Utilities, constants, Supabase clients
└── providers/         # Theme + Query providers
```

## Deploy

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
echo "your-key" | vercel env add OPENROUTER_API_KEY production
```

## License

MIT
