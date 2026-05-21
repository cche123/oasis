"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Target, Radio, Cpu, LineChart } from "lucide-react";
import { useUser } from "./user-context";

const steps = [
  {
    title: "Curated Intelligence",
    description: "Oasis organizes global shifts into 'Themes'. Each theme tracks specific structural changes in the market.",
    icon: Target,
    preview: "AI-Enabled Rollups",
  },
  {
    title: "Live Signal Stream",
    description: "Our signals are institutional-grade. They are non-generative, verified facts from primary sources.",
    icon: Radio,
    preview: "US-China Summit: Trade Neutrality",
  },
  {
    title: "Neural Synthesis",
    description: "The Oasis Agent (bottom right) can synthesize any signal or theme into actionable research on demand.",
    icon: Cpu,
    preview: "Ask Oasis: 'Summarize the impact of Warsh...'",
  },
  {
    title: "The Tape",
    description: "A continuous stream of global asset prices keeps you tethered to the reality of the global market.",
    icon: LineChart,
    preview: "BTC: $82,450 (+4.6%)",
  },
];

export function Walkthrough() {
  const { user, setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);

  if (user.hasSeenWalkthrough || !user.isLoggedIn) return null;

  const handleComplete = () => {
    setUser({ ...user, hasSeenWalkthrough: true });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const Icon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-card border border-foreground p-10 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={handleComplete}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-10 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-foreground flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-1">
                    System Protocol {currentStep + 1}
                  </span>
                  <h2 className="text-3xl font-serif text-foreground leading-none">
                    {steps[currentStep].title}
                  </h2>
                </div>
              </div>

              <p className="text-base text-muted-foreground leading-relaxed font-light">
                {steps[currentStep].description}
              </p>

              {/* Interactive Preview Element */}
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-muted/30 border-l-2 border-foreground p-4 mt-8"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Live Preview</div>
                <div className="text-sm font-serif text-foreground italic">
                  &ldquo;{steps[currentStep].preview}&rdquo;
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border">
              <button
                onClick={handleComplete}
                className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors font-bold"
              >
                Skip Interface Tour
              </button>
              
              <div className="flex items-center gap-6">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 w-4 transition-all duration-500 ${i === currentStep ? 'bg-foreground' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-3 border border-border hover:border-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-90 transition-opacity flex items-center gap-3"
                  >
                    {currentStep === steps.length - 1 ? "Initialize" : "Next Protocol"} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
