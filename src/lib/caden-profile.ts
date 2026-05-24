/** Copy for the Caden Che scroll intro */

export const CADEN_LINKS = {
  website: "https://cadenche.com",
  linkedin: "https://www.linkedin.com/in/cadenche",
  x: "https://x.com/cadenhche",
} as const;

export const INTRO_SECTIONS = [
  {
    id: "creator",
    kicker: "Creator",
    title: "Caden Che",
    body: [
      "I built Oasis because I wanted a cleaner way to follow markets. Live news, regional context, and an AI that actually adapts to how you think.",
      "It is the product I kept wishing I had while moving between venture, private equity, and public markets.",
    ],
    link: { label: "cadenche.com", href: CADEN_LINKS.website },
  },
  {
    id: "investing",
    kicker: "Investing",
    title: "My Investing Background",
    body: [
      "This past year I have spent most of my time on AI-enabled roll-ups: where software transforms fragmented service businesses.",
      "At ZBS Partners, a roll-up platform partnering with Thrive Holdings, I worked on Shield, an AI-enabled IT services roll-up.",
      "This summer I am joining D1 Capital Partners in NYC on the privates team.",
    ],
  },
  {
    id: "music",
    kicker: "A Core Belief",
    title: "Everything Needs Music",
    body: [
      "I've always been a firm believer in the power of music. When you step into Oasis, a playlist of my favorites starts playing — beginning with Innerbloom by RÜFÜS DU SOL.",
      "Use the player in the corner to pause, skip, or see what is on.",
    ],
  },
] as const;
