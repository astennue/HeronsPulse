'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface FloatingMockupProps {
  type: 'desktop' | 'tablet' | 'mobile';
  image: string;
  delay?: number;
  className?: string;
}

export default function FloatingMockup({ type, image, delay = 0, className = '' }: FloatingMockupProps) {
  const dimensions = {
    desktop: { width: 400, height: 250, containerClass: 'w-72 sm:w-80 md:w-96' },
    tablet: { width: 200, height: 280, containerClass: 'w-40 sm:w-48' },
    mobile: { width: 120, height: 220, containerClass: 'w-24 sm:w-28' },
  };

  const { width, height, containerClass } = dimensions[type];

  const floatingAnimation = {
    y: [0, -15, 0],
    rotate: type === 'desktop' ? [0, 1, 0] : type === 'tablet' ? [0, -2, 0] : [0, 3, 0],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      className={`relative ${containerClass} ${className}`}
    >
      <motion.div
        animate={floatingAnimation}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Device Frame */}
        <div
          className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl overflow-hidden ${
            type === 'desktop' ? 'rounded-t-xl' : ''
          }`}
        >
          {/* Desktop specific top bar */}
          {type === 'desktop' && (
            <div className="h-6 bg-slate-900 flex items-center px-2 gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          )}

          {/* Screen */}
          <div className="relative bg-background overflow-hidden">
            <Image
              src={image}
              alt={`${type} mockup`}
              width={width}
              height={height}
              className="w-full h-auto object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          </div>

          {/* Mobile notch */}
          {type === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-b-lg" />
          )}
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-lg rounded-full" />
      </motion.div>
    </motion.div>
  );
}
