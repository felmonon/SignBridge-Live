import { motion } from 'motion/react';

export function LoadingState() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        background: 'radial-gradient(ellipse at center, var(--bg-deep) 0%, var(--bg-void) 50%, #000 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Animated logo */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 0, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-seafoam) 0%, var(--accent-seafoam-muted) 100%)',
              boxShadow: 'var(--glow-accent)'
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.5 16C6.67 16 6 15.33 6 14.5C6 13.67 6.67 13 7.5 13C8.33 13 9 13.67 9 14.5C9 15.33 8.33 16 7.5 16ZM12 13C11.17 13 10.5 12.33 10.5 11.5C10.5 10.67 11.17 10 12 10C12.83 10 13.5 10.67 13.5 11.5C13.5 12.33 12.83 13 12 13ZM16.5 16C15.67 16 15 15.33 15 14.5C15 13.67 15.67 13 16.5 13C17.33 13 18 13.67 18 14.5C18 15.33 17.33 16 16.5 16Z" 
                fill="var(--bg-void)" 
                fillOpacity="0.9"
              />
            </svg>
          </div>

          {/* Glow ring */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-2xl"
            style={{
              border: '2px solid var(--accent-seafoam)',
              filter: 'blur(8px)'
            }}
          />
        </motion.div>

        {/* Product name */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold" style={{ 
            color: 'var(--fog-100)',
            letterSpacing: '-0.02em'
          }}>
            SignBridge Live
          </h1>
          <p className="text-base" style={{ color: 'var(--fog-400)' }}>
            Initializing translation services...
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent-seafoam)' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
