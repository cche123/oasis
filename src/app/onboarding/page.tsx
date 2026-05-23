"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, User, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-context";
import { resolveLocation, FALLBACK_MARKETS } from "@/lib/locations";

const INTERESTS = [
  "Artificial Intelligence",
  "M&A Activity",
  "Japan Markets",
  "Defense Tech",
  "SaaS Consolidation",
  "Geopolitics",
  "Energy Infrastructure",
  "Weight Loss Drugs",
  "Supply Chain Shift",
  "Crypto & Digital Assets",
  "European Markets",
  "Sovereign Wealth Funds",
];

const INTERNATIONAL_MARKETS = FALLBACK_MARKETS;

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const totalSteps = 4;

  const stepFromUrl = Math.min(
    Math.max(parseInt(searchParams.get("step") || "1", 10) || 1, 1),
    totalSteps
  );

  const [step, setStep] = useState(stepFromUrl);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [locationWarning, setLocationWarning] = useState(false);
  const { setUser } = useUser();
  const hasStartedCalibration = useRef(false);

  const resolved = resolveLocation(location);

  // Sync step from browser back/forward
  useEffect(() => {
    setStep(stepFromUrl);
  }, [stepFromUrl]);

  // Lock page scroll — content stays fixed
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    if (location.trim().length >= 2) {
      setLocationWarning(!resolveLocation(location).valid);
    } else {
      setLocationWarning(false);
    }
  }, [location]);

  const goToStep = (newStep: number, replace = false) => {
    const clamped = Math.min(Math.max(newStep, 1), totalSteps);
    setStep(clamped);
    const url = `/onboarding?step=${clamped}`;
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
      setCustomInterest("");
    }
  };

  const handleNext = () => {
    if (step < totalSteps) goToStep(step + 1);
  };

  const saveAndFinish = (profile: Parameters<typeof setUser>[0]) => {
    setUser(profile);
    router.replace("/dashboard");
  };

  const handleSkip = () => {
    saveAndFinish({
      name: "Guest",
      interests: [],
      location: "",
      internationalMarkets: ["USA"],
      resolvedLocation: undefined,
      isLoggedIn: true,
      hasSeenWalkthrough: false,
      feedVersion: 1,
    });
  };

  const buildProfile = () => {
    const loc = resolveLocation(location);
    return {
      name: name || "Guest",
      interests: selected,
      location: location.trim(),
      internationalMarkets:
        selectedMarkets.length > 0
          ? selectedMarkets
          : loc.valid
            ? []
            : ["USA"],
      resolvedLocation: loc.valid ? loc : undefined,
      isLoggedIn: true,
      hasSeenWalkthrough: false,
      feedVersion: 1,
    };
  };

  useEffect(() => {
    if (step === totalSteps && !hasStartedCalibration.current) {
      hasStartedCalibration.current = true;
      setUser(buildProfile());
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 3500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return selected.length > 0;
    if (step === 3) return location.trim().length > 0;
    return false;
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden overscroll-none">
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-xl z-10 flex flex-col max-h-[calc(100vh-3rem)] overflow-hidden">
        {step < totalSteps && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-8 right-8 z-20"
          >
            <button
              onClick={handleSkip}
              className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors"
            >
              Skip — Enter as Guest
            </button>
          </motion.div>
        )}

        <div className="flex items-center gap-1.5 mb-10 justify-center shrink-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-[2px] flex-1 transition-all duration-500",
                i < step ? "bg-white" : "bg-white/15"
              )}
            />
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                    Welcome to Oasis.
                  </h1>
                  <p className="text-white/40 text-sm max-w-sm mx-auto">
                    Let&apos;s personalize your intelligence feed. What should we call you?
                  </p>
                </div>
                <div className="max-w-sm mx-auto">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                      placeholder="Your name"
                      autoFocus
                      className="w-full bg-transparent border-b border-white/20 focus:border-white pl-12 pr-4 py-4 text-lg font-light tracking-wide focus:outline-none transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                    What interests you, {name || "friend"}?
                  </h1>
                  <p className="text-white/40 text-sm max-w-sm mx-auto">
                    Select topics or add your own. Oasis AI will curate your feed from live news.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INTERESTS.map((interest) => {
                    const isSelected = selected.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 border text-sm font-medium transition-all duration-300",
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white/80"
                        )}
                      >
                        <span className="truncate text-left">{interest}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                  {selected
                    .filter((s) => !INTERESTS.includes(s))
                    .map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="flex items-center justify-between px-4 py-3 border text-sm font-medium transition-all duration-300 bg-white text-black border-white"
                      >
                        <span className="truncate text-left">{interest}</span>
                        <Check className="w-3.5 h-3.5 shrink-0 ml-2" />
                      </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                    placeholder="Add your own interest (e.g. AI roll-ups)..."
                    className="flex-1 bg-transparent border-b border-white/15 focus:border-white/50 px-2 py-3 text-sm font-light focus:outline-none transition-colors placeholder:text-white/25"
                  />
                  <button
                    onClick={addCustomInterest}
                    className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white/50" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                    Where are you focused?
                  </h1>
                </div>
                <div className="space-y-6 max-w-sm mx-auto">
                  <div className="space-y-3">
                    <label className="text-xs text-white/50 uppercase tracking-widest">
                      Your Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Troy, Michigan · Gujarat · Singapore · Kyoto"
                      className="w-full bg-transparent border-b border-white/20 focus:border-white py-3 text-lg font-light tracking-wide focus:outline-none transition-colors placeholder:text-white/20"
                    />
                    {locationWarning && location.trim().length >= 2 && (
                      <div className="flex items-start gap-2 text-amber-400/90 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          Location not recognized — using US news. Continue or pick markets below.
                        </span>
                      </div>
                    )}
                    {resolved.valid && location.trim().length >= 2 && (
                      <p className="text-xs text-emerald-400/80">
                        ✓ {resolved.displayName} — regional news enabled
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-white/50 uppercase tracking-widest">
                      International Markets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTERNATIONAL_MARKETS.map((market) => {
                        const isSelected = selectedMarkets.includes(market);
                        return (
                          <button
                            key={market}
                            onClick={() => toggleMarket(market)}
                            className={cn(
                              "px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full border",
                              isSelected
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-white/60 border-white/20 hover:border-white/50"
                            )}
                          >
                            {market}
                          </button>
                        );
                      })}
                    </div>
                    {locationWarning && (
                      <p className="text-[10px] text-white/30">
                        Tip: select USA or other regions above for broader coverage.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center space-y-12 py-12"
              >
                <div className="text-center space-y-6">
                  <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight max-w-2xl mx-auto">
                    Calibrating your signals...
                  </h1>
                  <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                    {resolved.valid
                      ? `Fetching live news for ${resolved.displayName} and your interests.`
                      : "Fetching live global news for your interests."}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1.2 }}
                  className="text-[10px] uppercase tracking-[0.3em] text-white/25 pt-4"
                >
                  Entering Oasis...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 1] }}
                  transition={{ times: [0, 0.85, 1], duration: 3.5, ease: "easeInOut" }}
                  className="fixed inset-0 bg-white pointer-events-none z-[100]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < totalSteps && (
          <div className="mt-8 flex justify-end shrink-0">
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-white text-black px-8 py-3.5 font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center text-white/40 text-sm">
          Loading...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
