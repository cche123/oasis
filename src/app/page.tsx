"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative flex items-center justify-center font-sans cursor-default">
      
      {/* Video Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 4, ease: "easeOut" }}
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
        {/* Lighter vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-[#050505]/40" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#050505]/20 via-transparent to-[#050505]/20" />
      </motion.div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, delay: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-14"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-widest text-white/90 uppercase select-none">
            Oasis
          </h1>
          
          <Link
            href="/onboarding"
            className="animate-glow text-[11px] uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors duration-700"
          >
            Enter Platform
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
