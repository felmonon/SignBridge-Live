import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface SystemNotificationProps {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
}

export function SystemNotification({ message, type, isVisible, onClose }: SystemNotificationProps) {
  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    success: 'var(--accent-seafoam)',
    error: 'var(--status-error)',
    info: 'var(--status-amber)'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-8 left-1/2 z-50 min-w-[400px] max-w-[600px]"
        >
          <div
            className="px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl"
            style={{
              background: 'var(--bg-elevated)',
              backdropFilter: 'blur(var(--blur-xl))',
              border: `1px solid ${colors[type]}`,
              boxShadow: `0 8px 32px ${colors[type]}40`
            }}
          >
            <div style={{ color: colors[type] }}>
              {icons[type]}
            </div>
            
            <p className="flex-1 text-base" style={{ color: 'var(--fog-100)' }}>
              {message}
            </p>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--fog-400)'
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
