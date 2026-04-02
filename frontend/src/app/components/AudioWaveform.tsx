import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  particleCount?: number;
}

export function AudioWaveform({ 
  isActive, 
  barCount = 32,
  particleCount = 20 
}: AudioWaveformProps) {
  const [frequencies, setFrequencies] = useState<number[]>(
    Array(barCount).fill(0)
  );
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
  }>>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2
    }));
    setParticles(newParticles);
  }, [particleCount]);

  useEffect(() => {
    if (!isActive) {
      // Fade out frequencies
      setFrequencies(prev => prev.map(() => 0));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Simulate audio frequency data with smooth wave patterns
    const animate = () => {
      timeRef.current += 0.05;
      const time = timeRef.current;

      const newFrequencies = Array.from({ length: barCount }, (_, i) => {
        // Create multiple wave patterns for natural audio feel
        const wave1 = Math.sin(time + i * 0.3) * 0.5 + 0.5;
        const wave2 = Math.sin(time * 0.7 + i * 0.2) * 0.3 + 0.5;
        const wave3 = Math.sin(time * 1.3 - i * 0.15) * 0.2 + 0.5;
        
        // Combine waves with emphasis on mid-range
        const midEmphasis = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
        const combined = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * (0.3 + midEmphasis * 0.7);
        
        // Add random peaks for natural speech patterns
        const peak = Math.random() > 0.95 ? Math.random() * 0.3 : 0;
        
        return Math.min(combined + peak, 1);
      });

      setFrequencies(newFrequencies);
      
      // Animate particles
      setParticles(prev => 
        prev.map(p => {
          let newY = p.y - p.speed;
          let newOpacity = p.opacity;
          
          // Reset particle when it goes off screen
          if (newY < -5) {
            newY = 105;
            newOpacity = Math.random() * 0.3 + 0.1;
          }
          
          return { ...p, y: newY, opacity: newOpacity };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, barCount]);

  return (
    <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'var(--accent-seafoam)',
              opacity: isActive ? particle.opacity : 0,
              transition: 'opacity 0.5s ease-out',
              boxShadow: `0 0 ${particle.size * 4}px var(--accent-seafoam)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Frequency bars */}
      <div className="relative flex items-center justify-center gap-1 h-full w-full px-4">
        {frequencies.map((freq, i) => {
          const height = 4 + freq * 60; // Min 4px, max 64px
          const delay = i * 0.01;
          
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${height}px`,
                background: `linear-gradient(to top, var(--accent-seafoam), var(--accent-seafoam-bright))`,
                boxShadow: freq > 0.6 
                  ? `0 0 ${freq * 12}px var(--accent-seafoam)` 
                  : 'none',
                opacity: isActive ? 0.7 + freq * 0.3 : 0,
                transition: `height 0.1s ease-out ${delay}s, opacity 0.3s ease-out`,
                maxWidth: '6px'
              }}
            />
          );
        })}
      </div>

      {/* Center glow effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--accent-seafoam-glow) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
