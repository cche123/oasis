"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { resolveLocation } from "@/lib/locations";
import { ScrollHint } from "@/components/scroll-hint";

type LockScreenProps = {
  onComplete: () => void;
};

export function LockScreen({ onComplete }: LockScreenProps) {
  const [locationLine, setLocationLine] = useState<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("oasis-user");
      if (!stored) return;
      const profile = JSON.parse(stored);
      const loc = profile.resolvedLocation?.valid
        ? profile.resolvedLocation.displayName
        : profile.location
          ? resolveLocation(profile.location).valid
            ? resolveLocation(profile.location).displayName
            : null
          : null;
      if (loc) setLocationLine(loc);
    } catch {}
  }, []);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    let scrollAccum = 0;
    const threshold = 520;
    let transitioning = false;

    const handleWheel = (e: WheelEvent) => {
      if (transitioning) return;
      if (e.deltaY < 0 && scrollAccum === 0) return;
      scrollAccum += e.deltaY;
      if (scrollAccum < 0) scrollAccum = 0;
      if (scrollAccum >= threshold && !transitioning) {
        transitioning = true;
        completedRef.current = true;
        onComplete();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (transitioning) return;
      const diff = touchStartY - e.touches[0].clientY;
      if (diff > 0) {
        scrollAccum += diff * 1.5;
        if (scrollAccum < 0) scrollAccum = 0;
        if (scrollAccum >= threshold && !transitioning) {
          transitioning = true;
          completedRef.current = true;
          onComplete();
        }
      }
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      if (!completedRef.current) {
        document.documentElement.style.overflow = prevHtml;
        document.body.style.overflow = prevBody;
      }
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 h-screen w-screen text-white overflow-hidden z-20 flex flex-col font-sans cursor-default pointer-events-none">
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-12 md:pb-16 px-8 md:px-14 max-w-[1400px] w-full mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end gap-10 md:gap-20"
        >
          <div className="max-w-[550px]">
            <span className="text-white font-medium text-base leading-relaxed tracking-wide">
              Oasis
            </span>
            {locationLine && (
              <span className="block text-white/50 mt-2 text-xs uppercase tracking-widest">
                Briefing tailored for {locationLine}
              </span>
            )}
            <span className="text-white/80 text-base font-light leading-relaxed tracking-wide">
              {" "}
              applies generative intelligence and real-time signals to synthesize private
              markets, M&A activity, and global macro trends for institutional discovery.
            </span>
          </div>
          <ScrollHint label="Scroll to continue" />
        </motion.div>
      </div>
    </motion.div>
  );
}
