"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { User, Bell, Shield, Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Profile */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Profile</h2>
          </div>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              U
            </div>
            <div>
              <button className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mb-2">
                Upload Photo
              </button>
              <p className="text-xs text-muted-foreground">JPG or PNG, max 1MB.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input type="text" defaultValue="User" className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input type="email" defaultValue="user@example.com" className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {mounted && (
              <>
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-all ${theme === 'light' ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'}`}
                >
                  <Sun className="w-6 h-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Light</span>
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-all ${theme === 'dark' ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'}`}
                >
                  <Moon className="w-6 h-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Dark</span>
                </button>
                <button 
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-all ${theme === 'system' ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'}`}
                >
                  <Monitor className="w-6 h-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">System</span>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">Weekly Briefing</p>
                <p className="text-xs text-muted-foreground">A summary of activity across your saved themes.</p>
              </div>
              <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-background rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">Real-time Signals</p>
                <p className="text-xs text-muted-foreground">Get notified instantly for major M&A announcements.</p>
              </div>
              <div className="w-10 h-5 bg-muted rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-background rounded-full absolute left-0.5 top-0.5" />
              </div>
            </div>
          </div>
        </section>
        
        <p className="text-xs text-muted-foreground text-center">
          Oasis is for educational and informational purposes only. It does not provide investment advice or execute trades.
        </p>
      </div>
    </div>
  );
}
