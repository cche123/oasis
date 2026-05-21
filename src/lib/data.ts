export type Theme = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  interestScore: number;
  lastUpdated: string;
  tags: string[];
  isSaved?: boolean;
};

export type Signal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
};

export type Deal = {
  id: string;
  company: string;
  buyer: string;
  type: string;
  rationale: string;
  date: string;
};

export const categories = [
  "Technology",
  "Consumer",
  "Industrials",
  "Healthcare",
  "Financial Services",
  "Energy",
  "Media",
  "International Markets",
  "Private Markets",
  "Geopolitics",
];

export const mockThemes: Theme[] = [
  {
    id: "ai-enabled-roll-ups",
    title: "AI-enabled roll-ups",
    subtitle: "Consolidating fragmented services with software.",
    category: "Technology",
    interestScore: 5,
    lastUpdated: "2 hours ago",
    tags: ["Private Equity", "B2B Software", "Automation"],
    isSaved: true,
  },
  {
    id: "data-centers",
    title: "Data centers",
    subtitle: "The physical infrastructure powering the AI boom.",
    category: "Technology",
    interestScore: 4,
    lastUpdated: "1 day ago",
    tags: ["Infrastructure", "Real Estate", "Energy"],
    isSaved: true,
  },
  {
    id: "defense-technology",
    title: "Defense technology",
    subtitle: "Modernizing military capabilities with autonomous systems.",
    category: "Industrials",
    interestScore: 4,
    lastUpdated: "3 days ago",
    tags: ["Aerospace", "Government", "Hardware"],
    isSaved: true,
  },
  {
    id: "japan-semiconductors",
    title: "Japanese Semiconductor Subsidies",
    subtitle: "TSMC and Rapidus fuel a domestic chip renaissance.",
    category: "International Markets",
    interestScore: 5,
    lastUpdated: "12 hours ago",
    tags: ["Semiconductors", "Geopolitics", "Japan"],
    isSaved: true,
  },
  {
    id: "middle-east-sovereign-wealth",
    title: "Middle Eastern Sovereign Wealth in Tech",
    subtitle: "Mubadala and PIF aggressively moving into AI infrastructure.",
    category: "Private Markets",
    interestScore: 4,
    lastUpdated: "2 days ago",
    tags: ["Sovereign Wealth", "Venture Capital", "AI"],
    isSaved: false,
  },
  {
    id: "european-defense-procurement",
    title: "European Defense Procurement",
    subtitle: "NATO budget increases driving European aerospace consolidation.",
    category: "Geopolitics",
    interestScore: 3,
    lastUpdated: "1 week ago",
    tags: ["Europe", "Defense", "M&A"],
    isSaved: false,
  },
  {
    id: "glp-1-weight-loss",
    title: "GLP-1 Weight Loss Drugs",
    subtitle: "The cascading effects of Ozempic and Wegovy across industries.",
    category: "Healthcare",
    interestScore: 5,
    lastUpdated: "4 hours ago",
    tags: ["Pharma", "Consumer Packaged Goods", "Retail"],
    isSaved: true,
  },
  {
    id: "nearshoring-mexico",
    title: "Nearshoring to Mexico",
    subtitle: "Supply chains shifting away from China to North America.",
    category: "Industrials",
    interestScore: 2,
    lastUpdated: "2 weeks ago",
    tags: ["Logistics", "Real Estate", "Manufacturing"],
    isSaved: false,
  }
];

