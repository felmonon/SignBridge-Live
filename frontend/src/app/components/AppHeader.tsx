import { Settings, User } from 'lucide-react';

interface AppHeaderProps {
  isCameraActive: boolean;
  isTranslating: boolean;
  isAudioEnabled: boolean;
  providers: {
    gemini: boolean;
    openai_tts: boolean;
  };
  statusMessage: string;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export function AppHeader({
  isCameraActive,
  isTranslating,
  isAudioEnabled,
  providers,
  statusMessage,
  onSettingsClick,
  onProfileClick,
}: AppHeaderProps) {
  return (
    <header className="relative border-b" style={{ 
      borderColor: 'var(--glass-border)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--blur-xl))'
    }}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
      
      <div className="flex items-center justify-between px-8 py-5 relative z-10 gap-8">
        {/* Product branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
                  boxShadow: 'var(--glow-accent)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.5 16C6.67 16 6 15.33 6 14.5C6 13.67 6.67 13 7.5 13C8.33 13 9 13.67 9 14.5C9 15.33 8.33 16 7.5 16ZM12 13C11.17 13 10.5 12.33 10.5 11.5C10.5 10.67 11.17 10 12 10C12.83 10 13.5 10.67 13.5 11.5C13.5 12.33 12.83 13 12 13ZM16.5 16C15.67 16 15 15.33 15 14.5C15 13.67 15.67 13 16.5 13C17.33 13 18 13.67 18 14.5C18 15.33 17.33 16 16.5 16Z" 
                    fill="var(--bg-void)" 
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl tracking-tight" style={{ color: 'var(--fog-100)' }}>
                SignBridge Live
              </h1>
              <p className="text-xs" style={{ color: 'var(--fog-400)' }}>
                Real-time Sign Language Translation
              </p>
            </div>
          </div>
        </div>

        {/* Status indicators and profile */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Provider status pills */}
          <div className="hidden xl:flex items-center gap-3">
            <StatusPill
              label={isCameraActive ? 'Camera Connected' : 'Camera Offline'}
              color={isCameraActive ? 'var(--accent-seafoam)' : 'var(--status-amber)'}
            />
            <StatusPill
              label={isTranslating ? 'Live Translation' : 'Idle'}
              color={isTranslating ? 'var(--accent-seafoam)' : 'var(--fog-500)'}
            />
            <StatusPill
              label={providers.gemini ? 'Gemini Online' : 'Gemini Offline'}
              color={providers.gemini ? 'var(--accent-seafoam)' : 'var(--status-error)'}
            />
            <StatusPill 
              label={providers.openai_tts ? (isAudioEnabled ? 'Voice Armed' : 'Voice Available') : 'Voice Offline'}
              color={
                providers.openai_tts
                  ? isAudioEnabled
                    ? 'var(--accent-seafoam)'
                    : 'var(--status-amber)'
                  : 'var(--status-error)'
              }
            />
          </div>

          <div className="hidden md:block max-w-[320px] truncate text-sm" style={{ color: 'var(--fog-400)' }}>
            {statusMessage}
          </div>

          {/* Divider */}
          <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onSettingsClick}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ 
                background: 'var(--bg-elevated)',
                color: 'var(--fog-300)'
              }}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={onProfileClick}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ 
                background: 'var(--bg-elevated)',
                color: 'var(--fog-300)'
              }}
              aria-label="Profile"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface StatusPillProps {
  label: string;
  color: string;
}

function StatusPill({ label, color }: StatusPillProps) {
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-200"
      style={{ 
        background: `${color}15`,
        border: `1px solid ${color}30`,
        color: color
      }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
