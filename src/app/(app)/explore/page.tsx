"use client";

import { useMemo, useState } from "react";
import { categories, mockThemes } from "@/lib/data";
import { Search, Filter } from "lucide-react";
import Link from "next/link";
import { XVoices } from "@/components/x-voices";
import { InternationalMarketPicker } from "@/components/international-market-picker";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredThemes = useMemo(() => {
    let list = mockThemes;
    if (activeCategory !== "All") {
      list = list.filter((t) => t.category === activeCategory);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">
          Explore Markets
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">
            Structured themes, international lenses, and curated voices — every control
            filters what you see below.
          </p>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
                placeholder="Search themes..."
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "px-4 py-2 border flex items-center gap-2 transition-colors text-xs uppercase tracking-widest font-medium shrink-0",
                showFilters
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground"
              )}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </motion.header>

      <div className="grid lg:grid-cols-12 gap-10 mb-12">
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={cn(
                "px-4 py-2 border text-xs uppercase tracking-widest font-medium transition-colors",
                activeCategory === "All"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:border-foreground bg-transparent"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 border text-xs uppercase tracking-widest font-medium transition-colors",
                  activeCategory === category
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground bg-transparent"
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
          <p className="text-xs text-muted-foreground mt-3">
            Showing {filteredThemes.length} theme{filteredThemes.length === 1 ? "" : "s"}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
          </p>
        </div>
        <div className="lg:col-span-4 border border-border p-5 rounded-2xl bg-card/40">
          <InternationalMarketPicker />
        </div>
      </div>

      {filteredThemes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No themes match — try another category or search term.
        </p>
      ) : (
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredThemes.map((theme) => (
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
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-transparent hover:border-muted-foreground"
                    >
                      #{tag.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-20">
        <XVoices title="X Voices by Topic" showTopicTabs defaultTopic="vc" />
      </div>
    </div>
  );
}
