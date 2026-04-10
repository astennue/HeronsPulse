'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ==================== FLOATING SHAPES ====================
interface FloatingShapeProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: { x: string; y: string };
  delay?: number;
  duration?: number;
}

export function FloatingShape({
  className,
  color = 'primary',
  size = 'md',
  position = { x: '50%', y: '50%' },
  delay = 0,
  duration = 6
}: FloatingShapeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    purple: 'bg-purple-500/10',
    orange: 'bg-orange-500/10',
    pink: 'bg-pink-500/10',
    yellow: 'bg-yellow-500/10'
  };

  const blobVariants = [
    'rounded-[60%_40%_30%_70%/_60%_30%_70%_40%]',
    'rounded-[30%_60%_70%_40%/_50%_60%_30%_60%]',
    'rounded-[50%_60%_40%_70%/_40%_50%_60%_50%]',
    'rounded-[40%_60%_50%_70%/_60%_40%_50%_60%]'
  ];

  const randomBlob = blobVariants[Math.floor(Math.random() * blobVariants.length)];

  return (
    <motion.div
      className={cn(
        'absolute pointer-events-none',
        sizeClasses[size],
        colorClasses[color] || color,
        randomBlob,
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, -10, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

// ==================== PARTICLE FIELD ====================
interface ParticleFieldProps {
  count?: number;
  className?: string;
  color?: string;
  minSize?: number;
  maxSize?: number;
}

export function ParticleField({
  count = 30,
  className,
  color = 'primary',
  minSize = 2,
  maxSize = 6
}: ParticleFieldProps) {
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2
    }));
  }, [count, minSize, maxSize]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            'absolute rounded-full',
            color === 'primary' && 'bg-primary/30',
            color === 'blue' && 'bg-blue-500/30',
            color === 'green' && 'bg-green-500/30',
            color === 'purple' && 'bg-purple-500/30',
            color === 'orange' && 'bg-orange-500/30',
            color === 'pink' && 'bg-pink-500/30',
            color === 'yellow' && 'bg-yellow-500/30',
            color === 'multi' && 'bg-primary/30'
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// ==================== MESH GRADIENT BACKGROUND ====================
interface MeshGradientProps {
  className?: string;
  animated?: boolean;
}

export function MeshGradient({ className, animated = true }: MeshGradientProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(at 40% 20%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(249, 115, 22, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(234, 179, 8, 0.08) 0px, transparent 50%)
          `
        }}
        animate={animated ? {
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0]
        } : {}}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}

// ==================== ANIMATED BACKGROUND COMBO ====================
interface AnimatedBackgroundProps {
  className?: string;
  showParticles?: boolean;
  showShapes?: boolean;
  showMesh?: boolean;
  particleCount?: number;
}

export function AnimatedBackground({
  className,
  showParticles = true,
  showShapes = true,
  showMesh = true,
  particleCount = 25
}: AnimatedBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Mesh Gradient Base */}
      {showMesh && <MeshGradient />}

      {/* Floating Shapes */}
      {showShapes && (
        <>
          <FloatingShape
            color="blue"
            size="lg"
            position={{ x: '10%', y: '20%' }}
            delay={0}
            duration={8}
          />
          <FloatingShape
            color="purple"
            size="md"
            position={{ x: '85%', y: '30%' }}
            delay={1}
            duration={7}
          />
          <FloatingShape
            color="pink"
            size="lg"
            position={{ x: '70%', y: '70%' }}
            delay={2}
            duration={9}
          />
          <FloatingShape
            color="green"
            size="sm"
            position={{ x: '20%', y: '80%' }}
            delay={1.5}
            duration={6}
          />
          <FloatingShape
            color="orange"
            size="md"
            position={{ x: '90%', y: '85%' }}
            delay={0.5}
            duration={7.5}
          />
        </>
      )}

      {/* Particle Field */}
      {showParticles && (
        <ParticleField count={particleCount} color="primary" />
      )}
    </div>
  );
}

// ==================== LOGIN PAGE BACKGROUND ====================
export function LoginBackground({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Animated Mesh Gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(at 30% 20%, rgba(59, 130, 246, 0.4) 0px, transparent 50%),
            radial-gradient(at 70% 60%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
            radial-gradient(at 40% 80%, rgba(236, 72, 153, 0.2) 0px, transparent 50%)
          `
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Floating Elements */}
      <FloatingShape color="blue" size="xl" position={{ x: '20%', y: '30%' }} duration={10} />
      <FloatingShape color="purple" size="lg" position={{ x: '80%', y: '20%' }} duration={8} delay={1} />
      <FloatingShape color="pink" size="md" position={{ x: '60%', y: '80%' }} duration={9} delay={2} />
      <FloatingShape color="blue" size="lg" position={{ x: '10%', y: '70%' }} duration={11} delay={0.5} />

      {/* Particles */}
      <ParticleField count={20} color="blue" minSize={3} maxSize={8} />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}

// ==================== DASHBOARD HEADER PARTICLES ====================
export function DashboardParticles({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <ParticleField count={15} color="primary" minSize={2} maxSize={4} />
    </div>
  );
}

// ==================== CELEBRATION PARTICLES ====================
interface CelebrationParticlesProps {
  isActive: boolean;
  color?: string;
  count?: number;
  origin?: { x: number; y: number };
}

export function CelebrationParticles({
  isActive,
  color = 'yellow',
  count = 20,
  origin = { x: 50, y: 50 }
}: CelebrationParticlesProps) {
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * 360,
      distance: 50 + Math.random() * 100,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.3
    }));
  }, [count]);

  if (!isActive) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${origin.x}%`,
        top: `${origin.y}%`
      }}
    >
      {particles.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const x = Math.cos(rad) * particle.distance;
        const y = Math.sin(rad) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            className={cn(
              'absolute rounded-full',
              color === 'yellow' && 'bg-yellow-400',
              color === 'orange' && 'bg-orange-500',
              color === 'green' && 'bg-green-500',
              color === 'blue' && 'bg-blue-500'
            )}
            style={{
              width: particle.size,
              height: particle.size
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 0.8,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
}

export {
  FloatingShape,
  ParticleField,
  MeshGradient,
  AnimatedBackground
};
