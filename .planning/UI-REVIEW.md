# Phase 01 — UI Review

**Audited:** 2026-03-24
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md present)
**Screenshots:** Not captured (no dev server detected on ports 3000, 5173, or 8080)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | CTAs are specific and action-oriented; 9 components fall back to generic "Something went wrong" |
| 2. Visuals | 3/4 | Strong icon + glassmorphism system; icon-only buttons (refresh, theme) lack aria-labels |
| 3. Color | 2/4 | Dark mode token system is solid but 98 hardcoded hex/rgb values across 15 components |
| 4. Typography | 2/4 | Arbitrary text sizes dominate (179 uses of `text-[Npx]`) alongside named scale sizes |
| 5. Spacing | 3/4 | Mostly Tailwind scale; arbitrary height/width values (`h-[420px]`, `h-[250px]`) present |
| 6. Experience Design | 3/4 | Loading + error states on all AI tools; icon-only buttons lack accessible labels |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **Generic fallback error messages across 9 AI tool components** — When any API call fails, users see "Something went wrong" with no actionable guidance. This is a dead end for users who paid for a service. Fix: replace the generic fallback in each tool's `catch` block with a tool-specific message, e.g. in `idea-validator.tsx` line 180: change `"Something went wrong"` to `"Validation service unavailable. Check your API key or try again in a moment."` Repeat for all 9 affected components.

2. **179 arbitrary font-size tokens scattered across 24 component files** — The codebase mixes named Tailwind scale sizes (`text-sm`, `text-xs`) with 179 instances of pixel-value overrides (`text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`). This creates an uncontrolled, inconsistent type scale with at least 10+ distinct effective sizes. Fix: define 5–6 custom text sizes in `tailwind.config` (e.g. `text-2xs: 10px`, `text-micro: 9px`) and replace all `text-[Npx]` classes with the named tokens. This reduces the visual inconsistency and makes future type-scale changes a single-line edit.

3. **98 hardcoded hex color values across 15 component files** — The `landing-preview.tsx` alone uses 52 hardcoded hex strings in inline `style` props (e.g. `#0a0a0f`, `#f472b6`, `#a78bfa`). These bypass the design token system established in `globals.css` (`.dark` variables). If the theme changes, the landing preview will not update. Fix: extract the `LandingPreviewContent` inline styles into a dedicated CSS module or at minimum map them to CSS custom properties from the dark theme (`var(--background)`, `var(--primary)`, etc.).

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Strengths:**
- All 9 AI tool CTAs are specific and descriptive: "Validate", "Scan", "Find Investors", "Generate Pitch Deck", "Generate Names", "Generate Roadmap", "Find My Ideas", "Generate Landing Page". No generic "Submit" or "OK" patterns on primary actions.
- The chat empty state (`chat-panel.tsx` line 159–177) provides 3 contextual starter prompts, guiding the user directly to value.
- Loading states have descriptive in-progress copy: "Scanning Reddit, GitHub, ProductHunt, HackerNews..." (`competitive-xray.tsx` line 165), "Querying Reddit, GitHub, HackerNews, ProductHunt..." (`idea-validator.tsx` line 235). The pitch generator cycles through 3 loading step labels (lines 17–21).
- Error states show the raw API error message when available, which is more useful than a fixed string.

**Issues:**
- 9 components fall back to `"Something went wrong"` as the catch-all error (`competitive-xray.tsx:108`, `founder-quiz.tsx:260`, `idea-validator.tsx:180`, `investor-match.tsx:75`, `landing-preview.tsx:552`, `launch-roadmap.tsx:148`, `name-generator.tsx:103`, `pitch-generator.tsx:98`). This is a generic, non-actionable message.
- `error-card.tsx` line 19 uses the generic label "Failed to load data" — this component is potentially used for any data error but provides no context.
- The `funding-feed.tsx` (line 56–58) and `news-feed.tsx` (line 80–82) empty/error states use identical copy: "Unable to fetch live [data|funding] data. Will retry automatically." This is acceptable but lacks any guidance on manual retry.
- The sidebar section `profile` renders nav label "Founder Match" but the component heading (`founder-quiz.tsx` line 306) calls it "Founder Profile Match" — minor label inconsistency.

### Pillar 2: Visuals (3/4)

**Strengths:**
- Consistent section header pattern: icon (colored) + h3 title + badge pill. Present in `funding-feed.tsx`, `news-feed.tsx`, `opportunity-finder.tsx`, `idea-validator.tsx`, `competitive-xray.tsx` and all other tool panels. Creates strong visual rhythm.
- Glassmorphism system (`glass`, `glass-strong`, `gradient-border` CSS classes) is applied consistently across all panel containers. The animated ticker in the header creates a clear live-data focal point.
- Each AI tool panel uses a unique gradient accent on the icon container (emerald-cyan for Idea Validator, orange-red for Pitch, violet-pink for Names, pink-rose for Landing Page) — good visual differentiation between tools.
- `metric-card.tsx` implements a hover scale effect (`hover:scale-[1.02]`) and animated sparklines, providing a premium feel on the KPI row.
- The `FounderQuiz` step progress bar with numbered indicators is well-structured visual flow.

