# Oasis

**Real-time market intelligence that explains the *why*—not just the what.**

Oasis is a full-stack AI market copilot: it ingests live financial news, classifies macro themes, maps events to sectors and public companies, and surfaces private-market deal flow—all through a personalized, region-aware dashboard. Built for students, retail investors, and anyone who wants to understand markets faster without jumping across ten tabs.

> **Disclaimer:** Oasis is a market reasoning and education tool—not financial advice or a prediction engine.

---

## Problem & Insight

**The problem:** Financial news is extremely hard to process in real time. Most platforms show headlines, charts, or prices, but they do not explain *why* an event matters, which macro theme it belongs to, or which companies are most exposed.

**The insight:** The bottleneck is **interpretation**. A headline about oil, rates, AI regulation, or geopolitics still leaves the user to manually connect dots across sectors and tickers. Oasis automates that reasoning chain: filter noise → identify theme → map exposure → surface actionable context.

**Why this approach:** Rule-guided event classification plus structured UI (not a generic chat wrapper) keeps outputs inspectable and teachable—users see *how* a headline connects to markets, which supports financial literacy at scale.

---

## Product Overview

Oasis is organized as an end-to-end research environment—not a single feed.

| Section | What it does |
|--------|----------------|
| **My Oasis** | Personalized command center: live index/stock tickers, regional briefing, tracked symbols, Pulse preview, X voices |
| **Explore** | Discover macro themes (AI infra, defense, energy, regional shifts) with thesis, headlines, equities, and curated X voices |
| **Saved** | Persistent research library—saved themes and onboarding interests with live intel per topic |
| **Pulse** | Narrative heat: tiered, real-time signals showing *what is moving now* |
| **Signals** | Full live news feed (WSJ, CNBC, Google News, RSS) with category filters and structured **Oasis Insight** side panel (mechanism, triggers, risks) |
| **Wave** | Flagship **headline → theme → sector → S&P 500** mapper (Ripple engine + Wave stock resolver) |
| **Public Markets** | Quotes, watchlist, and public-equity lens |
| **Raises & Deals** | Live private-markets feed—venture rounds, PE, AI/defense, unicorns—with deal-level insight scaffolding |
| **Notes & Goals** | In-app workspace for thesis notes and weekly goals (persisted locally) |
| **Settings** | Profile, location/region resolution, theme (light/dark), X handle integration, feed refresh |
| **AI Chat** | Gemini assistant grounded in your region, interests, watchlist, and Wave context |
| **Music** | Ambient Oasis playlist (YouTube-backed player)—a deliberate UX layer for long research sessions; kicks in on landing/onboarding for a cinematic entry |

**Regional lenses:** United States, Europe, Japan, China, India, Singapore, Middle East—briefings and news priority adapt to the selected market, not a one-size-fits-all global feed.

---

## Execution & Technical Work

