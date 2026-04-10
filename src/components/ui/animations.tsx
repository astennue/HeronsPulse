'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, ReactNode } from 'react';

// Counter animation hook
export function useCountUp(end: number, duration: number = 1000, start: number = 0) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      setCount(current);
      
      if (now < endTime) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  
  return count;
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  className = '',
  decimals = 0
}: AnimatedCounterProps) {
  const count = useCountUp(value, duration);
  
  return (
    <span className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

// Stagger container for children animations
interface StaggerContainerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function StaggerContainer({ children, delay = 0.1, className = '' }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in wrapper
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'up',
  duration = 0.4,
  className = '' 
}: FadeInProps) {
  const initialOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in wrapper
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className = '' }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect wrapper
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
}

export function HoverLift({ children, className = '', lift = 4 }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -lift, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glow effect on hover
interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function GlowEffect({ children, className = '', color = 'rgba(59, 130, 246, 0.4)' }: GlowEffectProps) {
  return (
    <motion.div
      whileHover={{ boxShadow: `0 0 20px ${color}` }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading skeleton
interface ShimmerSkeletonProps {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function ShimmerSkeleton({ className = '', rounded = 'md' }: ShimmerSkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div 
      className={`
        relative overflow-hidden bg-muted
        ${roundedClasses[rounded]}
        ${className}
      `}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 50, className = '', onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);
  
  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-4 bg-current ml-0.5"
      />
    </span>
  );
}
