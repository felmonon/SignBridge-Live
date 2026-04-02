import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

const HINTS = [
  {
    title: "Optimal Lighting",
    description: "Position yourself facing a light source for best hand visibility"
  },
  {
    title: "Frame Positioning",
    description: "Keep your hands and face within the camera frame at all times"
  },
  {
    title: "Clear Background",
    description: "A simple, uncluttered background improves translation accuracy"
  },
  {
    title: "Natural Signing",
    description: "Sign at your natural pace - the AI adapts to your rhythm"
  }
];

interface OnboardingHintsProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function OnboardingHints({ isVisible, onDismiss }: OnboardingHintsProps) {
  const [currentHint, setCurrentHint] = useState(0);

  const nextHint = () => {
    if (currentHint < HINTS.length - 1) {
      setCurrentHint(currentHint + 1);
    } else {
      onDismiss();
    }
  };

  const skipAll = () => {
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 13, 20, 0.8)',
            backdropFilter: 'blur(var(--blur-md))'
          }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full p-10 rounded-3xl relative"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-deep)'
            }}
          >
            {/* Close button */}
            <button
              onClick={skipAll}
              className="absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--fog-400)'
              }}
              aria-label="Close hints"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'var(--accent-seafoam-glow)',
                  border: '1px solid var(--edge-light-subtle)'
                }}
              >
                <Lightbulb size={32} style={{ color: 'var(--accent-seafoam)' }} />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4 mb-8">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--fog-100)' }}>
                {HINTS[currentHint].title}
              </h3>
              <p className="text-base" style={{ color: 'var(--fog-400)' }}>
                {HINTS[currentHint].description}
              </p>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {HINTS.map((_, index) => (
                <div
                  key={index}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: index === currentHint ? '32px' : '8px',
                    background: index === currentHint ? 'var(--accent-seafoam)' : 'var(--bg-panel)'
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={skipAll}
                className="flex-1 px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--fog-300)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                Skip
              </button>
              <button
                onClick={nextHint}
                className="flex-1 px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
                  color: 'var(--bg-void)',
                  boxShadow: 'var(--glow-accent)'
                }}
              >
                {currentHint === HINTS.length - 1 ? 'Got it' : 'Next'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function QuickTip({ tip, isVisible }: { tip: string; isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="px-4 py-3 rounded-xl flex items-start gap-3"
          style={{
            background: 'var(--accent-seafoam-glow)',
            border: '1px solid var(--edge-light-subtle)'
          }}
        >
          <Lightbulb size={18} style={{ color: 'var(--accent-seafoam)', flexShrink: 0, marginTop: '2px' }} />
          <p className="text-sm" style={{ color: 'var(--fog-200)' }}>
            {tip}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
