'use client';

import { useEffect, useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

// Pre-defined particle positions for SSR consistency
const PARTICLE_POSITIONS = [
  { left: 15, initialY: 120, delay: 0.2 },
  { left: 25, initialY: 180, delay: 0.35 },
  { left: 35, initialY: 150, delay: 0.5 },
  { left: 45, initialY: 200, delay: 0.65 },
  { left: 55, initialY: 140, delay: 0.8 },
  { left: 65, initialY: 190, delay: 0.95 },
  { left: 75, initialY: 160, delay: 1.1 },
  { left: 85, initialY: 210, delay: 1.25 },
  { left: 20, initialY: 170, delay: 1.4 },
  { left: 40, initialY: 130, delay: 1.55 },
  { left: 60, initialY: 185, delay: 1.7 },
  { left: 80, initialY: 155, delay: 1.85 },
];

// Custom hook to safely detect client-side mounting
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isSkipped, setIsSkipped] = useState(false);
  const mounted = useMounted();
  const totalDuration = 2500; // Moderate timing ~2.5 seconds

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (isSkipped) {
      handleComplete();
      return;
    }

    const timer = setTimeout(() => {
      handleComplete();
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [handleComplete, isSkipped]);

  const handleSkip = () => {
    setIsSkipped(true);
  };

  // Use memoized particles to ensure consistency
  const particles = useMemo(() => PARTICLE_POSITIONS, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #0f1419 50%, #1a1a2e 75%, #0a0a0f 100%)',
        }}
      >
        {/* Background ambient glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(212,165,116,0.2) 0%, rgba(100,181,246,0.1) 40%, transparent 70%)' }}
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 70%)' }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #64B5F6 0%, transparent 70%)' }}
          />
        </div>

        {/* Floating particles - only render on client to avoid hydration mismatch */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: particle.initialY,
                  x: `${particle.left - 50}%`
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  y: -100
                }}
                transition={{
                  duration: 2 + (i % 3) * 0.5,
                  delay: particle.delay,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute w-1 h-1 rounded-full bg-white/40"
                style={{
                  left: `${particle.left}%`,
                  bottom: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Main content container */}
        <div className="flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
          
          {/* Logo Container with Reveal Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative"
          >
            {/* Outer glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.3, 0.1] }}
              transition={{
                duration: 1,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="absolute inset-0 -m-8 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
                filter: 'blur(20px)'
              }}
            />

            {/* Pulsing glow behind logo */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 -m-4"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.15) 0%, rgba(100,181,246,0.1) 40%, transparent 70%)',
                filter: 'blur(15px)'
              }}
            />

            {/* Main Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3)) drop-shadow(0 0 60px rgba(212,165,116,0.2))'
              }}
            >
              <Image
                src="/logo.png"
                alt="HeronPulse Logo"
                width={280}
                height={180}
                className="w-[50vw] sm:w-[240px] md:w-[280px] h-auto max-w-[320px] min-w-[160px]"
                priority
              />
            </motion.div>
          </motion.div>

          {/* HERON PULSE Text */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.25em] mt-5"
            style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #D4A574 50%, #64B5F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            HERON PULSE
          </motion.h1>

          {/* ACADEMIC OS Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="text-[10px] sm:text-xs text-white/50 mt-2 tracking-[0.35em] font-light"
          >
            ACADEMIC OS
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 w-24 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full origin-left"
          />
        </div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 0.8 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={handleSkip}
          className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 text-white text-sm tracking-[0.15em] font-light touch-manipulation py-3 px-6 rounded-full hover:bg-white/5 transition-colors"
          style={{ zIndex: 20 }}
        >
          SKIP
        </motion.button>

        {/* Version tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="absolute bottom-4 right-4 text-[10px] text-white/30 tracking-wider"
          style={{ zIndex: 20 }}
        >
          v2.0
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
