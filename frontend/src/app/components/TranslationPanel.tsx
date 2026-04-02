import { motion } from 'motion/react';
import { Volume2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AudioWaveform } from './AudioWaveform';
import { TranslationWaitingIllustration, NoHistoryIllustration } from './EmptyStateIllustrations';
import { GlassPanel, DepthCard } from './GlassPanel';

export interface Translation {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  isSpeaking?: boolean;
}

interface TranslationPanelProps {
  currentTranslation: Translation | null;
  history: Translation[];
  isSpeaking: boolean;
  statusText: string;
  onReplay: (id: string) => void;
}

export function TranslationPanel({ 
  currentTranslation, 
  history, 
  isSpeaking,
  statusText,
  onReplay 
}: TranslationPanelProps) {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Current translation - Hero element */}
      <CurrentTranslation 
        translation={currentTranslation} 
        isSpeaking={isSpeaking}
        statusText={statusText}
        onReplay={() => currentTranslation && onReplay(currentTranslation.id)}
      />

      {/* Transcript history */}
      <TranscriptHistory history={history} onReplay={onReplay} />
    </div>
  );
}

function CurrentTranslation({ 
  translation, 
  isSpeaking,
  statusText,
  onReplay 
}: { 
  translation: Translation | null; 
  isSpeaking: boolean;
  statusText: string;
  onReplay: () => void;
}) {
  return (
    <DepthCard className="min-h-[320px]">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--accent-seafoam-glow)',
                border: '1px solid var(--edge-light-subtle)',
                boxShadow: '0 0 20px var(--accent-seafoam-glow)'
              }}
            >
              <Sparkles size={22} style={{ color: 'var(--accent-seafoam)' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--fog-100)', letterSpacing: '-0.01em' }}>
                Now Interpreting
              </h3>
              <p className="text-xs" style={{ color: 'var(--fog-500)' }}>
                AI-powered English translation
              </p>
            </div>
          </div>

          {translation && (
            <button
              onClick={onReplay}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-[-15deg]"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--fog-300)',
                border: '1px solid var(--glass-border)'
              }}
              aria-label="Replay"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        {/* Translation content */}
        {translation ? (
          <motion.div
            key={translation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Main text - DRAMATIC SIZE */}
            <div className="relative">
              <p 
                className="leading-tight"
                style={{ 
                  color: 'var(--fog-100)',
                  fontSize: '2.5rem',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}
              >
                {translation.text}
              </p>
            </div>

            {/* Audio Waveform Visualization */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="py-4 px-6 rounded-2xl"
                style={{
                  background: 'rgba(125, 211, 192, 0.05)',
                  border: '1px solid var(--edge-light-subtle)'
                }}
              >
                <AudioWaveform isActive={isSpeaking} barCount={40} particleCount={25} />
              </motion.div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <ConfidenceIndicator confidence={translation.confidence} />
              <div className="flex items-center gap-3">
                {isSpeaking && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{
                      background: 'var(--accent-seafoam-glow)',
                      border: '1px solid var(--edge-light-subtle)'
                    }}
                  >
                    <Volume2 size={16} style={{ color: 'var(--accent-seafoam)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-seafoam)' }}>
                      Speaking
                    </span>
                  </motion.div>
                )}
                <span className="text-sm font-medium" style={{ color: 'var(--fog-400)' }}>
                  {formatTime(translation.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <EmptyTranslationState statusText={statusText} />
        )}
      </div>
    </DepthCard>
  );
}

function EmptyTranslationState({ statusText }: { statusText: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <TranslationWaitingIllustration />
      <h4 className="text-lg mb-2" style={{ color: 'var(--fog-300)' }}>
        Waiting for sign language...
      </h4>
      <p className="text-sm max-w-sm" style={{ color: 'var(--fog-500)' }}>
        {statusText || 'Start translating to see real-time interpretation appear here'}
      </p>
    </div>
  );
}

function TranscriptHistory({ history, onReplay }: { history: Translation[]; onReplay: (id: string) => void }) {
  return (
    <GlassPanel depth="medium" className="flex-1 p-6 overflow-hidden flex flex-col">
      {/* Noise texture overlay for richness */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-base font-semibold" style={{ color: 'var(--fog-100)', letterSpacing: '-0.01em' }}>
          Conversation History
        </h3>
        <span className="text-sm px-3 py-1.5 rounded-full font-medium" style={{ 
          background: 'var(--bg-elevated)',
          color: 'var(--fog-400)',
          border: '1px solid var(--glass-border)'
        }}>
          {history.length} {history.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Scrollable transcript */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 relative z-10" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--fog-600) transparent'
      }}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
            <NoHistoryIllustration />
            <p className="text-sm max-w-xs" style={{ color: 'var(--fog-500)' }}>
              Your conversation history will appear here as you translate
            </p>
          </div>
        ) : (
          history.map((item) => (
            <TranscriptItem key={item.id} translation={item} onReplay={onReplay} />
          ))
        )}
      </div>
    </GlassPanel>
  );
}

function TranscriptItem({ translation, onReplay }: { translation: Translation; onReplay: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group p-4 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        background: isHovered ? 'var(--bg-elevated)' : 'transparent',
        border: '1px solid transparent',
        borderColor: isHovered ? 'var(--glass-border)' : 'transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-base leading-relaxed" style={{ color: 'var(--fog-200)' }}>
            {translation.text}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--fog-500)' }}>
            <span>{formatTime(translation.timestamp)}</span>
            <span>•</span>
            <span>{Math.round(translation.confidence * 100)}% confidence</span>
          </div>
        </div>

        <button
          onClick={() => onReplay(translation.id)}
          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--fog-400)',
            border: '1px solid var(--glass-border)'
          }}
          aria-label="Replay this translation"
        >
          <Volume2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const color = confidence >= 0.8 ? 'var(--accent-seafoam)' :
                confidence >= 0.6 ? 'var(--status-warning)' :
                'var(--status-error)';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color }}>
          {percentage}%
        </span>
      </div>
      <span className="text-xs" style={{ color: 'var(--fog-500)' }}>
        confidence
      </span>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}
