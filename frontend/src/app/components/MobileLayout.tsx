import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Video } from 'lucide-react';
import { VideoPanel } from './VideoPanel';
import { VideoControls } from './VideoControls';
import { TranslationPanel, Translation } from './TranslationPanel';

interface MobileLayoutProps {
  isCameraActive: boolean;
  isAudioEnabled: boolean;
  isTranslating: boolean;
  clipLength: number;
  autoSpeak: boolean;
  stream: MediaStream | null;
  currentTranslation: Translation | null;
  history: Translation[];
  isSpeaking: boolean;
  statusMessage: string;
  latencyMs: number | null;
  onToggleCamera: () => void;
  onToggleAudio: () => void;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  onClipLengthChange: (length: number) => void;
  onToggleAutoSpeak: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onReplay: (id: string) => void;
}

export function MobileLayout({
  isCameraActive,
  isAudioEnabled,
  isTranslating,
  clipLength,
  autoSpeak,
  stream,
  currentTranslation,
  history,
  isSpeaking,
  statusMessage,
  latencyMs,
  onToggleCamera,
  onToggleAudio,
  onStartTranslation,
  onStopTranslation,
  onClipLengthChange,
  onToggleAutoSpeak,
  onStartCamera,
  onStopCamera,
  onReplay
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'translation'>('video');

  return (
    <div className="flex flex-col h-full">
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'video' ? (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col gap-4 p-4"
            >
              <div className="flex-1">
                <VideoPanel
                  isActive={isCameraActive}
                  isTranslating={isTranslating}
                  latencyMs={latencyMs}
                  statusText={statusMessage}
                  onStartCamera={onStartCamera}
                  onStopCamera={onStopCamera}
                  stream={stream}
                />
              </div>
              
              <VideoControls
                isCameraActive={isCameraActive}
                isAudioEnabled={isAudioEnabled}
                isTranslating={isTranslating}
                clipLength={clipLength}
                autoSpeak={autoSpeak}
                onToggleCamera={onToggleCamera}
                onToggleAudio={onToggleAudio}
                onStartTranslation={onStartTranslation}
                onStopTranslation={onStopTranslation}
                onClipLengthChange={onClipLengthChange}
                onToggleAutoSpeak={onToggleAutoSpeak}
              />
            </motion.div>
          ) : (
            <motion.div
              key="translation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full p-4"
            >
              <TranslationPanel
                currentTranslation={currentTranslation}
                history={history}
                isSpeaking={isSpeaking}
                statusText={statusMessage}
                onReplay={onReplay}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tab navigation */}
      <div 
        className="p-4 border-t"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-lg))',
          borderColor: 'var(--glass-border)'
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <TabButton
            icon={<Video size={20} />}
            label="Camera"
            isActive={activeTab === 'video'}
            onClick={() => setActiveTab('video')}
          />
          <TabButton
            icon={<MessageSquare size={20} />}
            label="Translation"
            isActive={activeTab === 'translation'}
            badge={history.length > 0 ? history.length : undefined}
            onClick={() => setActiveTab('translation')}
          />
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

function TabButton({ icon, label, isActive, badge, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-3 rounded-xl transition-all duration-200"
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)'
          : 'var(--bg-elevated)',
        color: isActive ? 'var(--bg-void)' : 'var(--fog-300)',
        border: isActive ? '1px solid var(--edge-light-subtle)' : '1px solid var(--glass-border)',
        boxShadow: isActive ? 'var(--glow-accent)' : 'none'
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      
      {badge !== undefined && badge > 0 && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{
            background: 'var(--status-error)',
            color: 'var(--fog-100)',
            border: '2px solid var(--bg-surface)'
          }}
        >
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </button>
  );
}
