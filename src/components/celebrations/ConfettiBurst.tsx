'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
}

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
  colors?: string[];
  particleCount?: number;
  origin?: { x: number; y: number };
}

const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function ConfettiBurst({ 
  trigger, 
  onComplete, 
  colors = defaultColors,
  particleCount = 50,
  origin = { x: 50, y: 50 }
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = 200 + Math.random() * 300;
      newParticles.push({
        id: i,
        x: origin.x,
        y: origin.y,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - 200,
        },
      });
    }
    return newParticles;
  }, [colors, particleCount, origin]);

  useEffect(() => {
    if (trigger) {
      // Use requestAnimationFrame to defer setState
      const frame = requestAnimationFrame(() => {
        setParticles(createParticles());
      });
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [trigger, createParticles, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              rotate: 0,
              scale: particle.scale,
              opacity: 1 
            }}
            animate={{ 
              x: `calc(${particle.x}vw + ${particle.velocity.x}px)`,
              y: `calc(100vh + 100px)`,
              rotate: particle.rotation + 720,
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute w-3 h-3"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Sparkle effect for badges
interface SparkleProps {
  trigger: boolean;
  children: React.ReactNode;
}

export function SparkleEffect({ trigger, children }: SparkleProps) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {trigger && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-30px)`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Trophy animation for achievements
export function TrophyAnimation({ trigger, children }: { trigger: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={trigger ? {
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, -10, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