export const mockSignals: Signal[] = [
  {
    id: "s1",
    title: "U.S.–China Summit: Xi and Trump converge in Beijing for trade stabilization talks",
    source: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com/world/china/us-china-summit-beijing-trump-xi-trade-talks-8f4b5d2a",
    date: "Today",
    category: "Geopolitics",
    summary: "Markets rally on news that the U.S. has cleared Nvidia H200 chip sales to select Chinese buyers as part of a broader technology agreement.",
  },
  {
    id: "s2",
    title: "Cisco Systems (CSCO) shares surge 8% following AI-infrastructure driven Q3 beat",
    source: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com/news/articles/2026-05-14/cisco-shares-rally-as-ai-demand-offsets-legacy-slowdown",
    date: "2 hours ago",
    category: "Earnings",
    summary: "The networking giant reported record orders for its AI-native ethernet fabric, signaling a new growth cycle for high-speed connectivity.",
  },
  {
    id: "s3",
    title: "Kevin Warsh confirmed as Fed Chair in historic Senate vote",
    source: "Financial Times",
    sourceUrl: "https://www.ft.com/content/kevin-warsh-confirmed-fed-chair-monetary-policy-shift",
    date: "Today",
    category: "Macro",
    summary: "Investors are pricing in a more hawkish stance on inflation as Warsh takes the helm, with 10-year Treasury yields pushing toward 5.2%.",
  },
  {
    id: "s4",
    title: "“The U.S.–China deal on the Strait of Hormuz is the most significant energy peace treaty in a decade.”",
    source: "X / @pdanan",
    sourceUrl: "https://twitter.com/pdanan/status/1751532157123",
    date: "4 hours ago",
    category: "Energy",
    summary: "Geopolitical analysts highlight the unprecedented cooperation between Beijing and Washington to keep oil lanes open.",
  },
  {
    id: "s5",
    title: "Bitcoin breaks $82,000 as institutional demand for spot ETFs reaches new apex",
    source: "MarketWatch",
    sourceUrl: "https://www.marketwatch.com/story/bitcoin-record-high-82000-etf-inflows-2026",
    date: "1 hour ago",
    category: "Crypto",
    summary: "Digital assets continue to act as a flight-to-quality asset amidst global fiat currency volatility.",
  },
  {
    id: "s6",
    title: "Cerebras Systems IPO values AI chip startup at $42B after first-day pop",
    source: "Reuters",
    sourceUrl: "https://www.reuters.com/technology/cerebras-ipo-ai-chip-market-2026-05-14",
    date: "5 hours ago",
    category: "M&A",
    summary: "The successful listing underscores the 'AI-or-nothing' sentiment currently dominating public equity markets.",
  },
  {
    id: "s7",
    title: "Dow Jones reclaims 50,000 mark as manufacturing data signals 'soft landing'",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/05/14/dow-50000-record-high-economy-retail-sales.html",
    date: "3 hours ago",
    category: "Markets",
    summary: "Retail sales grew 0.5% in April, matching expectations and proving consumer resilience in a high-rate environment.",
  },
  {
    id: "s8",
    title: "Saudi PIF secures 20% stake in global tennis tour in $2.5B deal",
    source: "Financial Times",
    sourceUrl: "https://www.ft.com/content/saudi-pif-tennis-atp-investment-2026",
    date: "Yesterday",
    category: "Sports",
    summary: "The sovereign wealth fund adds to its massive sports portfolio, targeting structural changes in the ATP and WTA business models.",
  },
  {
    id: "s9",
    title: "“Wait until the market realizes the productivity gains from Agentic AI aren't 10%—they're 10x.”",
    source: "X / @sama",
    sourceUrl: "https://twitter.com/sama/status/1761532157123",
    date: "12 hours ago",
    category: "Social",
    summary: "Sam Altman hints at upcoming model releases that focus on autonomous economic agents.",
  },
  {
    id: "s10",
    title: "Brent Crude stabilizes at $106 after Xi–Trump energy security pact",
    source: "OilPrice",
    sourceUrl: "https://oilprice.com/Energy/Oil-Prices/Brent-Crude-Stabilizes-Xi-Trump-Summit.html",
    date: "Today",
    category: "Energy",
    summary: "Agreement to protect the Strait of Hormuz has removed the 'geopolitical risk premium' from oil prices temporarily.",
  }
];

export const mockDeals: Deal[] = [
  {
    id: "d1",
    company: "Cerebras Systems",
    buyer: "Public Markets (IPO)",
    type: "Listing",
    rationale: "Successful $42B IPO to fund manufacturing of WSE-3 wafer-scale AI chips",
    date: "Today",
  },
  {
    id: "d2",
    company: "Boeing",
    buyer: "China Southern Airlines",
    type: "Order",
    rationale: "Strategic purchase of 200 737 MAX aircraft as part of Xi–Trump summit agreement",
    date: "Today",
  },
  {
    id: "d3",
    company: "ATP Tour",
    buyer: "Saudi PIF",
    type: "Strategic Investment",
    rationale: "20% equity stake to modernize global tennis infrastructure and prize pools",
    date: "Yesterday",
  },
  {
    id: "d4",
    company: "Anduril Industries",
    buyer: "General Catalyst",
    type: "Series G",
    rationale: "$1.5B raised at $25B valuation to scale autonomous undersea vehicles",
    date: "2 days ago",
  },
  {
    id: "d5",
    company: "Mistral AI",
    buyer: "Microsoft",
    type: "Strategic Partnership",
    rationale: "Extended cloud compute agreement to power European sovereign AI clusters",
    date: "3 days ago",
  }
];