**Stack:** [Next.js](https://nextjs.org) 16, React 19, TypeScript, Tailwind CSS, API routes, [Vercel](https://vercel.com) deployment.

**Pipeline (simplified):**

```
Live RSS / Google News / regional feeds
        ↓
News API — dedupe, score, personalize by interests + region
        ↓
Ripple engine — theme / macro classification
        ↓
Wave stock resolver — company mentions, sector tables, scenario rules → S&P 500 picks
        ↓
UI sections (Pulse, Signals, Wave, Saved, Explore) + Gemini chat (context-injected)
```

**Substantial custom systems (not off-the-shelf):**

- **Wave / Ripple** — curated macro-event categories, multi-path equity resolution (direct mentions → scenario tables → controlled fallbacks), sector diversity caps
- **Pulse engine** — narrative tiering and heat scoring
- **Saved theme registry** — per-topic thesis, watchlist, features, and keyword filters
- **X Voices** — topic-mapped syndication feed + insight scaffolding for social signals
- **Private markets API** — venture/PE/deal aggregation with category filters and firm spotlight
- **Client + server caching** — stale-while-revalidate for smoother navigation across sections

**Functional artifact:** The app runs end-to-end—onboarding → personalized dashboard → live news → Wave mapping → chat → notes/settings—with iterative UI polish (landing scroll, page transitions, music bar).

---

## Evaluation & Evidence

**What we tested:** Real headlines across AI, oil/energy, rates/macro, geopolitics, and regional stories—checking whether Oasis produces *more useful context* than a raw news feed.

**Evidence of progress:**

- End-to-end ingestion of live news and market data
- Region- and interest-aware personalization
- Wave produces **headline-specific** equity sets (not static reuse across unrelated stories)
- Signals side panel generates structured insight (mechanism, triggers, risks) from headline text
- Raises & Deals surfaces categorized private-market activity with per-deal rationale

**Known limitations (honest):**

- Rule-based mapping can miss nuance on vague or indirect headlines—deeper NLP would improve Wave
- Likely connections are modeled, not proven causal links—users should not treat output as trade signals
- International coverage has regional *lenses* but not yet full local-equity mapping for every market
- Future work: backtesting similar events, portfolio exposure upload, stronger non-U.S. company coverage

---

## Setup

**Requirements:** Node.js 20+, npm

```bash
git clone <your-repo-url>
cd oasis
npm install
```

Create `.env.local`:

```env
GEMINI_API_KEY=          # Required for AI chat
TWITTER_BEARER_TOKEN=    # Optional: X/Twitter API
POLYGON_API_KEY=         # Optional: equity quotes
ALPHA_VANTAGE_API_KEY=   # Optional: quote fallback
```

```bash
npm run dev    # http://127.0.0.1:3000
npm run build
npm run start
npm run lint
```

---

## Usage

1. **Land → Onboarding** — set name, interests, optional location; ambient music optional on entry.
2. **My Oasis** — pick international market lens; scan tickers, briefing, and tracked symbols.
3. **Pulse / Signals** — scan what’s moving; click a signal for Oasis Insight breakdown.
4. **Wave** — select or paste a headline; review theme, sectors, and mapped tickers.
5. **Raises & Deals** — filter venture, PE, AI/defense; read deal thesis and firm activity.
6. **Explore / Saved** — deep-dive themes with live headlines, equities, and X voices.
7. **Notes** — capture thesis and weekly goals while researching.
8. **Settings** — update region, X handle, appearance; refresh feeds.
9. **Chat** — ask contextual questions (e.g. *“How does this oil headline affect airlines?”*).

---

## Communication & Reproducibility

This README is the primary out-of-repo guide for reviewers. For video/demo: walk Problem → Wave demo → Signals insight panel → Raises & Deals → regional lens → chat → limitations.

**Repo artifacts:** Public git history, `src/lib/` engines (`ripple-engine.ts`, `wave-stock-resolver.ts`, `pulse-engine.ts`), and API routes under `src/app/api/` document iteration over time.

---

## Process, Integrity & AI Disclosure

| Tool | Role |
|------|------|
| **Google Gemini** | In-app chatbot via API; prompts include user region, interests, watchlist, Wave context |
| **Google Antigravity** | AI-assisted IDE for scaffolding UI, debugging API routes, interface iteration |
| **Cursor** | Additional AI-assisted coding during development |

**Author ownership:** Product architecture, Wave/Ripple logic, theme registry, regional personalization model, and final implementation decisions were designed and assembled by the project author. AI tools accelerated scaffolding and debugging—they did **not** replace the core mapping design.

**Base code:** Bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app); substantially extended with custom engines, APIs, and UI. No forked third-party dashboard codebase.

**Collaborators:** Solo project unless otherwise noted in commit history.

---

## Citations & Acknowledgements

**News & RSS:** Reuters, Wall Street Journal (where available), Google News, MarketWatch, BBC, TechCrunch, Economic Times, Mint, Straits Times, and feeds in `src/lib/news-feeds.ts` / `src/lib/regional-news.ts`.

**Market data:** Yahoo Finance (default); optional [Polygon](https://polygon.io), [Alpha Vantage](https://www.alphavantage.co).

**Social / X:** Curated accounts via Twitter syndication and optional Twitter API; supplemental social headlines via Google News.

**AI:** [Google Gemini API](https://ai.google.dev).

**UI / libs:** [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/), [Lucide](https://lucide.dev), [next-themes](https://github.com/pacocoursey/next-themes).

**Music:** Curated playlist via YouTube embed API (`src/lib/playlist.ts`, `src/lib/youtube-audio.ts`)—UX enhancement only; not part of market data pipeline.

---

## External Links

- [Next.js docs](https://nextjs.org/docs) · [Vercel deploy](https://vercel.com/docs)
- [Google Gemini](https://ai.google.dev) · [Google Antigravity](https://antigravity.google/)
- [Polygon.io](https://polygon.io) · [Alpha Vantage](https://www.alphavantage.co)

---

## Rubric Alignment (15 pts)

| Criterion | Where addressed |
|-----------|-----------------|
| **Problem & Insight (3)** | [Problem & Insight](#problem--insight) |
| **Execution & Technical Work (5)** | [Product Overview](#product-overview), [Execution & Technical Work](#execution--technical-work) |
| **Evaluation & Evidence (3)** | [Evaluation & Evidence](#evaluation--evidence) |
| **Communication & Presentation (2)** | This README, [Usage](#usage), demo video |
| **Process, Integrity & Disclosure (2)** | [Process, Integrity & AI Disclosure](#process-integrity--ai-disclosure), [Citations](#citations--acknowledgements) |

---

## License

Private / academic project unless otherwise noted by the repository owner.
