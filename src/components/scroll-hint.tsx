"use client";

import { motion } from "framer-motion";

export function ScrollHint({ label = "Scroll" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-white/45 pointer-events-none">
      <span
        className="text-[10px] uppercase tracking-[0.35em]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
      <motion.div className="relative w-[1px] h-12 bg-white/10 overflow-hidden">
        <motion.div
          className="absolute top-0 w-full h-1/2 bg-white"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}
