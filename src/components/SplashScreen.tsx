import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Smooth loading animation strictly under 1.5s (~1.2s)
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F17] px-6 select-none overflow-hidden"
    >
      {/* Subtle Dynamic Accent Ambient Glow */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full blur-[90px] pointer-events-none"
        style={{ backgroundColor: 'var(--accent-glow)', opacity: 0.32 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center text-center"
      >
        {/* Sleek Geometric Emblem */}
        <motion.div
          animate={{ scale: [0.98, 1.03, 1] }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-slate-900 dark:bg-gradient-to-br dark:from-[#191F2E] dark:via-[#0E131D] dark:to-[#080B11] border border-accent-soft glow-accent flex items-center justify-center mb-6"
        >
          <svg viewBox="0 0 40 40" className="w-11 h-11" fill="none">
            <path
              d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
              stroke="var(--accent-bright)"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M25.5 15.2C24.2 13.8 22.3 13 20.1 13C15.9 13 12.8 16 12.8 20C12.8 24 15.9 27 20.1 27C22.4 27 24.3 26.1 25.6 24.7"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <circle cx="27" cy="20" r="2.2" fill="var(--accent-bright)" />
          </svg>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          CAMPUS LIFE <span className="text-accent">CYUT</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 tracking-wide">
          朝陽科技大學智慧校園數位生態系
        </p>

        {/* Smooth Progress Bar (~1.1s) */}
        <div className="w-52 h-1 bg-slate-200 dark:bg-slate-800/90 rounded-full overflow-hidden mt-7">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left', backgroundColor: 'var(--accent-bright)' }}
            className="h-full w-full rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
