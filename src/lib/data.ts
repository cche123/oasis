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
    title: "Thrive Holdings acquires three regional MSPs in midwest push",
    source: "Wall Street Journal",
    sourceUrl: "https://wsj.com",
    date: "Today",
    category: "M&A",
    summary: "Thrive continues its aggressive roll-up strategy in the managed service provider space, acquiring firms in Ohio and Indiana.",
  },
  {
    id: "s2",
    title: "NVIDIA CEO Jensen Huang seen meeting with Japanese tech executives",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    date: "4 hours ago",
    category: "Geopolitics",
    summary: "NVIDIA is looking to strengthen its chip supply chain in Japan amidst geopolitical tensions.",
  },
  {
    id: "s3",
    title: "AWS announces $10B investment in new data center cluster",
    source: "MarketWatch",
    sourceUrl: "https://marketwatch.com",
    date: "Yesterday",
    category: "Infrastructure",
    summary: "Amazon is expanding its compute footprint to support growing demand for generative AI workloads.",
  },
  {
    id: "s4",
    title: "“The amount of capital flowing into defense tech right now is staggering. We are seeing valuations rivaling peak SaaS.”",
    source: "X / @chamath",
    sourceUrl: "https://twitter.com/chamath",
    date: "2 days ago",
    category: "Social",
    summary: "Prominent investor notes the massive inflow of venture capital into defense startups like Anduril.",
  },
  {
    id: "s5",
    title: "Novo Nordisk hits new record high as Wegovy sales beat estimates",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    date: "3 days ago",
    category: "Earnings",
    summary: "The Danish drugmaker solidifies its position as Europe's most valuable company.",
  },
  {
    id: "s6",
    title: "TSMC opens multi-billion dollar fabrication plant in Kumamoto, Japan",
    source: "Wall Street Journal",
    sourceUrl: "https://wsj.com",
    date: "5 hours ago",
    category: "Supply Chain",
    summary: "Backed by heavy Japanese government subsidies, TSMC expands its manufacturing base outside of Taiwan.",
  },
  {
    id: "s7",
    title: "“Mubadala just led a $500M round in a foundation model startup. Sovereign wealth is the new mega-VC.”",
    source: "X / @eladgil",
    sourceUrl: "https://twitter.com/eladgil",
    date: "12 hours ago",
    category: "Social",
    summary: "Silicon Valley insiders note the aggressive influx of Middle Eastern sovereign capital into generative AI.",
  },
  {
    id: "s8",
    title: "Rheinmetall shares surge as German defense budget hits €100B milestone",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    date: "Yesterday",
    category: "Markets",
    summary: "European defense contractors are seeing unprecedented backlog growth as NATO members hit 2% GDP spending targets.",
  },
  {
    id: "s9",
    title: "Mexico outpaces China as top exporter to the United States",
    source: "MarketWatch",
    sourceUrl: "https://marketwatch.com",
    date: "4 days ago",
    category: "Macro",
    summary: "For the first time in two decades, Mexico has surpassed China in trade volume to the US, solidifying the nearshoring thesis.",
  },
  {
    id: "s10",
    title: "“Data center power constraints are the new semiconductor shortage.”",
    source: "X / @bgurley",
    sourceUrl: "https://twitter.com/bgurley",
    date: "1 day ago",
    category: "Social",
    summary: "Venture capitalist highlights the severe energy grid bottlenecks facing AI infrastructure build-outs in Northern Virginia.",
  }
];

export const mockDeals: Deal[] = [
  {
    id: "d1",
    company: "Beacon Software",
    buyer: "Thoma Bravo",
    type: "Acquisition",
    rationale: "Platform investment for vertical software consolidation",
    date: "Oct 2023",
  },
  {
    id: "d2",
    company: "Sequence Holdings",
    buyer: "KKR",
    type: "Majority Stake",
    rationale: "Expanding footprint in accounting services roll-up",
    date: "Sep 2023",
  },
  {
    id: "d3",
    company: "Shield AI",
    buyer: "Series F Investors",
    type: "Venture Round",
    rationale: "$200M raised to scale autonomous pilot software",
    date: "Nov 2023",
  },
  {
    id: "d4",
    company: "Rapidus",
    buyer: "Japanese Government",
    type: "Grant",
    rationale: "¥330B subsidy to develop 2nm semiconductor manufacturing",
    date: "Dec 2023",
  },
  {
    id: "d5",
    company: "Mistral AI",
    buyer: "Mubadala",
    type: "Series A",
    rationale: "Strategic investment into European open-source foundation models",
    date: "Jan 2024",
  }
];
