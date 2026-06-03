import type { Theme } from "@/lib/data";

export type SavedFeature = {
  label: string;
  href: string;
  why: string;
};

export type SavedThemeProfile = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  thesis: string;
  mechanism: string;
  whatToWatch: string[];
  risks: string[];
  relatedTickers: string[];
  features: SavedFeature[];
  keywords: string[];
  lastUpdated?: string;
  interestScore?: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function profile(
  partial: Omit<SavedThemeProfile, "id"> & { id?: string; title: string }
): SavedThemeProfile {
  return {
    id: partial.id ?? slugify(partial.title),
    ...partial,
  };
}

/** Topic-specific intelligence — every saved interest/theme gets unique copy and features. */
const PROFILES: Record<string, SavedThemeProfile> = {
  "ai-enabled-roll-ups": profile({
    title: "AI-enabled roll-ups",
    subtitle: "Software-led consolidation of fragmented service businesses.",
    category: "Private Markets",
    thesis:
      "Roll-ups use AI to standardize ops, pricing, and back-office — the thesis is margin expansion + multiple arbitrage vs. standalone SMBs.",
    mechanism:
      "Deal flow → platform build → add-on M&A → EBITDA growth. Public comps re-rate when software attach rates rise.",
    whatToWatch: [
      "New platform announcements and add-on cadence (deals per quarter)",
      "Debt financing terms — roll-ups are rate-sensitive at the holdco level",
      "Labor / union headlines in target verticals (healthcare services, IT MSPs)",
    ],
    risks: [
      "Integration debt if AI promises outpace actual workflow adoption",
      "Regulatory scrutiny on roll-up accounting and customer concentration",
    ],
    relatedTickers: ["MSFT", "ORCL", "ADP", "BR", "KKR"],
    features: [
      { label: "Raises & Deals", href: "/private-markets", why: "Track PE platforms and add-on activity" },
      { label: "Wave", href: "/wave", why: "Macro/rates shocks hit leveraged buyout math first" },
      { label: "Pulse", href: "/pulse", why: "Narrative heat on consolidation themes" },
    ],
    keywords: ["roll-up", "roll up", "consolidation", "buyout", "private equity", "software services", "ai-enabled"],
    interestScore: 5,
    lastUpdated: "Live",
  }),

  "data-centers": profile({
    title: "Data centers",
    subtitle: "Power, land, and connectivity for the AI buildout.",
    category: "Technology",
    thesis:
      "Hyperscaler capex and GPU density are driving a multi-year cycle in DC REITs, utilities, and cooling vendors.",
    mechanism:
      "Power availability → PPA pricing → DC development timelines → REIT/utility earnings revisions.",
    whatToWatch: [
      "Hyperscaler capex guides (MSFT, GOOGL, AMZN, META)",
      "Grid interconnection queues and regional power pricing",
      "Liquid cooling and high-density rack adoption headlines",
    ],
    risks: [
      "Power bottlenecks delay revenue recognition",
      "Overbuild if AI training capex slows",
    ],
    relatedTickers: ["EQIX", "DLR", "VRT", "CEG", "NEE"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Quote REITs and utility names" },
      { label: "Pulse", href: "/pulse", why: "Infrastructure narrative tiers" },
      { label: "Wave", href: "/wave", why: "Energy/grid headlines hit DC timelines" },
    ],
    keywords: ["data center", "hyperscaler", "capex", "power", "cooling", "reit"],
    interestScore: 4,
    lastUpdated: "Live",
  }),

  "defense-technology": profile({
    title: "Defense technology",
    subtitle: "Autonomous systems, space, and software-defined warfare.",
    category: "Industrials",
    thesis:
      "Defense budgets are rising globally; software/autonomy vendors capture share from legacy primes.",
    mechanism:
      "Budget authorization → contract awards → backlog growth → margin mix shift toward software.",
    whatToWatch: [
      "DoD budget marks and supplemental funding bills",
      "Ukraine/Middle East headlines that accelerate procurement",
      "Prime vs. startup contract splits (OTA, DIU awards)",
    ],
    risks: [
      "Budget delays and continuing resolutions freeze awards",
      "Export control changes for dual-use tech",
    ],
    relatedTickers: ["LMT", "RTX", "PLTR", "LHX", "GD"],
    features: [
      { label: "Wave", href: "/wave", why: "Geopolitical headlines map to defense equities" },
      { label: "Signals", href: "/signals", why: "Policy and conflict wires" },
      { label: "Public Markets", href: "/public-markets", why: "A&D single-name quotes" },
    ],
    keywords: ["defense", "military", "pentagon", "aerospace", "autonomous", "drone", "nato"],
    interestScore: 4,
    lastUpdated: "Live",
  }),

  "japan-semiconductors": profile({
    title: "Japanese Semiconductor Subsidies",
    subtitle: "TSMC Kumamoto, Rapidus, and Japan's chip reshoring push.",
    category: "International Markets",
    thesis:
      "Japan is subsidizing fabs to reduce Asia concentration risk — equipment and materials names benefit.",
    mechanism:
      "Subsidy approval → fab construction → tool orders → yen-sensitive exporter earnings.",
    whatToWatch: [
      "METI subsidy announcements and fab milestone dates",
      "TSMC/Rapidus partnership updates",
      "Yen moves vs. exporter margins ( Tokyo Electron, Advantest )",
    ],
    risks: [
      "Fab delays or subsidy clawbacks",
      "China demand softness hits memory/logic mix",
    ],
    relatedTickers: ["TSM", "ASML", "AMAT", "LRCX", "SONY"],
    features: [
      { label: "Pulse", href: "/pulse", why: "Asia tech narrative tracking" },
      { label: "Public Markets", href: "/public-markets", why: "Semicap and ADR quotes" },
      { label: "Explore", href: "/explore", why: "Broader international themes" },
    ],
    keywords: ["japan", "semiconductor", "tsmc", "rapidus", "fab", "subsidy", "tokyo"],
    interestScore: 5,
    lastUpdated: "Live",
  }),

  "glp-1-weight-loss": profile({
    title: "GLP-1 Weight Loss Drugs",
    subtitle: "Ozempic/Wegovy ripple effects across pharma, retail, and med devices.",
    category: "Healthcare",
    thesis:
      "GLP-1 adoption reshapes food, beverage, bariatric surgery, and cardio outcomes — second-order trades matter.",
    mechanism:
      "Script growth → supply constraints → comp launches → downstream category demand shifts.",
    whatToWatch: [
      "LLY/NVO supply and pricing headlines",
      "FDA labels and oral GLP-1 trial readouts",
      "CPG/restaurant same-store trends tied to 'GLP-1 effect'",
    ],
    risks: [
      "Safety headlines or reimbursement cuts",
      "Competition from oral alternatives compresses pricing",
    ],
    relatedTickers: ["LLY", "NVO", "PFE", "WMT", "KO"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Pharma and consumer quotes" },
      { label: "Pulse", href: "/pulse", why: "Healthcare narrative heat" },
      { label: "Signals", href: "/signals", why: "FDA and earnings wires" },
    ],
    keywords: ["glp-1", "ozempic", "wegovy", "weight loss", "novo", "lilly", "obesity"],
    interestScore: 5,
    lastUpdated: "Live",
  }),

  semiconductors: profile({
    title: "Semiconductors",
    subtitle: "Chips, fabs, and the AI capex cycle.",
    category: "Technology",
    thesis: "Semis are the chokepoint for AI — memory, logic, and equipment move on capex and export policy.",
    mechanism: "Capex guide → order books → ASP trends → inventory corrections.",
    whatToWatch: ["NVDA/AMD data center revenue", "Memory pricing (HBM)", "Export controls on advanced nodes"],
    risks: ["Inventory glut after demand pull-forward", "China restriction headlines"],
    relatedTickers: ["NVDA", "AMD", "INTC", "ASML", "MU"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Semicap quotes" },
      { label: "Wave", href: "/wave", why: "Tariff/export headline mapping" },
      { label: "Pulse", href: "/pulse", why: "Tech narrative tiers" },
    ],
    keywords: ["semiconductor", "chip", "nvidia", "foundry", "hbm", "fab"],
  }),

  "defense-tech": profile({
    title: "Defense Tech",
    subtitle: "Same lens as defense technology — tuned to startup/prime mix.",
    category: "Industrials",
    thesis: "Software-first defense primes and venture-backed autonomy are taking share from legacy platforms.",
    mechanism: "Conflict intensity → urgent procurement → OTA pathways → revenue acceleration for disruptors.",
    whatToWatch: ["Anduril/Shield AI contract wins", "Supplemental defense bills", "Allied NATO spend targets"],
    risks: ["Single-award dependency", "Classification delays on exports"],
    relatedTickers: ["PLTR", "LMT", "RTX", "AVAV", "KTOS"],
    features: [
      { label: "Wave", href: "/wave", why: "Conflict → defense equity mapping" },
      { label: "Private Markets", href: "/private-markets", why: "Defense tech raises" },
      { label: "Signals", href: "/signals", why: "Geopolitics feed" },
    ],
    keywords: ["defense", "autonomous", "drone", "anduril", "pentagon", "military tech"],
  }),

  "m-a-activity": profile({
    title: "M&A Activity",
    subtitle: "Deals, takeovers, and strategic consolidation.",
    category: "M&A",
    thesis: "M&A is the fastest transmission path from headline to single-name repricing.",
    mechanism: "Rumor → premium → financing → regulatory → close probability.",
    whatToWatch: ["Antitrust rulings", "High-yield spreads", "Strategic vs. financial buyer mix"],
    risks: ["Deal breaks on regulatory blocks", "Financing markets shut"],
    relatedTickers: ["GS", "MS", "BLK", "SPY", "IWM"],
    features: [
      { label: "Pulse", href: "/pulse", why: "M&A narrative tier" },
      { label: "Signals", href: "/signals", why: "Deal headlines" },
      { label: "Private Markets", href: "/private-markets", why: "LBO and sponsor activity" },
    ],
    keywords: ["merger", "acquisition", "m&a", "takeover", "buyout", "deal"],
  }),

  "private-equity": profile({
    title: "Private Equity",
    subtitle: "Sponsor activity, exits, and secondaries.",
    category: "Private Markets",
    thesis: "PE returns depend on entry multiples, leverage, and exit windows — all macro-sensitive.",
    mechanism: "Fundraising → deployment → operational value → exit (IPO/strategic/secondary).",
    whatToWatch: ["IPO window reopenings", "Secondary transaction volume", "Default rates in sponsor portfolios"],
    risks: ["Denominator effect from public mark-downs", "Refi wall in 2026–2027"],
    relatedTickers: ["BX", "KKR", "APO", "CG", "ARES"],
    features: [
      { label: "Private Markets", href: "/private-markets", why: "Primary deal feed" },
      { label: "Public Markets", href: "/public-markets", why: "Listed alt manager quotes" },
      { label: "Wave", href: "/wave", why: "Rates/credit macro hits PE math" },
    ],
    keywords: ["private equity", "lbo", "sponsor", "buyout", "secondary", "carried interest"],
  }),

  "venture-capital": profile({
    title: "Venture Capital",
    subtitle: "Seed to growth rounds and venture-backed public comps.",
    category: "Venture & Raises",
    thesis: "VC sets the risk appetite dial for growth — funding velocity leads public tech sentiment.",
    mechanism: "Round size/step-ups → public comp re-rating → crossover fund behavior.",
    whatToWatch: ["Mega-round announcements", "Down rounds and flat extensions", "IPO pipeline from venture portfolios"],
    risks: ["LP allocation cuts", "Regulatory pressure on crypto/AI startups"],
    relatedTickers: ["QQQ", "ARKK", "COIN", "PLTR", "SNOW"],
    features: [
      { label: "Private Markets", href: "/private-markets", why: "Venture & raises feed" },
      { label: "Pulse", href: "/pulse", why: "Venture narrative category" },
      { label: "Signals", href: "/signals", why: "Funding headlines" },
    ],
    keywords: ["venture", "funding", "series", "seed", "startup", "raise", "valuation"],
  }),

  geopolitics: profile({
    title: "Geopolitics",
    subtitle: "Conflict, sanctions, and trade realignment.",
    category: "Geopolitics",
    thesis: "Geopolitical shocks reprice energy, defense, shipping, and safe havens before broad indices.",
    mechanism: "Headline → risk premium → sector rotation → supply chain rerouting costs.",
    whatToWatch: ["Sanctions packages", "Strait/hormuz shipping", "Alliance coordination (NATO, EU)"],
    risks: ["Headline fatigue — markets fade risk quickly", "Policy reversals"],
    relatedTickers: ["XLE", "GLD", "LMT", "DAL", "XOM"],
    features: [
      { label: "Wave", href: "/wave", why: "Headline-specific equity mapping" },
      { label: "Signals", href: "/signals", why: "Geopolitics category filter" },
      { label: "Pulse", href: "/pulse", why: "Macro/geopolitical narratives" },
    ],
    keywords: ["geopolit", "sanctions", "war", "conflict", "iran", "china", "taiwan", "nato"],
  }),

  pharmaceuticals: profile({
    title: "Pharmaceuticals",
    subtitle: "Drug pipelines, FDA, and payer dynamics.",
    category: "Healthcare",
    thesis: "Pharma moves on trial readouts, label expansions, and IRA pricing headlines.",
    mechanism: "Clinical data → approval probability → revenue forecasts → P/E re-rating.",
    whatToWatch: ["PDUFA dates", "Medicare negotiation lists", "Obesity/oncology trial headlines"],
    risks: ["Trial failures", "Patent cliffs"],
    relatedTickers: ["LLY", "JNJ", "PFE", "MRK", "ABBV"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Pharma quotes" },
      { label: "Signals", href: "/signals", why: "Healthcare wires" },
      { label: "Pulse", href: "/pulse", why: "Biotech/pharma narratives" },
    ],
    keywords: ["pharma", "fda", "drug", "clinical", "biotech", "medicare"],
  }),

  "energy-oil": profile({
    id: "energy-oil",
    title: "Energy & Oil",
    subtitle: "Crude, refining, and energy equities.",
    category: "Energy",
    thesis: "Energy equities are a leveraged play on geopolitical risk and OPEC discipline.",
    mechanism: "Spot price → crack spreads → E&P cash flows → buybacks/dividends.",
    whatToWatch: ["OPEC+ meeting outcomes", "US inventory prints", "Middle East supply disruptions"],
    risks: ["Demand destruction in recession", "SPR releases cap upside"],
    relatedTickers: ["XOM", "CVX", "COP", "SLB", "XLE"],
    features: [
      { label: "Wave", href: "/wave", why: "Oil/geopolitical headline mapping" },
      { label: "Public Markets", href: "/public-markets", why: "Energy major quotes" },
      { label: "Pulse", href: "/pulse", why: "Energy narrative tier" },
    ],
    keywords: ["oil", "opec", "crude", "brent", "wti", "energy", "refining"],
  }),

  "natural-gas-lng": profile({
    id: "natural-gas-lng",
    title: "Natural Gas & LNG",
    subtitle: "LNG exports, gas pricing, and utilities.",
    category: "Energy",
    thesis: "LNG is the bridge fuel for global power demand and European energy security.",
    mechanism: "Henry Hub/TTF spreads → liquefaction utilization → midstream contracts.",
    whatToWatch: ["LNG export capacity additions", "European storage levels", "Winter weather forecasts"],
    risks: ["Regulatory limits on new export terminals", "Warm winters crush gas demand"],
    relatedTickers: ["LNG", "KMI", "WMB", "EQT", "UNG"],
    features: [
      { label: "Wave", href: "/wave", why: "Energy supply shock headlines" },
      { label: "Public Markets", href: "/public-markets", why: "Midstream/LNG quotes" },
      { label: "Signals", href: "/signals", why: "Energy category" },
    ],
    keywords: ["lng", "natural gas", "henry hub", "pipeline", "liquefaction"],
  }),

  "gold-precious-metals": profile({
    id: "gold-precious-metals",
    title: "Gold & Precious Metals",
    subtitle: "Safe haven, real rates, and miners.",
    category: "Macro",
    thesis: "Gold trades inverse to real rates and geopolitical calm — miners amplify spot moves.",
    mechanism: "Real yields ↓ → gold ↑ → miner EBITDA ↑ (with lag).",
    whatToWatch: ["Real yield moves", "Central bank gold buying", "USD strength"],
    risks: ["Rising real rates", "Risk-on rallies drain safe-haven bids"],
    relatedTickers: ["GLD", "NEM", "GOLD", "AEM", "SLV"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Miner and ETF quotes" },
      { label: "Wave", href: "/wave", why: "Conflict → gold safe-haven mapping" },
      { label: "Pulse", href: "/pulse", why: "Macro narratives" },
    ],
    keywords: ["gold", "silver", "precious", "miner", "safe haven", "bullion"],
  }),

  "macro-economics": profile({
    id: "macro-economics",
    title: "Macro Economics",
    subtitle: "Rates, inflation, growth, and policy.",
    category: "Macro",
    thesis: "Macro is the top-down lens — everything else is a derivative of rates, growth, and liquidity.",
    mechanism: "Data surprise → Fed path → yield curve → factor rotation.",
    whatToWatch: ["CPI/PCE/jobs prints", "FOMC dots and Powell tone", "Fiscal headlines (debt ceiling)"],
    risks: ["Sticky inflation forces higher-for-longer", "Hard landing vs. soft landing misread"],
    relatedTickers: ["TLT", "SPY", "JPM", "GLD", "UUP"],
    features: [
      { label: "Wave", href: "/wave", why: "Fed/macro headline equity mapping" },
      { label: "Pulse", href: "/pulse", why: "Macro narrative category" },
      { label: "Signals", href: "/signals", why: "Macro filter on live feed" },
    ],
    keywords: ["fed", "cpi", "inflation", "rates", "gdp", "recession", "jobs", "fomc"],
  }),

  "japan-markets": profile({
    id: "japan-markets",
    title: "Japan Markets",
    subtitle: "Nikkei, yen, and corporate governance reform.",
    category: "International Markets",
    thesis: "Japan offers yield + reform — weak yen helps exporters; governance pushes buybacks.",
    mechanism: "BOJ policy → yen → exporter earnings → foreign inflows to Nikkei.",
    whatToWatch: ["BOJ yield curve control tweaks", "Corporate buyback announcements", "TSMC Japan fab progress"],
    risks: ["Yen spike hurts exporters", "Global risk-off hits carry trades"],
    relatedTickers: ["EWJ", "SONY", "TM", "MUFG", "SMFG"],
    features: [
      { label: "Explore", href: "/explore", why: "International themes" },
      { label: "Pulse", href: "/pulse", why: "Regional narrative lens" },
      { label: "Public Markets", href: "/public-markets", why: "ADR and ETF quotes" },
    ],
    keywords: ["japan", "nikkei", "boj", "yen", "tokyo", "tse"],
  }),

  "india-markets": profile({
    id: "india-markets",
    title: "India Markets",
    subtitle: "Growth, reforms, and the Sensex/Nifty cycle.",
    category: "International Markets",
    thesis: "India is a structural growth story — consumption, fintech, and manufacturing reshoring.",
    mechanism: "Reform headline → FII flows → rupee → sector leadership (IT vs. domestic).",
    whatToWatch: ["RBI rate decisions", "Election/policy reforms", "Startup IPO pipeline"],
    risks: ["Rupee weakness on oil imports", "Regulatory shifts in fintech"],
    relatedTickers: ["INDA", "INFY", "WIT", "HDB", "IBN"],
    features: [
      { label: "Pulse", href: "/pulse", why: "India-tagged news via your market lens" },
      { label: "Signals", href: "/signals", why: "Emerging market headlines" },
      { label: "Explore", href: "/explore", why: "International themes" },
    ],
    keywords: ["india", "nifty", "sensex", "mumbai", "rupee", "modi"],
  }),

  "china-markets": profile({
    id: "china-markets",
    title: "China Markets",
    subtitle: "Policy, property, and tech regulation.",
    category: "International Markets",
    thesis: "China equities hinge on stimulus, property stabilization, and tech regulation clarity.",
    mechanism: "Policy stimulus → credit impulse → property sales → consumer confidence.",
    whatToWatch: ["PBOC/MLF moves", "Property developer restructuring", "Tech/antitrust headlines"],
    risks: ["Geopolitical escalation", "Deflationary spiral in property"],
    relatedTickers: ["FXI", "BABA", "PDD", "BIDU", "KWEB"],
    features: [
      { label: "Wave", href: "/wave", why: "Trade/tariff headline mapping" },
      { label: "Pulse", href: "/pulse", why: "China-tagged narratives" },
      { label: "Public Markets", href: "/public-markets", why: "ADR quotes" },
    ],
    keywords: ["china", "beijing", "pboc", "property", "stimulus", "yuan"],
  }),

  "european-markets": profile({
    id: "european-markets",
    title: "European Markets",
    subtitle: "ECB, defense spend, and energy transition.",
    category: "International Markets",
    thesis: "Europe is repricing around defense, energy security, and rate cuts vs. the US.",
    mechanism: "ECB path → EUR → export competitiveness → sector rotation.",
    whatToWatch: ["ECB meeting tone", "German fiscal expansion", "Ukraine aid packages"],
    risks: ["Energy price spikes", "Political fragmentation in EU"],
    relatedTickers: ["VGK", "SAP", "ASML", "NVO", "SHEL"],
    features: [
      { label: "Explore", href: "/explore", why: "European theme cards" },
      { label: "Wave", href: "/wave", why: "Geopolitical Europe mapping" },
      { label: "Pulse", href: "/pulse", why: "Macro/Europe narratives" },
    ],
    keywords: ["europe", "ecb", "euro", "germany", "france", "stoxx"],
  }),

  "middle-east-markets": profile({
    id: "middle-east-markets",
    title: "Middle East Markets",
    subtitle: "Sovereign wealth, energy, and Gulf diversification.",
    category: "International Markets",
    thesis: "Gulf states are deploying oil wealth into tech, sports, and global assets.",
    mechanism: "Oil revenue → SWF deployment → venture/LBO activity → regional equity indices.",
    whatToWatch: ["PIF/Mubadala deal flow", "OPEC policy", "Red Sea shipping risk"],
    risks: ["Oil price collapse", "Regional conflict escalation"],
    relatedTickers: ["XOM", "CVX", "GLD", "BABA", "UBER"],
    features: [
      { label: "Private Markets", href: "/private-markets", why: "SWF and mega-deal activity" },
      { label: "Wave", href: "/wave", why: "Middle East conflict/oil headlines" },
      { label: "Signals", href: "/signals", why: "Energy/geopolitics wires" },
    ],
    keywords: ["saudi", "uae", "pif", "mubadala", "gulf", "opec", "middle east"],
  }),

  "oceanic-tech": profile({
    id: "oceanic-tech",
    title: "Oceanic Tech",
    subtitle: "Subsea cables, maritime autonomy, and blue economy.",
    category: "Technology",
    thesis: "Ocean infrastructure underpins data and defense — cables, ports, and autonomous vessels.",
    mechanism: "Capex on subsea routes → defense maritime budgets → insurance/risk pricing.",
    whatToWatch: ["Subsea cable cuts/repairs", "Naval drone procurement", "Offshore wind lease awards"],
    risks: ["Geopolitical cable sabotage", "Long project timelines"],
    relatedTickers: ["PLTR", "LMT", "NEE", "TTE", "CAT"],
    features: [
      { label: "Wave", href: "/wave", why: "Maritime/geopolitical headlines" },
      { label: "Explore", href: "/explore", why: "Thematic deep dives" },
      { label: "Signals", href: "/signals", why: "Infrastructure wires" },
    ],
    keywords: ["subsea", "maritime", "ocean", "cable", "naval", "offshore"],
  }),

  "middle-east-sovereign-wealth": profile({
    id: "middle-east-sovereign-wealth",
    title: "Middle Eastern Sovereign Wealth in Tech",
    subtitle: "Mubadala and PIF aggressively moving into AI infrastructure.",
    category: "Private Markets",
    thesis:
      "Gulf SWFs deploy oil surpluses into AI, sports, and global tech — their deal flow sets private market pricing power.",
    mechanism:
      "Oil revenue → SWF mandate → direct/co-invest → venture/LBO activity → public comp re-rating.",
    whatToWatch: [
      "PIF/Mubadala mega-deal announcements in AI and sports",
      "US/EU scrutiny of Gulf tech investments",
      "OPEC policy and Brent — drives deployment pace",
    ],
    risks: ["Oil price collapse pauses deployment", "Geopolitical limits on target sectors"],
    relatedTickers: ["XOM", "CVX", "BABA", "UBER", "MSFT"],
    features: [
      { label: "Private Markets", href: "/private-markets", why: "SWF and mega-deal tracking" },
      { label: "Pulse", href: "/pulse", why: "Sovereign wealth narratives" },
      { label: "Wave", href: "/wave", why: "Middle East geopolitical headlines" },
    ],
    keywords: ["sovereign", "pif", "mubadala", "saudi", "uae", "wealth fund", "gulf"],
    interestScore: 4,
    lastUpdated: "Live",
  }),

  "european-defense-procurement": profile({
    id: "european-defense-procurement",
    title: "European Defense Procurement",
    subtitle: "NATO budget increases driving European aerospace consolidation.",
    category: "Geopolitics",
    thesis:
      "Europe is re-arming — defense budgets rising, primes consolidating, and startups winning OTA contracts.",
    mechanism:
      "NATO spend targets → national budgets → contract awards → backlog growth for EU A&D.",
    whatToWatch: [
      "EU/NATO supplemental defense bills",
      "Rheinmetall, BAE, Thales contract wins",
      "Ukraine aid packages accelerating procurement",
    ],
    risks: ["Budget delays from political gridlock", "Export control friction"],
    relatedTickers: ["RHM.DE", "BA", "LMT", "RTX", "NOC"],
    features: [
      { label: "Wave", href: "/wave", why: "Conflict → defense equity mapping" },
      { label: "Signals", href: "/signals", why: "Geopolitics feed" },
      { label: "Public Markets", href: "/public-markets", why: "A&D quotes" },
    ],
    keywords: ["nato", "europe", "defense", "procurement", "rheinmetall", "ukraine"],
    interestScore: 3,
    lastUpdated: "Live",
  }),

  "nearshoring-mexico": profile({
    id: "nearshoring-mexico",
    title: "Nearshoring to Mexico",
    subtitle: "Supply chains shifting away from China to North America.",
    category: "Industrials",
    thesis:
      "US-China decoupling pushes manufacturing to Mexico — industrial real estate, logistics, and autos benefit.",
    mechanism:
      "Tariff/policy headline → capex relocation → border industrial parks → freight volumes.",
    whatToWatch: [
      "USMCA and tariff announcements",
      "Mexico manufacturing PMI and FDI data",
      "Auto OEM plant announcements in Monterrey/Bajío",
    ],
    risks: ["Border infrastructure bottlenecks", "Policy reversal on trade"],
    relatedTickers: ["FDX", "UPS", "TM", "GM", "EWW"],
    features: [
      { label: "Wave", href: "/wave", why: "Tariff/trade headline mapping" },
      { label: "Pulse", href: "/pulse", why: "Supply chain narratives" },
      { label: "Public Markets", href: "/public-markets", why: "Logistics and auto quotes" },
    ],
    keywords: ["nearshoring", "mexico", "supply chain", "usmca", "tariff", "manufacturing"],
    interestScore: 2,
    lastUpdated: "Live",
  }),

  "supply-chain-shift": profile({
    id: "supply-chain-shift",
    title: "Supply Chain Shift",
    subtitle: "Nearshoring, friend-shoring, and logistics rerouting.",
    category: "Industrials",
    thesis: "Companies are diversifying away from single-country exposure — Mexico, India, Vietnam benefit.",
    mechanism: "Tariff headline → capex relocation → industrial real estate → logistics volumes.",
    whatToWatch: ["US-China tariff announcements", "Mexico manufacturing PMI", "Freight rate indices"],
    risks: ["Policy reversal", "Infrastructure bottlenecks at borders"],
    relatedTickers: ["FDX", "UPS", "UNP", "CAT", "DE"],
    features: [
      { label: "Wave", href: "/wave", why: "Tariff/trade headline mapping" },
      { label: "Pulse", href: "/pulse", why: "Trade narrative tracking" },
      { label: "Public Markets", href: "/public-markets", why: "Logistics/industrial quotes" },
    ],
    keywords: ["supply chain", "nearshoring", "reshoring", "tariff", "logistics", "mexico", "vietnam"],
  }),

  "crypto-digital-assets": profile({
    id: "crypto-digital-assets",
    title: "Crypto & Digital Assets",
    subtitle: "Bitcoin, ETH, regulation, and institutional adoption.",
    category: "Crypto",
    thesis: "Crypto trades as a high-beta risk asset with its own regulatory cycle.",
    mechanism: "ETF flows → halving supply → regulatory clarity → correlation with NASDAQ.",
    whatToWatch: ["Spot ETF inflows", "SEC enforcement headlines", "Stablecoin legislation"],
    risks: ["Regulatory crackdowns", "Exchange/custody failures"],
    relatedTickers: ["COIN", "MSTR", "MARA", "IBIT", "ETHA"],
    features: [
      { label: "Public Markets", href: "/public-markets", why: "Crypto-adjacent equity quotes" },
      { label: "Signals", href: "/signals", why: "Crypto/social signals" },
      { label: "Pulse", href: "/pulse", why: "Digital asset narratives" },
    ],
    keywords: ["bitcoin", "crypto", "ethereum", "blockchain", "etf", "sec"],
  }),

  "sovereign-wealth-funds": profile({
    id: "sovereign-wealth-funds",
    title: "Sovereign Wealth Funds",
    subtitle: "PIF, Mubadala, Norges, and global deployment.",
    category: "Private Markets",
    thesis: "SWFs are price-insensitive capital — their mandates move sports, tech, and infra globally.",
    mechanism: "Oil surplus → SWF AUM → direct/co-invest → public market secondary effects.",
    whatToWatch: ["Mega-deal announcements", "GP relationship shifts", "Domestic diversification quotas"],
    risks: ["Oil revenue drawdowns pause deployment", "Geopolitical limits on target sectors"],
    relatedTickers: ["BABA", "UBER", "LMT", "XOM", "SPY"],
    features: [
      { label: "Private Markets", href: "/private-markets", why: "SWF deal tracking" },
      { label: "Pulse", href: "/pulse", why: "Mega-deal narratives" },
      { label: "Explore", href: "/explore", why: "Middle East tech theme" },
    ],
    keywords: ["sovereign", "pif", "mubadala", "swf", "wealth fund", "norges"],
  }),
};