**Issues:**
- The refresh button (`header.tsx` line 130–139) and theme toggle (lines 142–155) are icon-only `Button` components with no `aria-label`. Users relying on screen readers have no indication of their function.
- The AI Copilot toggle button (`header.tsx` line 110–120) shows icon + "AI Copilot" text only on `sm:` breakpoints. On small screens it is icon-only with no accessible label.
- `MobileNav` close button (`mobile-nav.tsx` line 85) is an icon-only `<button>` with no `aria-label`.
- `ChatInput` submit button (`chat-input.tsx` line 34–43) is icon-only (ArrowUp / Loader2) with no `aria-label`.
- The `LandingPreview` FAQ expand button uses `+` as a text character with `transform: rotate(45deg)` for open state instead of a semantic chevron icon — visual affordance works but semantics are weak.

### Pillar 3: Color (2/4)

**Token system (positive):**
- `globals.css` defines a comprehensive dark mode color token set using CSS custom properties (lines 86–118): `--background: #0a0a0f`, `--primary: #818cf8`, `--chart-1` through `--chart-5`, etc.
- `page.tsx` uses `bg-[#0a0a0f]` inline which matches `--background`, but this is a hardcoded duplicate.
- Named Tailwind utilities (`text-emerald-400`, `text-indigo-400`, `text-muted-foreground`) are used correctly in the majority of components.

**Issues:**
- 98 hardcoded hex/rgb values found across 15 component files. The worst offender is `landing-preview.tsx` with 52 occurrences — the entire in-page preview and HTML generator use raw hex values that are disconnected from the token system (`#0a0a0f`, `#f472b6`, `#a78bfa`, `#e8e8f0`, `#7878a0`, etc.).
- `opportunity-finder.tsx` (lines 209–219) has inline SVG `stroke` colors using raw hex `#818cf8` (same as `--primary`) and `rgba(255,255,255,0.05)` — these should reference CSS variables.
- `idea-validator.tsx` (lines 62–63) computes `color` using raw hex in a conditional expression: `score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#ef4444"` — these map to `emerald-400`, `amber-400`, and `red-400` but are hardcoded.
- `header.tsx` (line 162) applies `bg-gradient-to-r from-[#0a0a0f]` — inline color duplicating the background token.
- The dark mode token system (CSS variables) is only activated under `.dark` class (globals.css line 86), but `:root` has light-mode values. The app renders dark by default (`bg-[#0a0a0f]` on the root div in `page.tsx`) without applying the `.dark` class to the HTML element — this means the CSS custom properties in `.dark` may not be active unless `next-themes` properly sets the class. Worth verifying at runtime.

### Pillar 4: Typography (2/4)

