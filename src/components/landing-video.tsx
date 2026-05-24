"use client";

import { motion, type MotionValue } from "framer-motion";

type LandingVideoProps = {
  scale?: MotionValue<number>;
};

export function LandingVideo({ scale }: LandingVideoProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute inset-0" style={scale ? { scale } : undefined}>
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
      <motion.div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 via-transparent to-transparent" />
      <motion.div className="absolute inset-0 bg-gradient-to-l from-[#050505]/5 via-transparent to-transparent" />
    </div>
  );
}
