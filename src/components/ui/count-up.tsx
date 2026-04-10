'use client';

import * as React from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// ==================== COUNT UP NUMBER ====================
interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
}

export function CountUp({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ','
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const spring = useSpring(from, {
    duration: duration * 1000,
    bounce: 0
  });

  const display = useTransform(spring, (current) => {
    const formatted = current.toFixed(decimals);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  });

  React.useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        spring.set(to);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, to, spring, delay, hasAnimated]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

// ==================== ANIMATED STAT ====================
interface AnimatedStatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  delay?: number;
  countUp?: boolean;
  suffix?: string;
  className?: string;
}

export function AnimatedStat({
  value,
  label,
  icon,
  color = 'primary',
  delay = 0,
  countUp = true,
  suffix = '',
  className
}: AnimatedStatProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Parse numeric value for count-up
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const hasValidNumber = !isNaN(numericValue);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={cn('text-center p-2 sm:p-3', className)}
    >
      <motion.p
        className={cn(
          'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
          color === 'primary' && 'text-primary',
          color === 'blue' && 'text-blue-500',
          color === 'green' && 'text-green-500',
          color === 'purple' && 'text-purple-500',
          color === 'orange' && 'text-orange-500',
          color === 'pink' && 'text-pink-500'
        )}
      >
        {icon && <span className="mr-2 inline-block">{icon}</span>}
        {countUp && hasValidNumber ? (
          <CountUp to={numericValue} suffix={suffix} duration={2} delay={delay} />
        ) : (
          value
        )}
      </motion.p>
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
        {label}
      </p>
    </motion.div>
  );
}

// ==================== STATS GRID ====================
interface StatItem {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  suffix?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
  countUp?: boolean;
}

export function StatsGrid({ stats, className, countUp = true }: StatsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8', className)}
    >
      {stats.map((stat, index) => (
        <AnimatedStat
          key={index}
          {...stat}
          delay={index * 0.1}
          countUp={countUp}
        />
      ))}
    </motion.div>
  );
}

// ==================== ANIMATED COUNTER BADGE ====================
interface CounterBadgeProps {
  count: number;
  label?: string;
  className?: string;
  showPlus?: boolean;
}

export function CounterBadge({
  count,
  label,
  className,
  showPlus = true
}: CounterBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium',
        className
      )}
    >
      <CountUp to={count} duration={1.5} />
      {showPlus && count >= 1000 && <span>+</span>}
      {label && <span className="ml-1">{label}</span>}
    </motion.div>
  );
}

// ==================== PROGRESS COUNTER ====================
interface ProgressCounterProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressCounter({
  current,
  total,
  className,
  showPercentage = true
}: ProgressCounterProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-baseline gap-1">
        <CountUp to={current} duration={1} className="text-2xl font-bold" />
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{total}</span>
      </div>
      {showPercentage && (
        <span className="text-sm text-muted-foreground">
          ({percentage}%)
        </span>
      )}
    </div>
  );
}

export { CountUp, AnimatedStat };
