"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INTRO_SECTIONS, CADEN_LINKS } from "@/lib/caden-profile";
import { resolveLocation } from "@/lib/locations";
import { ScrollHint } from "@/components/scroll-hint";
import { LandingVideo } from "@/components/landing-video";
import { Globe } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.065 2.065 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** hero + intro sections + socials finale */
const SCROLL_HEIGHT_VH = 380;

export function LandingScroll() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);
  const [locationLine, setLocationLine] = useState<string | null>(null);
  const [hintLabel, setHintLabel] = useState("Scroll to continue");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.78, 0.88, 0.96, 1],
    [0, 0, 0, 0.45, 0.92]
  );

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
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onProgress = (v: number) => {
      if (v > 0.82) setHintLabel("Scroll to enter Oasis");
      else if (v > 0.02) setHintLabel("Scroll");
      else setHintLabel("Scroll to continue");

      if (v >= 0.985 && !enteredRef.current) {
        enteredRef.current = true;
        sessionStorage.setItem("oasis-music-autoplay", "1");
        router.push("/onboarding?step=1");
      }
    };

    const unsub = scrollYProgress.on("change", onProgress);
    return () => unsub();
  }, [scrollYProgress, router]);

  return (
    <motion.div className="relative bg-[#050505] min-h-screen text-white font-sans">
      <LandingVideo />

      <div className="fixed inset-0 z-[1] pointer-events-none">
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
      </div>

      <div className="fixed bottom-12 md:bottom-16 right-8 md:right-14 z-30 pointer-events-none">
        <ScrollHint label={hintLabel} />
      </div>

      <div ref={containerRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }}>
        {/* Hero — original lock screen */}
        <section className="relative z-10 min-h-screen flex flex-col justify-end pb-12 md:pb-16 px-8 md:px-14 max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="max-w-[550px] pr-24"
          >
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
          </motion.div>
        </section>

        {INTRO_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="relative z-10 min-h-[58vh] flex items-center px-8 md:px-16 py-14 md:py-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35 mb-4">
                {section.kicker}
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight mb-6 leading-tight">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.body.map((para) => (
                  <p
                    key={para.slice(0, 28)}
                    className="text-base md:text-lg text-white/65 font-light leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
              {"link" in section && section.link && (
                <Link
                  href={section.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-8 text-sm border-b border-white/40 pb-0.5 text-white/80 hover:text-white transition-colors"
                >
                  {section.link.label} →
                </Link>
              )}
            </motion.div>
          </section>
        ))}

        {/* Socials + enter */}
        <section className="relative z-10 min-h-[70vh] flex flex-col items-center justify-center px-8 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-10"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-white">
              Caden Che
            </h2>

            <div className="flex items-center justify-center gap-8">
              <Link
                href={CADEN_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Globe className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href={CADEN_LINKS.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-white/60 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </Link>
              <Link
                href={CADEN_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/60 hover:text-white transition-colors"
              >
                <LinkedInIcon className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
