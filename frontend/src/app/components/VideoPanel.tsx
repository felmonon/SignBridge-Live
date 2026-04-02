import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QuickTip } from './OnboardingHints';
import { CameraSetupIllustration } from './EmptyStateIllustrations';

interface VideoPanelProps {
  isActive: boolean;
  isTranslating: boolean;
  latencyMs: number | null;
  statusText: string;
  onStartCamera: () => void;
  onStopCamera: () => void;
  stream: MediaStream | null;
}

export function VideoPanel({
  isActive,
  isTranslating,
  latencyMs,
  statusText,
  onStartCamera,
  onStopCamera,
  stream,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Show tip when camera becomes active
  useEffect(() => {
    if (isActive && !isTranslating) {
      setShowTip(true);
      const timer = setTimeout(() => setShowTip(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowTip(false);
    }
  }, [isActive, isTranslating]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Video container */}
      <div 
        className="relative flex-1 rounded-3xl overflow-hidden group"
        style={{
          background: 'var(--bg-surface)',
          border: isTranslating ? '2px solid var(--accent-seafoam)' : '2px solid var(--glass-border)',
          boxShadow: isTranslating 
            ? 'var(--glow-strong), 0 8px 48px rgba(0, 0, 0, 0.4)' 
            : 'var(--shadow-soft), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          transition: 'all 0.5s var(--ease-smooth)'
        }}
      >
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Video element */}
        {isActive ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Live indicator overlay */}
            {isTranslating && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(10, 13, 20, 0.8)',
                  backdropFilter: 'blur(var(--blur-md))',
                  border: '1px solid var(--edge-light-subtle)'
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.6, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--status-live)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--fog-100)' }}>
                  LIVE TRANSLATING
                </span>
              </motion.div>
            )}

            {/* Camera active indicator */}
            {!isTranslating && (
              <div 
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(10, 13, 20, 0.8)',
                  backdropFilter: 'blur(var(--blur-md))',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent-seafoam)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--fog-300)' }}>
                  Camera Active
                </span>
              </div>
            )}

            {/* Quick tip overlay */}
            {!isTranslating && (
              <div className="absolute bottom-6 left-6 right-6">
                <QuickTip 
                  tip="Position yourself with good lighting and keep your hands visible in the frame"
                  isVisible={showTip}
                />
              </div>
            )}

            {/* Fullscreen button - appears on hover */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-6 right-6 w-10 h-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{
                background: 'rgba(10, 13, 20, 0.8)',
                backdropFilter: 'blur(var(--blur-md))',
                border: '1px solid var(--glass-border)',
                color: 'var(--fog-300)'
              }}
              aria-label="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>

            {/* Frame corners decoration */}
            <FrameCorners />
          </>
        ) : (
          <EmptyVideoState onStartCamera={onStartCamera} />
        )}
      </div>

      {/* Connection quality indicator */}
      {isActive && (
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ConnectionQuality quality="excellent" />
            <span className="text-sm" style={{ color: 'var(--fog-400)' }}>
              {statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--fog-400)' }}>
              Latency: {latencyMs ? `${latencyMs}ms` : 'Standby'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyVideoState({ onStartCamera }: { onStartCamera: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 text-center"
      >
        {/* Animated illustration */}
        <CameraSetupIllustration />

        {/* Text */}
        <div className="space-y-3">
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--fog-100)', letterSpacing: '-0.02em' }}>
            Camera Ready
          </h3>
          <p className="text-base max-w-md leading-relaxed" style={{ color: 'var(--fog-400)' }}>
            Start your camera to begin sign language translation. Make sure you're in a well-lit area with clear background.
          </p>
        </div>

        {/* Start button */}
        <motion.button
          onClick={onStartCamera}
          className="mt-2 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
            color: 'var(--bg-void)',
            boxShadow: 'var(--glow-accent)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <Camera size={20} />
            <span>Start Camera</span>
          </div>
        </motion.button>

        {/* Tips */}
        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold tracking-wider" style={{ color: 'var(--fog-500)' }}>
            BEST RESULTS
          </p>
          <ul className="text-sm space-y-2" style={{ color: 'var(--fog-400)' }}>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-seafoam)' }} />
              Position yourself clearly in frame
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-seafoam)' }} />
              Ensure good lighting on hands and face
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-seafoam)' }} />
              Minimize background movement
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

function FrameCorners() {
  const cornerStyle = {
    position: 'absolute' as const,
    width: '40px',
    height: '40px',
    borderColor: 'var(--edge-light-subtle)',
  };

  return (
    <>
      <div style={{ ...cornerStyle, top: '20px', left: '20px', borderTop: '2px solid', borderLeft: '2px solid' }} />
      <div style={{ ...cornerStyle, top: '20px', right: '20px', borderTop: '2px solid', borderRight: '2px solid' }} />
      <div style={{ ...cornerStyle, bottom: '20px', left: '20px', borderBottom: '2px solid', borderLeft: '2px solid' }} />
      <div style={{ ...cornerStyle, bottom: '20px', right: '20px', borderBottom: '2px solid', borderRight: '2px solid' }} />
    </>
  );
}

function ConnectionQuality({ quality }: { quality: 'excellent' | 'good' | 'poor' }) {
  const bars = 4;
  const activeColor = quality === 'excellent' ? 'var(--accent-seafoam)' : 
                      quality === 'good' ? 'var(--status-warning)' : 'var(--status-error)';
  const activeBars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : 1;

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-200"
          style={{
            height: `${(i + 1) * 3 + 4}px`,
            background: i < activeBars ? activeColor : 'var(--fog-600)'
          }}
        />
      ))}
    </div>
  );
}
