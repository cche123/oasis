"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  User,
  Sun,
  Moon,
  Monitor,
  Shield,
  LogOut,
  Key,
  AtSign,
  MapPin,
  Save,
  Check,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/components/user-context";
import { resolveLocation } from "@/lib/locations";
import { resolveXHandleAlias } from "@/lib/x-handle-aliases";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setUser, logout } = useUser();
  const [mounted, setMounted] = useState(false);

  // Editable fields
  const [name, setName] = useState(user.name || "");
  const [location, setLocation] = useState(user.location || "");
  const [xUsername, setXUsername] = useState("");

  // Save states
  const [profileSaved, setProfileSaved] = useState(false);
  const [integrationsSaved, setIntegrationsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    try {
      const storedX = localStorage.getItem("oasis-x-username");
      if (storedX) setXUsername(storedX);
    } catch {}
  }, []);

  useEffect(() => {
    setName(user.name || "");
    setLocation(user.location || "");
  }, [user.name, user.location]);

  const handleSaveProfile = () => {
    const loc = resolveLocation(location.trim() || user.location);
    setUser({
      ...user,
      name: name.trim() || user.name,
      location: location.trim() || user.location,
      resolvedLocation: loc.valid ? loc : undefined,
      feedVersion: (user.feedVersion || 0) + 1,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveIntegrations = () => {
    try {
      const normalized = xUsername.trim()
        ? resolveXHandleAlias(xUsername.replace(/^@/, "").trim())
        : "";
      if (normalized) {
        localStorage.setItem("oasis-x-username", normalized);
        setXUsername(normalized);
      } else {
        localStorage.removeItem("oasis-x-username");
      }
      window.dispatchEvent(new CustomEvent("oasis-x-username-updated"));
    } catch {}
    setIntegrationsSaved(true);
    setTimeout(() => setIntegrationsSaved(false), 2000);
  };

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">
          Account Configuration
        </h1>
        <p className="text-muted-foreground max-w-xl font-light">
          Managing your institutional preferences, integrations, and security
          protocols.
        </p>
      </motion.header>

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="space-y-24"
      >
        {/* Profile Section */}
        <motion.section
          variants={itemVars}
          className="grid md:grid-cols-12 gap-8 items-start"
        >
          <div className="md:col-span-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-2 flex items-center gap-3">
              <User className="w-4 h-4" /> Identity
            </h2>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Your professional profile and location used for curated
              intelligence reporting.
            </p>
          </div>
          <div className="md:col-span-8 space-y-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-muted flex items-center justify-center text-4xl font-serif text-muted-foreground border border-border">
                {user.name?.[0] || "U"}
              </div>
              <div className="space-y-4">
                <button className="px-6 py-2 border border-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors">
                  Upload Credentials
                </button>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Signed JPG or PNG, max 1MB.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Professional Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-2 text-foreground font-light focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, London, Tokyo..."
                  className="w-full bg-transparent border-b border-border py-2 text-foreground font-light focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Contact Node
                </label>
                <input
                  type="email"
                  defaultValue="analyst@oasis.intel"
                  className="w-full bg-transparent border-b border-border py-2 text-foreground font-light focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-2.5 border border-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors"
            >
              {profileSaved ? (
                <>
                  <Check className="w-3 h-3" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save Profile
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Integrations Section */}
        <motion.section
          variants={itemVars}
          className="grid md:grid-cols-12 gap-8 items-start border-t border-border pt-12"
        >
          <div className="md:col-span-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-2 flex items-center gap-3">
              <Key className="w-4 h-4" /> Integrations
            </h2>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Live data is powered by Oasis servers — no API keys required for
              news, Pulse, or X market voices. Optionally link your X handle below.
            </p>
          </div>
          <div className="md:col-span-8 space-y-10">
            {/* X / Twitter */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <AtSign className="w-3 h-3" /> X (Twitter) Username
              </label>
              <input
                type="text"
                value={xUsername}
                onChange={(e) => setXUsername(e.target.value)}
                placeholder="@yourusername"
                className="w-full bg-transparent border-b border-border py-2 text-foreground font-light focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
              />
              <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                Optional — we already surface @DeItaone, @unusual_whales, @Reuters
                and more for everyone. Add your handle to mix your timeline in.
              </p>
            </div>

            <button
              onClick={handleSaveIntegrations}
              className="flex items-center gap-2 px-6 py-2.5 border border-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors"
            >
              {integrationsSaved ? (
                <>
                  <Check className="w-3 h-3" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save X Handle
                </>
              )}
            </button>

            <p className="text-[10px] text-muted-foreground font-light leading-relaxed border-t border-border pt-6">
              Stock quotes use live Yahoo Finance data on Oasis servers, with
              Alpha Vantage as backup — you never need your own market data keys.
            </p>
          </div>
        </motion.section>

        {/* Appearance Section */}
        <motion.section
          variants={itemVars}
          className="grid md:grid-cols-12 gap-8 items-start"
        >
          <div className="md:col-span-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-2 flex items-center gap-3">
              <Sun className="w-4 h-4" /> Visual Environment
            </h2>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Configure the visual density and luminosity of the discovery
              interface.
            </p>
          </div>
          <div className="md:col-span-8">
            <div className="grid grid-cols-3 gap-px bg-border border border-border">
              {mounted && (
                <>
                  {[
                    { id: "light", label: "Luminous", icon: Sun },
                    { id: "dark", label: "Obscura", icon: Moon },
                    { id: "system", label: "Dynamic", icon: Monitor },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id)}
                      className={`flex flex-col items-center justify-center py-10 gap-4 transition-all bg-background hover:bg-muted/50 ${
                        theme === mode.id ? "bg-muted/80" : ""
                      }`}
                    >
                      <mode.icon
                        className={`w-5 h-5 ${
                          theme === mode.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                          theme === mode.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Security & Access */}
        <motion.section
          variants={itemVars}
          className="grid md:grid-cols-12 gap-8 items-start border-t border-border pt-12"
        >
          <div className="md:col-span-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-2 flex items-center gap-3">
              <Shield className="w-4 h-4" /> System Access
            </h2>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Session management and authentication parameters.
            </p>
          </div>
          <div className="md:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="space-y-1">
                <p className="text-sm font-serif text-foreground">
                  Multi-Factor Authentication
                </p>
                <p className="text-xs text-muted-foreground font-light">
                  Enforce biometric verification for data exports.
                </p>
              </div>
              <div className="h-4 w-10 bg-muted relative border border-border">
                <div className="absolute right-1 top-1 h-2 w-2 bg-foreground" />
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-red-500 hover:text-red-400 transition-colors font-bold"
            >
              <LogOut className="w-3 h-3" /> Terminate Session
            </button>
          </div>
        </motion.section>

        <footer className="pt-24 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Institutional-Grade Intelligence Platform
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center md:text-right">
            © 2026 Oasis Discovery Group. All Rights Reserved.
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
