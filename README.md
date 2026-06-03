# Oasis

Oasis is an AI-powered market intelligence dashboard that turns real-time financial news into structured context: themes, sectors, and public companies most likely exposed to an event—not just headlines and prices.

## Overview

Most platforms show what moved; Oasis focuses on **why it matters**. Users pick a regional lens (U.S., Europe, Japan, China, India, Singapore, Middle East), scan live signals, and use **Wave**—a custom event-to-equity mapping layer—to connect headlines to S&P 500 names via theme classification, sector logic, and scenario rules.

**Core sections**

| Section | Purpose |
|--------|---------|
| **My Oasis** | Personalized home: live tickers, regional briefing, tracked symbols |
| **Explore** | Browse market themes and narratives |
| **Saved** | Research workspace for themes and interests |
| **Pulse** | What’s moving now—narrative heat and signals |
| **Wave** | Headline → macro theme → sector → company mapping |
| **Public Markets** | Quotes and watchlist |
| **Signals** | Aggregated live news feed with insight scaffolding |
| **AI chat** | Gemini-backed assistant grounded in region, interests, and Wave context |

**Stack:** Next.js, React, API routes, live RSS/news and market data, deployed on [Vercel](https://vercel.com).

> **Disclaimer:** Oasis is for market reasoning and education, not financial advice or predictions.

## Setup

**Requirements:** Node.js 20+, npm

```bash
git clone <your-repo-url>
cd oasis
npm install
```

Create `.env.local` (optional keys improve live data):

```env
GEMINI_API_KEY=          # AI chat (required for chatbot)
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

## Usage

1. Open the app and complete **onboarding** (interests, optional location).
2. On **My Oasis**, set your **international market lens** and review the regional briefing and tickers.
3. Use **Pulse** and **Signals** for live, filtered headlines.
4. Open **Wave**, pick or paste a headline, and review mapped themes, sectors, and tickers.
5. **Explore** / **Saved** for deeper theme thesis, headlines, and X voices.
6. Ask the **AI assistant** in context (e.g. “How does this oil headline affect airlines?”).

## AI usage disclosure

- **Google Gemini** powers the in-app chatbot via API. Responses are guided by Oasis context (region, interests, Wave output, watchlist)—not generic web answers alone.
- **Google Antigravity** was used as an AI-assisted development environment to scaffold UI, debug API routes, and iterate on the interface.
- **Cursor** and other coding assistants may have been used during development.

Architecture, **Wave** / Ripple logic, product structure, and implementation decisions were designed and assembled by the project author. AI tools accelerated scaffolding and debugging; they did not replace the core mapping design or product intent.

## Citations & acknowledgements

**News & data sources (RSS / public APIs):** Reuters, Wall Street Journal (where available), Google News, MarketWatch, BBC, TechCrunch, and other feeds configured in `src/lib/news-feeds.ts` and regional news modules.

**Market data:** Yahoo Finance (default), with optional [Polygon](https://polygon.io) and [Alpha Vantage](https://www.alphavantage.co).

**X / social signals:** Curated public accounts via syndication and optional Twitter API; Google News for supplemental social headlines.

**Libraries:** [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/), [Lucide](https://lucide.dev).

## External links

- [Next.js documentation](https://nextjs.org/docs)
- [Vercel deployment](https://vercel.com/docs)
- [Google AI / Gemini](https://ai.google.dev)
- [Google Antigravity](https://antigravity.google/) — AI-assisted IDE used during development

## License

Private / academic project unless otherwise noted by the repository owner.
