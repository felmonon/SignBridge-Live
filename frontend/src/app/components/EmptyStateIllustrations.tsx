import { motion } from 'motion/react';

export function CameraSetupIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-32 h-32"
    >
      {/* Outer ring */}
      <motion.circle
        cx="100"
        cy="100"
        r="80"
        stroke="var(--glass-border)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Middle ring with pulse */}
      <motion.circle
        cx="100"
        cy="100"
        r="60"
        stroke="var(--accent-seafoam)"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1, 0.8],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Camera icon in center */}
      <g transform="translate(100, 100)">
        {/* Camera body */}
        <motion.rect
          x="-28"
          y="-16"
          width="56"
          height="40"
          rx="6"
          fill="var(--bg-elevated)"
          stroke="var(--accent-seafoam)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        />

        {/* Lens */}
        <motion.circle
          cx="0"
          cy="4"
          r="12"
          fill="var(--bg-surface)"
          stroke="var(--accent-seafoam)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4, type: "spring" }}
        />

        {/* Lens inner */}
        <motion.circle
          cx="0"
          cy="4"
          r="6"
          fill="var(--accent-seafoam-glow)"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            delay: 0.9,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Viewfinder */}
        <motion.rect
          x="10"
          y="-12"
          width="12"
          height="8"
          rx="2"
          fill="var(--bg-surface)"
          stroke="var(--accent-seafoam)"
          strokeWidth="1.5"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: -12, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4, type: "spring" }}
        />
      </g>

      {/* Corner brackets - animated */}
      {[
        { x: 40, y: 40, rotate: 0 },
        { x: 160, y: 40, rotate: 90 },
        { x: 160, y: 160, rotate: 180 },
        { x: 40, y: 160, rotate: 270 }
      ].map((corner, i) => (
        <g key={i} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rotate})`}>
          <motion.path
            d="M -10 0 L 0 0 L 0 -10"
            stroke="var(--edge-light-subtle)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
          />
        </g>
      ))}

      {/* Floating dots */}
      {[30, 50, 70].map((delay, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={100 + (i - 1) * 40}
          cy="30"
          r="3"
          fill="var(--accent-seafoam)"
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: [30, 20, 30],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            delay: delay / 100,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </svg>
  );
}

export function TranslationWaitingIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-28 h-28"
    >
      {/* Background circles */}
      <motion.circle
        cx="100"
        cy="100"
        r="70"
        stroke="var(--glass-border)"
        strokeWidth="1.5"
        fill="none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.1, 0.5],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Hand gesture representation */}
      <g transform="translate(100, 100)">
        {/* Palm */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="20"
          ry="28"
          fill="var(--bg-elevated)"
          stroke="var(--accent-seafoam)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        />

        {/* Fingers */}
        {[-15, -5, 5, 15].map((x, i) => (
          <motion.rect
            key={i}
            x={x - 2}
            y="-35"
            width="4"
            height="18"
            rx="2"
            fill="var(--accent-seafoam)"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ 
              delay: 0.4 + i * 0.1,
              type: "spring",
              stiffness: 150
            }}
          />
        ))}

        {/* Sparkle effects */}
        {[
          { x: -35, y: -20, delay: 0.5 },
          { x: 35, y: -25, delay: 0.7 },
          { x: -30, y: 15, delay: 0.9 },
          { x: 32, y: 18, delay: 1.1 }
        ].map((sparkle, i) => (
          <motion.g
            key={`sparkle-${i}`}
            transform={`translate(${sparkle.x}, ${sparkle.y})`}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              delay: sparkle.delay,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
              fill="var(--accent-seafoam)"
            />
          </motion.g>
        ))}
      </g>

      {/* Orbiting particles */}
      {[0, 120, 240].map((angle, i) => (
        <motion.circle
          key={`orbit-${i}`}
          cx="100"
          cy="100"
          r="4"
          fill="var(--accent-seafoam-muted)"
          initial={{ opacity: 0.5 }}
          animate={{ 
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            delay: i * 0.4,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            offsetPath: 'path("M 100 100 m -50 0 a 50 50 0 1 1 100 0 a 50 50 0 1 1 -100 0")',
            offsetDistance: `${angle}%`
          }}
        />
      ))}
    </svg>
  );
}

export function NoHistoryIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24"
    >
      {/* Document/transcript representation */}
      <motion.rect
        x="60"
        y="40"
        width="80"
        height="120"
        rx="8"
        fill="var(--bg-elevated)"
        stroke="var(--glass-border)"
        strokeWidth="2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 40, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      />

      {/* Lines representing text */}
      {[60, 80, 100, 120, 140].map((y, i) => (
        <motion.line
          key={i}
          x1="75"
          y1={y}
          x2={i === 4 ? "110" : "125"}
          y2={y}
          stroke="var(--fog-500)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
        />
      ))}

      {/* Floating message bubbles */}
      <motion.circle
        cx="45"
        cy="90"
        r="8"
        fill="var(--accent-seafoam-glow)"
        stroke="var(--accent-seafoam)"
        strokeWidth="1.5"
        initial={{ x: -10, opacity: 0 }}
        animate={{ 
          x: [0, -5, 0],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          delay: 0.8,
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.circle
        cx="155"
        cy="110"
        r="6"
        fill="var(--accent-seafoam-glow)"
        stroke="var(--accent-seafoam)"
        strokeWidth="1.5"
        initial={{ x: 10, opacity: 0 }}
        animate={{ 
          x: [0, 5, 0],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          delay: 1.2,
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Shimmer effect */}
      <motion.line
        x1="50"
        y1="30"
        x2="150"
        y2="170"
        stroke="url(#shimmer-gradient)"
        strokeWidth="60"
        strokeLinecap="round"
        opacity="0.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <defs>
        <linearGradient id="shimmer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--accent-seafoam)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}