**What is used:**
- Named Tailwind scale: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl` (from pricing-cards.tsx)
- Arbitrary pixel sizes (179 occurrences across 24 files): `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`
- Font weights in use: `font-medium`, `font-semibold`, `font-bold`, `font-extrabold` (indirectly in pricing)

**Issues:**
- The codebase effectively uses **14+ distinct type sizes** (6 arbitrary sizes + 8+ named scale entries). Best practice for a dashboard is 5–6 controlled sizes. The proliferation of arbitrary sizes indicates ad-hoc sizing decisions rather than a deliberate scale.
- `text-[8px]` appears in multiple badge elements (e.g. `sidebar.tsx` line 81, `competitive-xray.tsx` line 47) — 8px text renders at approximately 0.5rem and is below WCAG recommended minimum readable size of 12px for non-decorative text.
- `text-[9px]` is used heavily in live indicator labels (`LIVE`, category badges, status text) across the header, feeds, and sidebar. At 9px these are near the threshold of legibility at standard viewing distances, especially given the low-contrast muted-foreground text color.
- The `chat-message.tsx` uses a 360-character `className` string (line 39) to define all inline Tailwind prose styles. This is a maintenance risk; a shared `prose-sm` variant or CSS class would be more maintainable.
- Font weight is generally well-controlled: 4 weights (`medium`, `semibold`, `bold`, and `font-mono` in header clock). This meets the 2–4 weight guideline.

### Pillar 5: Spacing (3/4)

**Strengths:**
- Consistent card padding: `p-4` and `p-5` throughout all panel cards.
- Consistent section gap: `gap-3`, `gap-4`, `gap-5`, `gap-6` from the Tailwind scale.
- `mb-5` is the standard section separator in `page.tsx` (lines 107–233), creating a uniform vertical rhythm.
- Component header padding is consistently `px-4 py-3` across feeds and tool panels.

**Issues:**
- Arbitrary height values: `h-[420px]` in `global-map.tsx` line 78 and `h-[250px]` in `section-skeleton.tsx` line 63. These are fine for specific layout constraints but `h-[420px]` in particular is baked in with no responsive variant, which may cause issues at tablet heights.
- The `chat-panel.tsx` uses a fixed width `w-[380px]` (line 133) with no responsive breakpoint adjustment. On screens 380–768px wide this panel will occupy the full viewport.
- `landing-preview.tsx` mixing: the preview container uses `style={{ maxHeight: "600px" }}` (line 173) — an inline px value rather than a Tailwind class. `max-h-[600px]` would be more consistent.
- `section-skeleton.tsx` (line 40) uses `h-[400px]` for the map skeleton and `h-[250px]` for the chart skeleton. These px values are hardcoded and should match the actual rendered heights of the components they represent.

### Pillar 6: Experience Design (3/4)

**Strengths:**
- All 9 AI tool components (`idea-validator`, `competitive-xray`, `investor-match`, `pitch-generator`, `name-generator`, `launch-roadmap`, `founder-quiz`, `landing-preview`, `opportunity-finder`) implement dedicated loading states with spinner animations and descriptive progress text.
- All 9 tool components implement error state rendering with `AlertTriangle` icon and the API error message surfaced to the user.
- The feeds (`funding-feed.tsx`, `news-feed.tsx`) handle both loading and error/empty states inline.
- `chat-panel.tsx` handles streaming errors: response body errors (line 71–82), missing reader (line 85–95), AbortError (line 113), and generic errors (line 114–119). This is comprehensive.
- Submit buttons are disabled when required fields are empty (`disabled={!idea.trim() || isLoading}`) across all tool forms.
- The `PitchGenerator` cycles through 3 loading step labels via `setInterval` providing temporal feedback during a long AI operation.
- `FounderQuiz` implements a multi-step flow with `Back` navigation, preventing data loss between steps.
- `MetricCard` has a skeleton loading shimmer state for the KPI row.

**Issues:**
- Icon-only interactive controls lack accessible labels: refresh button, theme toggle, AI Copilot (mobile), chat submit, mobile menu close — none have `aria-label`. These are fails for screen reader users.
- There is no `ErrorBoundary` component wrapping sections. A runtime JS error in any feed or tool will crash the entire dashboard rather than showing an isolated error UI.
- The `opportunity-finder.tsx` "Validate This Idea" link (line 269–278) uses `href="#validate"` — an anchor hash rather than the router-based section navigation used everywhere else. This will not trigger the React state change to `activeSection === "validate"` and will instead scroll the page.
- `funding-feed.tsx` and `news-feed.tsx` error states (lines 55–58 and 80–82) do not expose a retry button — users must wait for the auto-refetch interval. A "Retry now" button referencing `refetch()` from `useQuery` would improve recovery UX.
- The `MobileNav` "More" overlay dismisses on nav item click but provides no swipe-to-close or Escape-key handler, reducing accessibility of the overlay on mobile.

---

## Registry Safety

shadcn is initialized (`components.json` present). No UI-SPEC.md exists to reference third-party registry entries.
Registry audit: 0 third-party blocks to check (no UI-SPEC registry table). shadcn official components only (`ui/button`, `ui/card`, `ui/tabs`, `ui/badge`, `ui/skeleton`, `ui/input`, `ui/textarea`, `ui/select`, `ui/dialog`, `ui/sheet`, `ui/tooltip`, `ui/scroll-area`, `ui/command`, `ui/separator`).

---

## Files Audited

**App**
- `/Users/bhanu.prakash/Documents/Startup-Intelligence-Dashboard-main/src/app/page.tsx`
- `/Users/bhanu.prakash/Documents/Startup-Intelligence-Dashboard-main/src/app/globals.css`

**Layout**
- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/status-bar.tsx`

**Chat**
- `src/components/chat/chat-panel.tsx`
- `src/components/chat/chat-input.tsx`
- `src/components/chat/chat-message.tsx`

**Feeds**
- `src/components/feeds/funding-feed.tsx`
- `src/components/feeds/news-feed.tsx`

**Common**
- `src/components/common/metric-card.tsx`
- `src/components/common/empty-state.tsx`
- `src/components/common/error-card.tsx`
- `src/components/common/section-skeleton.tsx`

**Opportunities / Tools**
- `src/components/opportunities/opportunity-finder.tsx`
- `src/components/opportunities/idea-validator.tsx`
- `src/components/opportunities/competitive-xray.tsx`
- `src/components/opportunities/investor-match.tsx`
- `src/components/opportunities/pitch-generator.tsx`
- `src/components/opportunities/name-generator.tsx`
- `src/components/opportunities/launch-roadmap.tsx`
- `src/components/opportunities/founder-quiz.tsx`
- `src/components/opportunities/landing-preview.tsx`

**Grep pattern audits run across:** all `*.tsx` files under `src/components/`
