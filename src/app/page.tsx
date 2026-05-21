"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { resolveLocation } from "@/lib/locations";

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [locationLine, setLocationLine] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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
    const threshold = 400;
    let transitioning = false;

    const handleWheel = (e: WheelEvent) => {
      if (transitioning) return;
      if (e.deltaY < 0 && scrollAccum === 0) return;

      scrollAccum += e.deltaY;
      if (scrollAccum < 0) scrollAccum = 0;

      const progress = Math.min(scrollAccum / threshold, 1);
      setScrollProgress(progress);

      if (progress >= 1 && !transitioning) {
        transitioning = true;
        router.push("/onboarding?step=1");
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

        const progress = Math.min(scrollAccum / threshold, 1);
        setScrollProgress(progress);

        if (progress >= 1 && !transitioning) {
          transitioning = true;
          router.push("/onboarding?step=1");
        }
      }
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 h-screen w-screen bg-[#050505] text-white overflow-hidden overscroll-none relative flex flex-col font-sans cursor-default"
    >
      <div
        className="absolute inset-0 bg-black z-50 pointer-events-none transition-opacity duration-75"
        style={{ opacity: scrollProgress }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/lake.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#050505]/10 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col justify-end pb-12 md:pb-16 px-8 md:px-14 max-w-[1400px] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end gap-10 md:gap-20"
        >
          <div className="max-w-[550px]">
            <span
              className="text-white font-medium"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                lineHeight: "1.8",
                letterSpacing: "0.5px",
                fontWeight: 500,
              }}
            >
              Oasis
            </span>
            {locationLine && (
              <span
                className="block text-white/50 mt-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Briefing tailored for {locationLine}
              </span>
            )}
            <span
              className="text-white/80"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                lineHeight: "1.8",
                letterSpacing: "0.5px",
                fontWeight: 300,
              }}
            >
              {" "}
              applies generative intelligence and real-time signals to
              synthesize private markets, M&A activity, and global macro trends
              for institutional discovery.
            </span>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0 mr-2 md:mr-6">
            <div
              className="text-white/50 text-right"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Scroll to enter
            </div>

            <div className="relative w-[1px] h-12 bg-white/10 overflow-hidden mr-[20px] md:mr-[35px]">
              <motion.div
                className="absolute top-0 w-full h-1/2 bg-white"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
