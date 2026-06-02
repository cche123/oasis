"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Target } from "lucide-react";

const NOTES_KEY = "oasis-notes";
const GOALS_KEY = "oasis-goals";

export default function NotesPage() {
  const [notes, setNotes] = useState("");
  const [goals, setGoals] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      setNotes(localStorage.getItem(NOTES_KEY) || "");
      setGoals(localStorage.getItem(GOALS_KEY) || "");
    } catch {
      /* ignore */
    }
  }, []);

  const wordCount = useMemo(() => {
    const text = `${notes} ${goals}`.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [notes, goals]);

  const saveAll = () => {
    try {
      localStorage.setItem(NOTES_KEY, notes);
      localStorage.setItem(GOALS_KEY, goals);
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full font-sans pb-24">
      <header className="mb-10 border-b border-border pb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Workspace
        </p>
        <h1 className="text-4xl font-serif font-light tracking-tight">Notes & Goals</h1>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl font-light leading-relaxed">
          Keep your market notes, thesis updates, and weekly goals in one place while you
          navigate Oasis.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="border border-border bg-card p-5 rounded-2xl space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5" /> Market Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write quick notes from signals, wave scans, earnings calls, etc."
            className="w-full min-h-[280px] bg-background border border-border p-3 text-sm focus:outline-none focus:border-foreground resize-y"
          />
        </section>

        <section className="border border-border bg-card p-5 rounded-2xl space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Investing Goals
          </p>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Set watchlist goals, risk limits, and learning objectives."
            className="w-full min-h-[280px] bg-background border border-border p-3 text-sm focus:outline-none focus:border-foreground resize-y"
          />
        </section>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {wordCount} words{savedAt ? ` · Saved at ${savedAt}` : ""}
        </p>
        <button
          type="button"
          onClick={saveAll}
          className="px-4 py-2 border border-border text-xs uppercase tracking-widest font-bold hover:border-foreground transition-colors"
        >
          Save Notes
        </button>
      </div>
    </div>
  );
}
