import { Camera, CameraOff, Volume2, VolumeX, Play, Square, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassPanel } from './GlassPanel';

interface VideoControlsProps {
  isCameraActive: boolean;
  isAudioEnabled: boolean;
  isTranslating: boolean;
  clipLength: number;
  autoSpeak: boolean;
  onToggleCamera: () => void;
  onToggleAudio: () => void;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  onClipLengthChange: (length: number) => void;
  onToggleAutoSpeak: () => void;
}

export function VideoControls({
  isCameraActive,
  isAudioEnabled,
  isTranslating,
  clipLength,
  autoSpeak,
  onToggleCamera,
  onToggleAudio,
  onStartTranslation,
  onStopTranslation,
  onClipLengthChange,
  onToggleAutoSpeak
}: VideoControlsProps) {
  return (
    <div className="space-y-4">
      {/* Primary controls */}
      <GlassPanel className="p-6">
        <div className="space-y-6">
          {/* Camera and Audio toggles */}
          <div className="grid grid-cols-2 gap-3">
            <ControlButton
              icon={isCameraActive ? <Camera size={20} /> : <CameraOff size={20} />}
              label={isCameraActive ? 'Stop Camera' : 'Start Camera'}
              active={isCameraActive}
              onClick={onToggleCamera}
              variant="primary"
            />
            <ControlButton
              icon={isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              label={isAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
              active={isAudioEnabled}
              onClick={onToggleAudio}
              variant="secondary"
              disabled={!isCameraActive}
            />
          </div>

          {/* Translation control */}
          <div>
            {isTranslating ? (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={onStopTranslation}
                className="w-full px-6 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'var(--status-error)',
                  color: 'var(--fog-100)',
                  boxShadow: '0 0 30px rgba(226, 139, 125, 0.3)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Square size={20} fill="currentColor" />
                  <span>Stop Translation</span>
                </div>
              </motion.button>
            ) : (
              <button
                onClick={onStartTranslation}
                disabled={!isCameraActive}
                className="w-full px-6 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isCameraActive 
                    ? 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)'
                    : 'var(--bg-panel)',
                  color: isCameraActive ? 'var(--bg-void)' : 'var(--fog-500)',
                  boxShadow: isCameraActive ? 'var(--glow-accent)' : 'none'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Play size={20} fill="currentColor" />
                  <span>Start Translation</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Advanced settings */}
      <GlassPanel className="p-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Settings2 size={16} style={{ color: 'var(--fog-400)' }} />
            <h4 className="text-sm font-medium" style={{ color: 'var(--fog-300)' }}>
              Translation Settings
            </h4>
          </div>

          {/* Clip length control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--fog-300)' }}>
                Clip Length
              </label>
              <span className="text-sm font-medium" style={{ color: 'var(--accent-seafoam)' }}>
                {clipLength}s
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={clipLength}
              onChange={(e) => onClipLengthChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-seafoam) 0%, var(--accent-seafoam) ${((clipLength - 2) / 8) * 100}%, var(--bg-panel) ${((clipLength - 2) / 8) * 100}%, var(--bg-panel) 100%)`
              }}
            />
            <p className="text-xs" style={{ color: 'var(--fog-500)' }}>
              Duration of video clips sent for translation
            </p>
          </div>

          {/* Auto-speak toggle */}
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--fog-300)' }}>
                Auto-Speak
              </label>
              <p className="text-xs" style={{ color: 'var(--fog-500)' }}>
                Automatically play AI voice output
              </p>
            </div>
            <button
              onClick={onToggleAutoSpeak}
              className="relative w-12 h-6 rounded-full transition-all duration-200"
              style={{
                background: autoSpeak ? 'var(--accent-seafoam)' : 'var(--bg-panel)',
                boxShadow: autoSpeak ? '0 0 20px rgba(125, 211, 192, 0.3)' : 'none'
              }}
              aria-label="Toggle auto-speak"
            >
              <motion.div
                animate={{ x: autoSpeak ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full"
                style={{ background: 'var(--fog-100)' }}
              />
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

function ControlButton({ icon, label, active, onClick, variant = 'secondary', disabled }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        background: active 
          ? variant === 'primary' 
            ? 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)'
            : 'var(--bg-elevated)'
          : 'var(--bg-elevated)',
        color: active && variant === 'primary' ? 'var(--bg-void)' : 'var(--fog-300)',
        border: active ? '1px solid var(--edge-light-subtle)' : '1px solid var(--glass-border)',
        boxShadow: active && variant === 'primary' ? '0 0 20px rgba(125, 211, 192, 0.2)' : 'none'
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
}