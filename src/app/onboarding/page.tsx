"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-context";

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

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Curious Explorer", desc: "New to markets" },
  { id: "intermediate", label: "Active Learner", desc: "Follow markets casually" },
  { id: "advanced", label: "Deep Researcher", desc: "Analyze markets daily" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const router = useRouter();
  const { setUser } = useUser();

  const totalSteps = 4;

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
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
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setUser({ name: "Guest", interests: [], experience: "beginner", isLoggedIn: true });
    router.push("/dashboard");
  };

  // Auto-redirect after calibrating for 4 seconds & save user
  useEffect(() => {
    if (step === totalSteps) {
      setUser({ name: name || "Guest", interests: selected, experience, isLoggedIn: true });
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, router, name, selected, experience, setUser]);

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return selected.length > 0;
    if (step === 3) return experience.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-xl z-10">
        {/* Skip button */}
        {step < totalSteps && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-8 right-8"
          >
            <button
              onClick={handleSkip}
              className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors"
            >
              Skip — Enter as Guest
            </button>
          </motion.div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-16 justify-center">
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
                  Select topics or add your own. Oasis AI will curate your feed.
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
                {/* Custom interests that were added */}
                {selected.filter((s) => !INTERESTS.includes(s)).map((interest) => (
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
              {/* Custom interest input */}
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                  placeholder="Add your own interest..."
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
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                  How deep do you go?
                </h1>
                <p className="text-white/40 text-sm max-w-sm mx-auto">
                  This helps us calibrate the depth of your market briefs.
                </p>
              </div>
              <div className="space-y-3 max-w-sm mx-auto">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-5 border transition-all duration-300 text-left",
                      experience === level.id
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/70 border-white/15 hover:border-white/40"
                    )}
                  >
                    <div>
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className={cn("text-xs mt-0.5", experience === level.id ? "text-black/50" : "text-white/30")}>{level.desc}</div>
                    </div>
                    {experience === level.id && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 text-center py-12"
            >
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                Calibrating your signals...
              </h1>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                Scanning WSJ, Bloomberg, SEC filings, and X for your selected topics.
              </p>
              <div className="flex justify-center pt-6">
                <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="text-[10px] uppercase tracking-[0.3em] text-white/25 pt-4"
              >
                Entering Oasis...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        {step < totalSteps && (
          <div className="mt-14 flex justify-end">
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
