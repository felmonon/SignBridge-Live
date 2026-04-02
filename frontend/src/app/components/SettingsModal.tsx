import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Volume2, Video, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipLength: number;
  autoSpeak: boolean;
  onClipLengthChange: (length: number) => void;
  onToggleAutoSpeak: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  clipLength,
  autoSpeak,
  onClipLengthChange,
  onToggleAutoSpeak
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 13, 20, 0.85)',
            backdropFilter: 'blur(var(--blur-md))'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full rounded-3xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-deep)'
            }}
          >
            {/* Header */}
            <div 
              className="px-8 py-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'var(--accent-seafoam-glow)',
                    border: '1px solid var(--edge-light-subtle)'
                  }}
                >
                  <Sliders size={20} style={{ color: 'var(--accent-seafoam)' }} />
                </div>
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--fog-100)' }}>
                  Settings
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--fog-400)'
                }}
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Translation Settings */}
              <SettingSection
                icon={<Sparkles size={20} />}
                title="Translation"
                description="Configure how sign language is interpreted"
              >
                <div className="space-y-6">
                  {/* Clip length */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium" style={{ color: 'var(--fog-200)' }}>
                        Video Clip Duration
                      </label>
                      <span className="text-base font-semibold px-3 py-1 rounded-lg" style={{ 
                        background: 'var(--accent-seafoam-glow)',
                        color: 'var(--accent-seafoam)'
                      }}>
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
                    <p className="text-sm" style={{ color: 'var(--fog-500)' }}>
                      Length of video segments sent to Gemini for translation. Shorter clips provide faster results but may miss context.
                    </p>
                  </div>

                  {/* Model info */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--fog-400)' }}>
                      <strong style={{ color: 'var(--fog-200)' }}>Translation Provider:</strong> Google Gemini AI
                    </p>
                    <p className="text-sm" style={{ color: 'var(--fog-400)' }}>
                      Advanced multimodal model trained on sign language recognition
                    </p>
                  </div>
                </div>
              </SettingSection>

              {/* Voice Settings */}
              <SettingSection
                icon={<Volume2 size={20} />}
                title="Voice Output"
                description="Control AI-generated speech playback"
              >
                <div className="space-y-6">
                  {/* Auto-speak toggle */}
                  <div 
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <div className="space-y-1">
                      <label className="text-base font-medium" style={{ color: 'var(--fog-200)' }}>
                        Automatic Playback
                      </label>
                      <p className="text-sm" style={{ color: 'var(--fog-500)' }}>
                        Automatically speak translations using AI voice
                      </p>
                    </div>
                    <button
                      onClick={onToggleAutoSpeak}
                      className="relative w-14 h-7 rounded-full transition-all duration-200"
                      style={{
                        background: autoSpeak ? 'var(--accent-seafoam)' : 'var(--bg-panel)',
                        boxShadow: autoSpeak ? '0 0 20px rgba(125, 211, 192, 0.3)' : 'none'
                      }}
                      aria-label="Toggle auto-speak"
                    >
                      <motion.div
                        animate={{ x: autoSpeak ? 30 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 rounded-full"
                        style={{ background: 'var(--fog-100)' }}
                      />
                    </button>
                  </div>

                  {/* Voice provider info */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--fog-400)' }}>
                      <strong style={{ color: 'var(--fog-200)' }}>Voice Provider:</strong> OpenAI Text-to-Speech
                    </p>
                    <p className="text-sm" style={{ color: 'var(--fog-400)' }}>
                      Natural-sounding voices powered by advanced neural audio models
                    </p>
                  </div>
                </div>
              </SettingSection>

              {/* Video Settings */}
              <SettingSection
                icon={<Video size={20} />}
                title="Video Input"
                description="Camera and video capture preferences"
              >
                <div 
                  className="p-4 rounded-xl space-y-2"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--fog-400)' }}>
                    <strong style={{ color: 'var(--fog-200)' }}>Resolution:</strong> 1080p (1920×1080)
                  </p>
                  <p className="text-sm" style={{ color: 'var(--fog-400)' }}>
                    <strong style={{ color: 'var(--fog-200)' }}>Frame Rate:</strong> 30 fps
                  </p>
                  <p className="text-sm" style={{ color: 'var(--fog-400)' }}>
                    <strong style={{ color: 'var(--fog-200)' }}>Processing:</strong> Local (browser-based)
                  </p>
                </div>
              </SettingSection>
            </div>

            {/* Footer */}
            <div 
              className="px-8 py-6 border-t flex items-center justify-between"
              style={{ 
                borderColor: 'var(--glass-border)',
                background: 'var(--bg-surface)'
              }}
            >
              <p className="text-sm" style={{ color: 'var(--fog-500)' }}>
                Changes are saved automatically
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
                  color: 'var(--bg-void)',
                  boxShadow: 'var(--glow-accent)'
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SettingSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({ icon, title, description, children }: SettingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div style={{ color: 'var(--accent-seafoam)', marginTop: '2px' }}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--fog-100)' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--fog-500)' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="pl-8">
        {children}
      </div>
    </div>
  );
}
