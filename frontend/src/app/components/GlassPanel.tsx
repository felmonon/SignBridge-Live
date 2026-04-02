import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  depth?: 'shallow' | 'medium' | 'deep';
  glow?: boolean;
  animated?: boolean;
}

export function GlassPanel({ 
  children, 
  className = '',
  depth = 'medium',
  glow = false,
  animated = true
}: GlassPanelProps) {
  const depthStyles = {
    shallow: {
      background: 'rgba(26, 31, 46, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-soft)'
    },
    medium: {
      background: 'rgba(26, 31, 46, 0.6)',
      backdropFilter: 'blur(16px)',
      border: '2px solid var(--glass-border)',
      boxShadow: 'var(--shadow-deep)'
    },
    deep: {
      background: 'rgba(26, 31, 46, 0.8)',
      backdropFilter: 'blur(24px)',
      border: '2px solid var(--edge-light-subtle)',
      boxShadow: '0 12px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }
  };

  const glowStyle = glow ? {
    boxShadow: `${depthStyles[depth].boxShadow}, var(--glow-strong)`
  } : {};

  const Component = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  } : {};

  return (
    <Component
      className={`relative rounded-3xl overflow-hidden ${className}`}
      style={{
        ...depthStyles[depth],
        ...glowStyle
      }}
      {...animationProps}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Top edge highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--glass-highlight) 50%, transparent)',
          opacity: 0.5
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}

export function DepthCard({ 
  children, 
  className = '',
  float = true
}: { 
  children: ReactNode; 
  className?: string;
  float?: boolean;
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ y: 0 }}
      animate={float ? { y: [-2, 2, -2] } : {}}
      transition={float ? { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      } : {}}
    >
      {/* Shadow layer - bottom */}
      <div 
        className="absolute inset-0 rounded-3xl translate-y-2"
        style={{
          background: 'rgba(10, 13, 20, 0.4)',
          filter: 'blur(12px)',
          zIndex: 0
        }}
      />

      {/* Mid layer */}
      <div 
        className="absolute inset-0 rounded-3xl translate-y-1"
        style={{
          background: 'rgba(20, 24, 33, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(125, 211, 192, 0.05)',
          zIndex: 1
        }}
      />

      {/* Top layer - main content */}
      <GlassPanel depth="deep" className="relative z-10">
        {children}
      </GlassPanel>
    </motion.div>
  );
}
