import { mockThemes } from "@/lib/data";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";

export default function SavedThemesPage() {
  const savedThemes = mockThemes.filter(t => t.isSaved).sort((a, b) => b.interestScore - a.interestScore);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Saved Themes</h1>
        <p className="text-muted-foreground">Manage your personalized knowledge hub.</p>
        
        <div className="mt-6 flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-shadow shadow-sm"
              placeholder="Search saved themes..."
            />
          </div>
          <button className="px-4 py-3 bg-card border border-border rounded-xl flex items-center gap-2 hover:bg-muted/50 transition-colors text-sm font-medium text-foreground shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Sort
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {savedThemes.map((theme, idx) => (
          <div key={theme.id} className="flex items-center bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold text-xl text-muted-foreground mr-4">
              #{idx + 1}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {theme.category}
                </span>
              </div>
              <Link href={`/theme/${theme.id}`}>
                <h3 className="text-lg font-bold text-foreground hover:text-accent transition-colors truncate">
                  {theme.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">{theme.subtitle}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground mb-1">Interest Score</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= theme.interestScore ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
              </div>
              <button className="text-xs font-medium text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-lg transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
