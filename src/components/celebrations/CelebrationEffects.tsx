'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti Particle
interface ConfettiParticleProps {
  color: string;
  delay: number;
  x: number;
}

function ConfettiParticle({ color, delay, x }: ConfettiParticleProps) {
  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: x, 
        rotate: 0, 
        opacity: 1,
        scale: 1
      }}
      animate={{
        y: '100vh',
        rotate: 720,
        opacity: 0,
        scale: 0.5
      }}
      transition={{
        duration: 3,
        delay: delay,
        ease: 'linear'
      }}
      className="fixed pointer-events-none z-50"
      style={{
        width: Math.random() > 0.5 ? '10px' : '6px',
        height: Math.random() > 0.5 ? '10px' : '6px',
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  );
}

// Confetti Burst Component
interface ConfettiBurstProps {
  isActive: boolean;
  colors?: string[];
  particleCount?: number;
  origin?: { x: number; y: number };
}

export function ConfettiBurst({ 
  isActive, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  particleCount = 50,
  origin = { x: 50, y: 50 }
}: ConfettiBurstProps) {
  const particles = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      x: (Math.random() - 0.5) * 400,
    }));
  }, [particleCount, colors]);

  return (
    <AnimatePresence>
      {isActive && (
        <div 
          className="fixed inset-0 pointer-events-none z-50"
          style={{ 
            left: `${origin.x}%`,
            top: `${origin.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {particles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              color={particle.color}
              delay={particle.delay}
              x={particle.x}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Streak Fire Animation
interface StreakFireProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakFire({ isActive, size = 'md' }: StreakFireProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={`relative ${sizeClasses[size]}`}
        >
          {/* Fire glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.6) 0%, rgba(239, 68, 68, 0.4) 50%, transparent 70%)'
            }}
          />
          {/* Fire SVG */}
          <svg viewBox="0 0 24 24" fill="none" className="relative z-10 w-full h-full">
            <motion.path
              d="M12 2C12 2 8 6 8 10C8 12 9 14 10 15C10 15 8 14 6 14C4 14 2 16 2 18C2 20 4 22 6 22H18C20 22 22 20 22 18C22 16 20 14 18 14C16 14 14 15 14 15C15 14 16 12 16 10C16 6 12 2 12 2Z"
              fill="url(#fireGradient)"
              animate={{
                d: [
                  "M12 2C12 2 8 6 8 10C8 12 9 14 10 15C10 15 8 14 6 14C4 14 2 16 2 18C2 20 4 22 6 22H18C20 22 22 20 22 18C22 16 20 14 18 14C16 14 14 15 14 15C15 14 16 12 16 10C16 6 12 2 12 2Z",
                  "M12 1C12 1 7 5 7 9C7 11 8 13 9 14C9 14 7 13 5 13C3 13 1 15 1 17C1 19 3 21 5 21H19C21 21 23 19 23 17C23 15 21 13 19 13C17 13 15 14 15 14C16 13 17 11 17 9C17 5 12 1 12 1Z",
                  "M12 2C12 2 8 6 8 10C8 12 9 14 10 15C10 15 8 14 6 14C4 14 2 16 2 18C2 20 4 22 6 22H18C20 22 22 20 22 18C22 16 20 14 18 14C16 14 14 15 14 15C15 14 16 12 16 10C16 6 12 2 12 2Z"
                ]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <defs>
              <linearGradient id="fireGradient" x1="12" y1="2" x2="12" y2="22">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Badge Sparkle Effect
interface BadgeSparkleProps {
  isActive: boolean;
  children: React.ReactNode;
}

export function BadgeSparkle({ isActive, children }: BadgeSparkleProps) {
  const sparkles = React.useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i * 45) * (Math.PI / 180),
      delay: i * 0.1
    }));
  }, []);

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isActive && sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ 
              scale: 0, 
              opacity: 0,
              x: 0,
              y: 0
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos(sparkle.angle) * 40,
              y: Math.sin(sparkle.angle) * 40
            }}
            transition={{
              duration: 0.8,
              delay: sparkle.delay,
              ease: 'easeOut'
            }}
            className="absolute top-1/2 left-1/2 pointer-events-none"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5L6 0Z"
                fill="#FBBF24"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Task Completion Celebration
interface TaskCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function TaskCelebration({ isActive, onComplete }: TaskCelebrationProps) {
  React.useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <ConfettiBurst
      isActive={isActive}
      particleCount={30}
      colors={['#10B981', '#34D399', '#6EE7B7', '#3B82F6']}
    />
  );
}

// Achievement Unlocked Celebration
interface AchievementCelebrationProps {
  isActive: boolean;
  badge?: string;
  onComplete?: () => void;
}

export function AchievementCelebration({ isActive, badge, onComplete }: AchievementCelebrationProps) {
  React.useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <>
      <ConfettiBurst
        isActive={isActive}
        particleCount={80}
        colors={['#EAB308', '#FBBF24', '#FDE047', '#F59E0B', '#EF4444']}
      />
      <AnimatePresence>
        {isActive && badge && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-3xl"
              >
                🏆
              </motion.div>
              <div>
                <div className="font-bold text-lg">Achievement Unlocked!</div>
                <div className="text-sm opacity-90">{badge}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Streak Celebration
interface StreakCelebrationProps {
  isActive: boolean;
  streakCount: number;
  onComplete?: () => void;
}

export function StreakCelebration({ isActive, streakCount, onComplete }: StreakCelebrationProps) {
  React.useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <>
      <ConfettiBurst
        isActive={isActive}
        particleCount={40}
        colors={['#F97316', '#FB923C', '#FDBA74', '#FBBF24']}
      />
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <StreakFire isActive={true} size="lg" />
              <div>
                <div className="font-bold text-lg">{streakCount} Day Streak!</div>
                <div className="text-sm opacity-90">Keep it going! 🔥</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { ConfettiBurst, StreakFire, BadgeSparkle };
