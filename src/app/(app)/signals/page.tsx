"use client";

import { mockSignals } from "@/lib/data";
import { Activity, Filter, ExternalLink } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SignalsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4 flex items-center gap-3">
          Signal Feed <Activity className="w-5 h-5 text-muted-foreground" />
        </h1>
        <p className="text-muted-foreground max-w-xl font-light mb-6">Real-time intelligence from WSJ, Bloomberg, Financial Times, and X.</p>
        
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-foreground text-background text-xs uppercase tracking-widest font-medium border border-foreground transition-colors">
            All Signals
          </button>
          <button className="px-4 py-2 bg-transparent text-foreground text-xs uppercase tracking-widest font-medium border border-border hover:border-foreground transition-colors">
            M&A
          </button>
          <button className="px-4 py-2 bg-transparent text-foreground text-xs uppercase tracking-widest font-medium border border-border hover:border-foreground transition-colors">
            Macro
          </button>
          <button className="px-4 py-2 bg-transparent text-foreground text-xs uppercase tracking-widest font-medium border border-border hover:border-foreground transition-colors">
            Social
          </button>
          <button className="ml-auto px-4 py-2 bg-transparent text-foreground text-xs uppercase tracking-widest font-medium border border-border hover:border-foreground transition-colors flex items-center gap-2">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-4">
        {mockSignals.map(signal => (
          <motion.div key={signal.id} variants={itemVars}>
            <a
              href={signal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card border border-border p-6 hover:border-foreground transition-all duration-500 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-background bg-foreground px-2 py-0.5">
                    {signal.category}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{signal.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif italic text-muted-foreground">{signal.source}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <h3 className="text-xl font-serif text-foreground mb-2 leading-snug group-hover:underline decoration-1 underline-offset-4">{signal.title}</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">{signal.summary}</p>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