function genericProfile(title: string, mock?: Theme): SavedThemeProfile {
  const cat = mock?.category ?? "Custom Topic";
  return profile({
    title: mock?.title ?? title,
    subtitle: mock?.subtitle ?? "Live intelligence curated from your Oasis feed and interests.",
    category: cat,
    thesis: `${title} is on your watchlist — Oasis filters live headlines and market narratives to this lens.`,
    mechanism:
      "Headlines in this topic transmit via narrative velocity first, then fundamentals if the story persists across sources.",
    whatToWatch: [
      `Whether '${title}' appears across multiple independent sources within 12 hours`,
      "If the narrative shifts from headline to numbers (earnings, policy, deal terms)",
      "Cross-asset confirmation before sizing single-name trades",
    ],
    risks: [
      "Keyword matching without fundamental size",
      "Crowded thematic trades reversing on incremental news",
    ],
    relatedTickers: ["SPY", "QQQ"],
    features: [
      { label: "Pulse", href: "/pulse", why: "Narrative heat for your interests" },
      { label: "Signals", href: "/signals", why: "Filtered live headlines" },
      { label: "Wave", href: "/wave", why: "Macro headline → equity mapping" },
    ],
    keywords: title
      .toLowerCase()
      .split(/[\s&/-]+/)
      .filter((w) => w.length > 2),
    lastUpdated: mock?.lastUpdated ?? "Live",
    interestScore: mock?.interestScore ?? 3,
  });
}

