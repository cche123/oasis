"use client";

import { mockThemes, mockSignals } from "@/lib/data";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function DashboardPage() {
  const savedThemes = mockThemes.filter((t) => t.isSaved);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">My Oasis</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">Your curated intelligence hub. Tracking the signals, shifts, and themes that matter.</p>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
              placeholder="Search intelligence..."
            />
          </div>
        </div>
      </motion.header>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          {/* Saved Themes */}
          <motion.section variants={containerVars} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-8 border-b border-foreground pb-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Saved Themes</h2>
              <Link href="/saved" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center">
                View all <ArrowRight className="w-3 h-3 ml-2" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {savedThemes.map((theme) => (
                <motion.div key={theme.id} variants={itemVars}>
                  <Link
                    href={`/theme/${theme.id}`}
                    className="block group bg-card border border-border p-6 hover:border-foreground transition-all duration-500"
                  >
                    <div className="flex gap-2 mb-4">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-widest border border-border px-2 py-0.5">
                        {theme.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif text-foreground group-hover:underline decoration-1 underline-offset-4 mb-2">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2">
                      {theme.subtitle}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="lg:col-span-4 space-y-16">
          {/* Recent Signals Feed */}
          <motion.section variants={containerVars} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-8 border-b border-foreground pb-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Live Signals</h2>
            </div>
            <div className="space-y-6">
              {mockSignals.slice(0, 4).map((signal) => (
                <motion.div key={signal.id} variants={itemVars}>
                  <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold text-background bg-foreground px-2 py-0.5 uppercase tracking-widest">{signal.category}</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{signal.date}</span>
                    </div>
                    <h4 className="font-serif text-lg text-foreground mb-1 group-hover:text-muted-foreground transition-colors leading-snug">
                      {signal.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-serif italic">via {signal.source}</p>
                  </a>
                </motion.div>
              ))}
              <motion.div variants={itemVars}>
                <Link href="/signals" className="block text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground pt-4 border-t border-border mt-4 transition-colors">
                  View full feed
                </Link>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
