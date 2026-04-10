'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  type: 'circle' | 'blob' | 'square';
}

interface FloatingShapesProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function FloatingShapes({ 
  count = 6, 
  colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
  minSize = 40,
  maxSize = 200,
  className = ''
}: FloatingShapesProps) {
  const shapes = useMemo<FloatingShape[]>(() => {
    const newShapes: FloatingShape[] = [];
    for (let i = 0; i < count; i++) {
      newShapes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 6 + Math.random() * 4,
        type: ['circle', 'blob', 'square'][Math.floor(Math.random() * 3)] as 'circle' | 'blob' | 'square',
      });
    }
    return newShapes;
  }, [count, colors, minSize, maxSize]);

  const getShapeClass = (type: 'circle' | 'blob' | 'square') => {
    switch (type) {
      case 'blob':
        return 'rounded-[60%_40%_30%_70%_/60%_30%_70%_40%]';
      case 'square':
        return 'rounded-lg rotate-45';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          initial={{ 
            x: `${shape.x}%`, 
            y: `${shape.y}%`,
            opacity: 0.1,
            scale: 0.8 
          }}
          animate={{
            y: [`${shape.y}%`, `${shape.y - 10}%`, `${shape.y}%`],
            x: [`${shape.x}%`, `${shape.x + 5}%`, `${shape.x}%`],
            rotate: [0, 10, -10, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute ${getShapeClass(shape.type)}`}
          style={{
            width: shape.size,
            height: shape.size,
            background: `linear-gradient(135deg, ${shape.color}20, ${shape.color}10)`,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

// Particle system for interactive backgrounds
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  count?: number;
  color?: string;
  className?: string;
}

export function ParticleBackground({ 
  count = 30, 
  color = '#3B82F6',
  className = '' 
}: ParticleBackgroundProps) {
  const particles = useMemo<Particle[]>(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    return newParticles;
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: `${particle.x}%`, 
            y: `${particle.y}%`,
          }}
          animate={{
            x: [`${particle.x}%`, `${particle.x + particle.speedX * 20}%`, `${particle.x}%`],
            y: [`${particle.y}%`, `${particle.y + particle.speedY * 20}%`, `${particle.y}%`],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}

// Mesh gradient background
export function MeshGradient({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 animate-mesh-gradient" />
      <div className="absolute inset-0 bg-gradient-to-tl from-green-500/10 via-transparent to-orange-500/10 animate-mesh-gradient" style={{ animationDelay: '-7s' }} />
    </div>
  );
}

// Dots pattern background
interface DotsPatternProps {
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  className?: string;
}

export function DotsPattern({ 
  dotColor = 'currentColor',
  dotSize = 2,
  gap = 20,
  className = '' 
}: DotsPatternProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none opacity-[0.15] ${className}`}
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}

// Floating notification/due date cards
interface FloatingCardData {
  id: number;
  icon: 'calendar' | 'bell' | 'file' | 'clock' | 'alert';
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  x: number;
  y: number;
}

const floatingCards: FloatingCardData[] = [
  { id: 1, icon: 'calendar', title: 'Deadline Tomorrow', subtitle: 'CS401 Project Proposal', color: '#F97316', delay: 0, x: 5, y: 20 },
  { id: 2, icon: 'bell', title: 'New Grade Posted', subtitle: 'IT301 - Assignment 3', color: '#22C55E', delay: 1.5, x: 75, y: 15 },
  { id: 3, icon: 'clock', title: 'Meeting at 3:00 PM', subtitle: 'Faculty Consultation', color: '#3B82F6', delay: 3, x: 10, y: 70 },
  { id: 4, icon: 'alert', title: 'Task Overdue', subtitle: 'Research Paper Draft', color: '#EF4444', delay: 4.5, x: 80, y: 65 },
];

const iconMap = {
  calendar: '📅',
  bell: '🔔',
  file: '📄',
  clock: '⏰',
  alert: '⚠️',
};

export function FloatingNotificationCards({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {floatingCards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [20, 0, -10, -30],
            x: [-20, 0, 10, 20],
          }}
          transition={{
            duration: 6,
            delay: card.delay,
            repeat: Infinity,
            repeatDelay: 12,
            ease: 'easeOut',
          }}
          className="absolute hidden lg:flex"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
          }}
        >
          <div 
            className="glass-card px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md"
            style={{ borderColor: `${card.color}30` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${card.color}20` }}
              >
                {iconMap[card.icon]}
              </div>
              <div>
                <p className="text-sm font-semibold whitespace-nowrap">{card.title}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{card.subtitle}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Combined decorative background
export function DecorativeBackground({ 
  showDots = true,
  showFloatingCards = true,
  showShapes = true,
  className = ''
}: { 
  showDots?: boolean;
  showFloatingCards?: boolean;
  showShapes?: boolean;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {showShapes && <FloatingShapes count={6} minSize={80} maxSize={200} />}
      {showDots && <DotsPattern dotSize={1.5} gap={24} />}
      {showFloatingCards && <FloatingNotificationCards />}
    </div>
  );
}