export function resolveSavedProfile(key: string, mock?: Theme): SavedThemeProfile {
  const slug = slugify(key);
  const direct = PROFILES[slug] ?? PROFILES[key.toLowerCase()];
  if (direct) return { ...direct, interestScore: mock?.interestScore ?? direct.interestScore };

  for (const p of Object.values(PROFILES)) {
    if (p.title.toLowerCase() === key.toLowerCase()) return p;
  }

  return genericProfile(key, mock);
}

export function buildSavedLibrary(interests: string[], mockThemes: Theme[]): SavedThemeProfile[] {
  const map = new Map<string, SavedThemeProfile>();

  for (const interest of interests) {
    const p = resolveSavedProfile(interest);
    map.set(p.id, { ...p, interestScore: Math.max(p.interestScore ?? 3, 4) });
  }

  for (const theme of mockThemes.filter((t) => t.isSaved)) {
    if (!map.has(theme.id)) {
      map.set(theme.id, resolveSavedProfile(theme.id, theme));
    }
  }

  if (map.size === 0) {
    for (const theme of mockThemes.filter((t) => t.isSaved)) {
      map.set(theme.id, resolveSavedProfile(theme.id, theme));
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => (b.interestScore ?? 0) - (a.interestScore ?? 0)
  );
}

export function filterSignalsForProfile<T extends { title: string; summary?: string; category?: string }>(
  signals: T[],
  p: SavedThemeProfile
): T[] {
  const keys = p.keywords.map((k) => k.toLowerCase());
  const filtered = signals.filter((s) => {
    const text = `${s.title} ${s.summary ?? ""} ${s.category ?? ""}`.toLowerCase();
    return keys.some((k) => text.includes(k));
  });
  return filtered.length > 0 ? filtered.slice(0, 10) : signals.slice(0, 6);
}
