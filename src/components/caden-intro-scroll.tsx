"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INTRO_SECTIONS, CADEN_LINKS } from "@/lib/caden-profile";
import { ScrollHint } from "@/components/scroll-hint";

const SCROLL_HEIGHT_VH = 420;
const ENTER_THRESHOLD = 280;

export function CadenIntroScroll() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [enterProgress, setEnterProgress] = useState(0);
  const enteringRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.8, 0.9, 0.97],
    [0, 0, 0.3, 0.75]
  );

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    let scrollAccum = 0;
    let armed = false;

    const onProgress = (v: number) => {
      armed = v > 0.72;
      if (!armed) {
        scrollAccum = 0;
        setEnterProgress(0);
      }
    };

    const unsubscribe = scrollYProgress.on("change", onProgress);

    const finishEnter = () => {
      if (enteringRef.current) return;
      enteringRef.current = true;
      router.push("/onboarding?step=1");
    };

    const handleWheel = (e: WheelEvent) => {
      if (!armed || enteringRef.current) return;
      if (e.deltaY <= 0) return;
      e.preventDefault();
      scrollAccum += e.deltaY;
      setEnterProgress(Math.min(scrollAccum / ENTER_THRESHOLD, 1));
      if (scrollAccum >= ENTER_THRESHOLD) finishEnter();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!armed || enteringRef.current) return;
      const diff = touchStartY - e.touches[0].clientY;
      if (diff <= 0) return;
      scrollAccum += diff * 1.2;
      setEnterProgress(Math.min(scrollAccum / ENTER_THRESHOLD, 1));
      if (scrollAccum >= ENTER_THRESHOLD) finishEnter();
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scrollYProgress, router]);

  const finalDark = Math.min(enterProgress, 1);

  return (
    <div
      ref={containerRef}
      className="relative text-white"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        <div
          className="absolute inset-0 bg-black transition-opacity duration-150"
          style={{ opacity: finalDark }}
        />
      </div>

      <div className="fixed bottom-8 right-8 md:right-14 z-30 pointer-events-none">
        <ScrollHint label="Scroll" />
      </div>

      {INTRO_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="relative z-10 min-h-screen flex items-center px-8 md:px-16 py-24"
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
            <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight mb-8 leading-tight">
              {section.title}
            </h2>
            <div className="space-y-5">
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

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-md space-y-12"
        >
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/35">Caden Che</p>
            <p className="text-xl md:text-2xl font-serif font-light text-white/90 leading-relaxed">
              Math at Stanford. Building toward a career in investing.
            </p>
          </div>

          <div className="flex flex-col items-center gap-5">
            <Link
              href={CADEN_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide text-white/70 hover:text-white transition-colors"
            >
              cadenche.com
            </Link>
            <Link
              href={CADEN_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide text-white/70 hover:text-white transition-colors"
            >
              @cadenhche
            </Link>
            <Link
              href={CADEN_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide text-white/70 hover:text-white transition-colors"
            >
              LinkedIn
            </Link>
          </div>

          <div className="pt-6">
            <ScrollHint label="Scroll to enter Oasis" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
