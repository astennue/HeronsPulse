'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface LiveCounterProps {
  initialCount?: number;
  min?: number;
  max?: number;
  className?: string;
}

export default function LiveCounter({
  initialCount = 1234,
  min = 1200,
  max = 1300,
  className = '',
}: LiveCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
      setCount((prev) => {
        const newValue = prev + change;
        return Math.min(Math.max(newValue, min), max);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [min, max]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <Users className="h-4 w-4 text-green-500" />
      <span className="font-semibold text-green-500">{count.toLocaleString()}</span>
      <span className="text-muted-foreground">students online</span>
    </motion.div>
  );
}
