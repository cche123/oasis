"use client";

import { mockThemes } from "@/lib/data";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function SavedThemesPage() {
  const savedThemes = mockThemes.filter(t => t.isSaved).sort((a, b) => b.interestScore - a.interestScore);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4 text-justify">Saved Intelligence</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">Managing your personalized knowledge hub and active interest sectors.</p>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
              placeholder="Search library..."
            />
          </div>
        </div>
      </motion.header>

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid gap-12"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-foreground pb-2 mb-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Active Themes</h2>
            <button className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3" /> Filter by Intensity
            </button>
          </div>

          <div className="grid gap-px bg-border border border-border">
            {savedThemes.map((theme, idx) => (
              <motion.div 
                key={theme.id} 
                variants={itemVars}
                className="bg-background p-8 group hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex gap-8 items-start">
                    <span className="text-xs font-mono text-muted-foreground/40 pt-1">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest border border-border px-2 py-0.5">
                          {theme.category}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          Updated {theme.lastUpdated}
                        </span>
                      </div>
                      <Link href={`/theme/${theme.id}`}>
                        <h3 className="text-2xl font-serif text-foreground group-hover:underline decoration-1 underline-offset-4">
                          {theme.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground font-light max-w-xl">
                        {theme.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-left md:text-right space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Interest Intensity</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div 
                            key={star} 
                            className={`h-1 w-6 ${star <= theme.interestScore ? 'bg-foreground' : 'bg-border'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <Link href={`/theme/${theme.id}`} className="p-3 border border-border hover:border-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
