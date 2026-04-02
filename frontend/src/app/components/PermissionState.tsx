import { motion } from 'motion/react';
import { Camera, AlertCircle } from 'lucide-react';

interface PermissionStateProps {
  onRequestPermission: () => void;
}

export function PermissionState({ onRequestPermission }: PermissionStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8"
      style={{ 
        background: 'radial-gradient(ellipse at center, var(--bg-deep) 0%, var(--bg-void) 50%, #000 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full p-12 rounded-3xl text-center"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-xl))',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-deep)'
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <Camera size={48} style={{ color: 'var(--accent-seafoam)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-10">
          <h2 className="text-4xl font-semibold" style={{ 
            color: 'var(--fog-100)',
            letterSpacing: '-0.02em'
          }}>
            Camera Access Required
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--fog-400)' }}>
            SignBridge Live needs access to your camera to translate sign language in real-time.
            Your video is processed locally and never stored or shared.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onRequestPermission}
          className="px-8 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
            color: 'var(--bg-void)',
            boxShadow: 'var(--glow-accent)'
          }}
        >
          Grant Camera Access
        </button>

        {/* Privacy note */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-start gap-3 text-left max-w-lg mx-auto">
            <AlertCircle size={20} style={{ color: 'var(--accent-seafoam)', flexShrink: 0, marginTop: '2px' }} />
            <div className="text-sm" style={{ color: 'var(--fog-500)' }}>
              <strong style={{ color: 'var(--fog-300)' }}>Privacy First:</strong> All video processing happens
              in your browser. We use AI providers (Gemini for translation, OpenAI for voice) but your video 
              stream is never recorded or transmitted to our servers.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8"
      style={{ 
        background: 'radial-gradient(ellipse at center, var(--bg-deep) 0%, var(--bg-void) 50%, #000 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full p-12 rounded-3xl text-center"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-xl))',
          border: '1px solid var(--status-error)',
          boxShadow: '0 0 40px rgba(226, 139, 125, 0.2)'
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(226, 139, 125, 0.1)',
              border: '1px solid var(--status-error)'
            }}
          >
            <AlertCircle size={48} style={{ color: 'var(--status-error)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-10">
          <h2 className="text-4xl font-semibold" style={{ 
            color: 'var(--fog-100)',
            letterSpacing: '-0.02em'
          }}>
            Unable to Access Camera
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--fog-400)' }}>
            {error}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onRetry}
          className="px-8 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--fog-100)',
            border: '1px solid var(--glass-border)'
          }}
        >
          Try Again
        </button>

        {/* Help text */}
        <div className="mt-8">
          <p className="text-sm" style={{ color: 'var(--fog-500)' }}>
            Check your browser settings to ensure camera permissions are enabled for this site.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
