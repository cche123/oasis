"use client";

import { categories, mockThemes } from "@/lib/data";
import { Search, Filter } from "lucide-react";
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
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ExplorePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">Explore Markets</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">Discover emerging themes, structural shifts, and specialized industries.</p>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
                placeholder="Search themes..."
              />
            </div>
            <button className="px-4 py-2 border border-border flex items-center gap-2 hover:border-foreground transition-colors text-xs uppercase tracking-widest font-medium text-foreground shrink-0">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </motion.header>

      {/* Categories */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-12 flex flex-wrap gap-2"
      >
        <button className="px-4 py-2 border border-foreground bg-foreground text-background text-xs uppercase tracking-widest font-medium transition-colors">
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 border border-border text-foreground hover:border-foreground text-xs uppercase tracking-widest font-medium transition-colors bg-transparent"
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Theme Grid */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {mockThemes.map((theme) => (
          <motion.div key={theme.id} variants={itemVars}>
            <Link
              href={`/theme/${theme.id}`}
              className="flex flex-col bg-card border border-border p-6 hover:border-foreground transition-all duration-500 h-full group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-2 py-0.5 border border-border text-[9px] font-bold text-foreground uppercase tracking-widest">
                  {theme.category}
                </span>
                {!theme.isSaved && (
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                    Save +
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif text-foreground group-hover:underline decoration-1 underline-offset-4 mb-3 leading-snug">
                {theme.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light mb-8 flex-1 leading-relaxed">
                {theme.subtitle}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {theme.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-transparent hover:border-muted-foreground">
                    #{tag.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
