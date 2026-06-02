"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INTRO_SECTIONS, CADEN_LINKS } from "@/lib/caden-profile";
import { ArrowDown } from "lucide-react";

const SCROLL_HEIGHT_VH = 520;

export function OasisIntro() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48, 0.9], [0, 0.28, 0.68, 0.96]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.1], [0, -40]);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const enterOasis = () => {
    sessionStorage.setItem("oasis-music-autoplay", "1");
    router.push("/onboarding?step=1");
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-[#050505] text-white"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
      {/* Fixed video + darken overlay (8VC-style) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute inset-0" style={{ scale: videoScale }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2f4a] to-[#050505]" />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/lake.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30" />
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Hero — first viewport */}
      <section className="relative z-10 h-screen flex flex-col justify-end pb-14 px-8 md:px-16 max-w-6xl mx-auto w-full">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="space-y-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Oasis</p>
          <h1
            className="text-4xl md:text-6xl font-serif font-light tracking-tight leading-[1.05] max-w-3xl"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Market intelligence,
            <br />
            <span className="text-white/50">personalized.</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base font-light max-w-xl leading-relaxed">
            Scroll to meet the person behind the platform — then step inside.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 text-white/40">
              <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Story sections — scroll over fixed video */}
      {INTRO_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="relative z-10 min-h-screen flex items-center px-8 md:px-16 py-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35 mb-4">
              {section.kicker}
            </p>
            <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight mb-8 leading-tight">
              {section.title}
            </h2>
            <div className="space-y-5">
              {section.body.map((para) => (
                <p
                  key={para.slice(0, 24)}
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
            {section.id === "investing" && (
              <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-white/40">
                <span>Ann Arbor</span>
                <span className="text-white/20">|</span>
                <span>Stanford</span>
                <span className="text-white/20">|</span>
                <span>NYC</span>
              </div>
            )}
          </motion.div>
        </section>
      ))}

      {/* Enter */}
      <section className="relative z-10 min-h-[70vh] flex flex-col items-center justify-center px-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-lg space-y-8"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
            Ready
          </p>
          <p className="text-xl font-serif font-light text-white/80">
            Configure your feed. Hear the playlist. Explore the market.
          </p>
          <button
            type="button"
            onClick={enterOasis}
            className="px-12 py-4 bg-white text-black text-[11px] uppercase tracking-[0.35em] font-semibold hover:bg-white/90 transition-colors"
          >
            Enter Oasis
          </button>
          <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest">
            <Link
              href={CADEN_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              cadenche.com
            </Link>
            <Link
              href={CADEN_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              LinkedIn
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
