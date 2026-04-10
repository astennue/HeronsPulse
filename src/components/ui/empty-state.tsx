'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Plus, FileQuestion, Bell, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'tasks' | 'notifications' | 'search' | 'error' | 'default';
  className?: string;
  animated?: boolean;
}

const illustrations = {
  tasks: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Clipboard */}
        <rect x="50" y="30" width="100" height="140" rx="8" className="fill-muted stroke-muted-foreground stroke-2" />
        <rect x="70" y="20" width="60" height="20" rx="4" className="fill-muted stroke-muted-foreground stroke-2" />
        
        {/* Check lines */}
        <motion.g
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <line x1="70" y1="70" x2="130" y2="70" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
          <line x1="70" y1="95" x2="110" y2="95" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
          <line x1="70" y1="120" x2="120" y2="120" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
        </motion.g>
        
        {/* Floating check */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <circle cx="150" cy="60" r="20" className="fill-green-500/20 stroke-green-500 stroke-2" />
          <motion.path
            d="M140 60 L147 67 L162 52"
            className="stroke-green-500 stroke-3 fill-none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          />
        </motion.g>
      </motion.g>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Bell */}
        <motion.g
          animate={{ rotate: [-5, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ transformOrigin: '100px 60px' }}
        >
          <path d="M100 30 C85 30 75 45 75 65 L75 95 L65 110 L135 110 L125 95 L125 65 C125 45 115 30 100 30" className="fill-muted stroke-muted-foreground stroke-2" />
          <circle cx="100" cy="125" r="10" className="fill-muted stroke-muted-foreground stroke-2" />
        </motion.g>
        
        {/* Zzz */}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <text x="140" y="50" className="fill-muted-foreground text-lg font-bold">Z</text>
          <text x="155" y="40" className="fill-muted-foreground text-sm font-bold">z</text>
          <text x="165" y="32" className="fill-muted-foreground text-xs font-bold">z</text>
        </motion.g>
      </motion.g>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Magnifying glass */}
        <motion.g
          initial={{ rotate: -45 }}
          style={{ transformOrigin: '80px 80px' }}
        >
          <circle cx="80" cy="80" r="35" className="fill-muted stroke-muted-foreground stroke-3" />
          <line x1="105" y1="105" x2="145" y2="145" className="stroke-muted-foreground stroke-6" strokeLinecap="round" />
        </motion.g>
        
        {/* Question mark inside */}
        <motion.text
          x="80"
          y="90"
          textAnchor="middle"
          className="fill-muted-foreground text-3xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ?
        </motion.text>
      </motion.g>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Robot */}
        <rect x="60" y="60" width="80" height="80" rx="10" className="fill-muted stroke-muted-foreground stroke-2" />
        
        {/* Antenna */}
        <line x1="100" y1="60" x2="100" y2="40" className="stroke-muted-foreground stroke-2" />
        <circle cx="100" cy="35" r="5" className="fill-red-500/50 stroke-red-500 stroke-2" />
        
        {/* Eyes */}
        <motion.g
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
        >
          <circle cx="80" cy="90" r="8" className="fill-muted-foreground" />
          <circle cx="120" cy="90" r="8" className="fill-muted-foreground" />
        </motion.g>
        
        {/* Mouth (sad) */}
        <motion.path
          d="M80 115 Q100 105 120 115"
          className="stroke-muted-foreground stroke-2 fill-none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        
        {/* Broken pieces */}
        <motion.g
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 10, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <rect x="40" y="140" width="15" height="15" rx="2" className="fill-muted stroke-muted-foreground stroke-1 rotate-12" />
          <rect x="145" y="130" width="12" height="12" rx="2" className="fill-muted stroke-muted-foreground stroke-1 -rotate-6" />
        </motion.g>
      </motion.g>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Document */}
        <rect x="50" y="30" width="100" height="130" rx="8" className="fill-muted stroke-muted-foreground stroke-2" />
        <motion.g
          initial={{ y: 0 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Lines */}
          <line x1="70" y1="60" x2="130" y2="60" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
          <line x1="70" y1="80" x2="110" y2="80" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
          <line x1="70" y1="100" x2="120" y2="100" className="stroke-muted-foreground stroke-2" strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration = 'default',
  className = '',
  animated = true,
}: EmptyStateProps) {
  const Icon = icon || (illustration === 'tasks' ? Plus : illustration === 'notifications' ? Bell : illustration === 'search' ? Search : illustration === 'error' ? AlertTriangle : FileQuestion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      {/* Animated Illustration */}
      {animated ? (
        <motion.div
          className="w-40 h-40 mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {illustrations[illustration]}
        </motion.div>
      ) : (
        <div className="w-40 h-40 mb-6">
          {illustrations[illustration]}
        </div>
      )}

      {/* Icon fallback */}
      {!illustrations[illustration] && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Text */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button onClick={action.onClick} className="gap-2">
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
