import { mockThemes, mockSignals, mockDeals } from "@/lib/data";
import { Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as motion from "framer-motion/client";
import { Variants } from "framer-motion";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ThemeDetailPage({ params }: { params: { id: string } }) {
  const theme = mockThemes.find((t) => t.id === params.id);

  if (!theme) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <Link href="/explore" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
      </Link>

      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 flex flex-col md:flex-row items-start justify-between gap-6 border-b border-border pb-10"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              {theme.category}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Updated {theme.lastUpdated}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-foreground mb-4 leading-tight tracking-tight">{theme.title}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-serif italic max-w-2xl leading-relaxed">{theme.subtitle}</p>
        </div>
        <button className={`flex items-center gap-2 px-6 py-3 border transition-colors shrink-0 text-xs uppercase tracking-widest font-medium ${theme.isSaved ? 'bg-background border-foreground text-foreground' : 'bg-foreground border-foreground text-background hover:bg-transparent hover:text-foreground'}`}>
          {theme.isSaved ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save Theme</>}
        </button>
      </motion.header>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Overview */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Overview</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="font-serif text-xl leading-[1.8] text-foreground font-light text-justify">
                {theme.id === 'ai-enabled-roll-ups' ? 
                  "AI-enabled roll-ups combine traditional acquisition strategies with software and automation. The thesis is that fragmented service industries can be acquired, integrated, and improved through better systems, centralized operations, and AI-driven workflow automation. The implications for private equity are profound, shifting the focus from financial engineering to true operational alpha."
                : "This theme is currently being mapped by Oasis. Analysts are actively curating SEC filings, earnings calls, and news signals. Check back soon for a comprehensive intelligence brief."}
              </p>
            </div>
          </motion.section>

          {/* Why this matters */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="bg-muted/30 p-8 border-l-4 border-foreground">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
              <TrendingUp className="w-4 h-4" /> Why this matters
            </h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="font-serif italic text-muted-foreground text-xl leading-none mt-1">I.</span>
                <p className="font-serif text-lg leading-relaxed text-foreground">Fragmented service markets offer massive consolidation opportunities with relatively low entry multiples, shielding capital from public market volatility.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-serif italic text-muted-foreground text-xl leading-none mt-1">II.</span>
                <p className="font-serif text-lg leading-relaxed text-foreground">Labor shortages and sustained wage inflation are forcing industries to adopt workflow automation, acting as a tailwind for tech-enabled platforms.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-serif italic text-muted-foreground text-xl leading-none mt-1">III.</span>
                <p className="font-serif text-lg leading-relaxed text-foreground">Private equity firms are increasingly looking for operational alpha rather than just financial engineering in a higher interest rate environment.</p>
              </li>
            </ul>
          </motion.section>

          {/* Market Map */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Market Map</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground uppercase tracking-widest text-xs border-b border-border pb-2">Public Companies</h3>
                <div className="space-y-1">
                  {['Constellation Software', 'Roper Technologies', 'Tyler Technologies', 'Thomson Reuters', 'ServiceNow', 'HubSpot'].map(company => (
                    <div key={company} className="flex items-center justify-between group cursor-pointer py-2 border-b border-border/50 hover:border-foreground transition-colors">
                      <span className="font-serif text-foreground">{company}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground uppercase tracking-widest text-xs border-b border-border pb-2">Private Companies</h3>
                <div className="space-y-1">
                  {['Beacon Software', 'Thrive Holdings', 'Sequence Holdings', 'Vertical software startups', 'MSP platforms'].map(company => (
                    <div key={company} className="flex items-center justify-between group cursor-pointer py-2 border-b border-border/50 hover:border-foreground transition-colors">
                      <span className="font-serif text-foreground">{company}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Risks */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Major Risks
            </h2>
            <ul className="space-y-4">
              {['Integration complexity across acquired businesses.', 'Overpaying for small businesses due to high competition.', 'Customer churn after acquisition and restructuring.', 'AI implementation failing to produce real ROI.', 'Founder dependency in small service firms.'].map(risk => (
                <li key={risk} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-foreground mt-2.5 shrink-0" />
                  <p className="font-serif text-lg text-foreground">{risk}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          {/* Recent Signals */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-6 border-b border-foreground pb-2">Recent Signals</h3>
            <div className="space-y-6">
              {mockSignals.map(signal => (
                <a key={signal.id} href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-background bg-foreground px-2 py-0.5">{signal.category}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{signal.date}</span>
                  </div>
                  <h4 className="font-serif text-lg text-foreground mb-2 leading-snug group-hover:underline decoration-1 underline-offset-4">{signal.title}</h4>
                  <p className="text-sm text-muted-foreground font-serif italic mb-2">via {signal.source}</p>
                </a>
              ))}
            </div>
          </motion.section>

          {/* Deal Activity */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-6 border-b border-foreground pb-2">M&A & Funding</h3>
            <div className="divide-y divide-border">
              {mockDeals.map(deal => (
                <div key={deal.id} className="py-4 first:pt-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-foreground">{deal.company}</h4>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">{deal.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{deal.type} by <span className="text-foreground">{deal.buyer}</span></p>
                  <p className="text-sm font-serif italic text-muted-foreground">Rationale: {deal.rationale}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
