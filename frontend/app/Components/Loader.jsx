'use client'

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'

/**
 * Geometric Network Node Configuration
 * Coordinates designed on a 240x240 responsive viewBox grid.
 * - Center Node represents the Local Core Hub.
 * - Satellite Nodes represent Identity, Database, Gateway, and Services.
 */
const nodes = [
  { id: 'core', x: 120, y: 120, label: 'Core Server', activeAt: 0, isCore: true },
  { id: 'auth', x: 50, y: 70, label: 'Identity Node', activeAt: 15, isCore: false },
  { id: 'db', x: 190, y: 70, label: 'Storage Node', activeAt: 32, isCore: false },
  { id: 'gate', x: 50, y: 170, label: 'Security Gateway', activeAt: 48, isCore: false },
  { id: 'sync', x: 190, y: 170, label: 'Sync Network', activeAt: 65, isCore: false },
]

/**
 * Connection Lines Mesh Map
 * Defines paths connecting nodes and the progress threshold required to activate.
 */
const connections = [
  // Core connections
  { from: [120, 120], to: [50, 70], activeAt: 15 },
  { from: [120, 120], to: [190, 70], activeAt: 32 },
  { from: [120, 120], to: [50, 170], activeAt: 48 },
  { from: [120, 120], to: [190, 170], activeAt: 65 },
  // Outer perimeter mesh
  { from: [50, 70], to: [190, 70], activeAt: 32 },
  { from: [190, 70], to: [190, 170], activeAt: 65 },
  { from: [190, 170], to: [50, 170], activeAt: 65 },
  { from: [50, 170], to: [50, 70], activeAt: 48 },
]

/**
 * Static Floating Particles
 * Predetermined coordinate system to prevent hydration mismatches in Next.js.
 */
const ambientParticles = [
  { size: 2.0, x: 12, y: 18, duration: 22, delay: -2 },
  { size: 3.5, x: 82, y: 14, duration: 28, delay: -5 },
  { size: 1.5, x: 44, y: 82, duration: 24, delay: -8 },
  { size: 2.5, x: 72, y: 68, duration: 32, delay: -12 },
  { size: 2.0, x: 28, y: 52, duration: 20, delay: -4 },
  { size: 3.0, x: 86, y: 78, duration: 26, delay: -10 },
  { size: 1.2, x: 8, y: 84, duration: 23, delay: -1 },
  { size: 2.2, x: 92, y: 38, duration: 25, delay: -6 }
]

const Loader = ({ currentProgress = 0, currentStep = '', completionState = false }) => {
  const shouldReduceMotion = useReducedMotion()

  // Elegant exit animation values (supports reduced motion accessibility standards)
  const exitAnimation = shouldReduceMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        scale: 0.96,
        filter: 'blur(12px)',
        transition: {
          duration: 0.8,
          ease: [0.25, 1, 0.5, 1] // Custom premium cubic-bezier curve
        }
      }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={exitAnimation}
      className="fixed inset-0 z-50 bg-[#080a10] text-[#f3f4f6] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
      role="progressbar"
      aria-valuenow={currentProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Initializing ChatYou Secure Network"
    >
      {/* 1. Ambient Background Overlay & Floating Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-dark)/0.08,transparent_55%)] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      {!shouldReduceMotion && ambientParticles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full bg-primary-light/10 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, 10, 0],
            opacity: [0.1, 0.35, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 2. Primary Network Visual Block */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
        
        {/* SVG Grid Overlay */}
        <svg 
          viewBox="0 0 240 240" 
          className="w-full h-full drop-shadow-[0_0_24px_rgba(14,165,233,0.15)]"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="loader-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path 
                d="M 20 0 L 0 0 0 20" 
                fill="none" 
                stroke="rgba(255,255,255,0.06)" 
                strokeWidth="0.5" 
              />
            </pattern>
            {/* Glow Filter for Nodes */}
            <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix type="matrix" values="
                1 0 0 0   0.05
                0 1 0 0   0.64
                0 0 1 0   0.9
                0 0 0 1.5 0
              " />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#loader-grid)" opacity="0.4" />

          {/* Mesh Connections */}
          {connections.map((conn, idx) => {
            const isActive = currentProgress >= conn.activeAt
            return (
              <g key={idx}>
                {/* Background Link Line (Subtle structural layout outline) */}
                <line
                  x1={conn.from[0]}
                  y1={conn.from[1]}
                  x2={conn.to[0]}
                  y2={conn.to[1]}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />

                {/* Active Dynamic Line */}
                <motion.line
                  x1={conn.from[0]}
                  y1={conn.from[1]}
                  x2={conn.to[0]}
                  y2={conn.to[1]}
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: isActive ? 1 : 0,
                    opacity: isActive ? 0.6 : 0,
                  }}
                  transition={{
                    pathLength: { duration: 0.8, ease: "easeInOut" },
                    opacity: { duration: 0.4 }
                  }}
                />

                {/* Animated Traveling Light Pulses */}
                {isActive && !shouldReduceMotion && (
                  <motion.line
                    x1={conn.from[0]}
                    y1={conn.from[1]}
                    x2={conn.to[0]}
                    y2={conn.to[1]}
                    stroke="var(--primary-light)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="4, 16"
                    animate={{ strokeDashoffset: [0, -40] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "linear"
                    }}
                  />
                )}
              </g>
            )
          })}

          {/* Network Nodes */}
          {nodes.map((node) => {
            const isActive = currentProgress >= node.activeAt
            const isCore = node.isCore

            return (
              <g key={node.id}>
                {/* Expandable Wave Pulse (Atmospheric breath effect) */}
                {isActive && !shouldReduceMotion && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={isCore ? 18 : 12}
                    fill="none"
                    stroke="var(--primary-light)"
                    strokeWidth="0.75"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [1, isCore ? 1.6 : 1.4, 1],
                      opacity: [0.1, 0.45, 0.1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: isCore ? 3 : 2.2,
                      ease: "easeInOut",
                      delay: node.activeAt * 0.005
                    }}
                  />
                )}

                {/* Outer Ring */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isCore ? 7 : 4.5}
                  fill="#080a10"
                  stroke={isActive ? "var(--primary)" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive && !shouldReduceMotion ? "url(#glow-effect)" : undefined}
                  animate={isActive && !shouldReduceMotion ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />

                {/* Inner Activation Core */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isCore ? 3.5 : 2}
                  fill={isActive ? "var(--primary-light)" : "rgba(255,255,255,0.3)"}
                  animate={isActive && !shouldReduceMotion ? {
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </g>
            )
          })}
        </svg>

        {/* Center Progress Ring Overlay (Subtle and minimal) */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-primary/5 animate-[spin_100s_linear_infinite]" />
      </div>

      {/* 3. Branding Section */}
      <div className="flex flex-col items-center text-center max-w-sm w-full mb-5">
        <div className="inline-flex items-center gap-1.5 justify-center tracking-[0.35em] font-mono text-lg font-light mb-2">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[#f3f4f6] font-bold"
          >
            CHAT
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-primary font-black"
            style={completionState ? { textShadow: "0 0 12px var(--primary)" } : {}}
          >
            YOU
          </motion.span>
        </div>

        {/* Separator Accent Line */}
        <div className="w-12 h-[1px] bg-white/10 relative overflow-hidden mb-5">
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Status Message Display */}
        <div className="h-6 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`text-[12px] sm:text-[13px] tracking-wider font-medium ${
                completionState ? 'text-primary font-semibold' : 'text-[#9ca3af]'
              }`}
            >
              {currentStep}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tech Monospace Percent Readout */}
        <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-[#6b7280] tracking-widest">
          <span>SYS_INIT</span>
          <span className={`w-1 h-1 rounded-full ${completionState ? 'bg-success animate-pulse' : 'bg-primary animate-pulse'}`} />
          <span className={completionState ? 'text-[#9ca3af]' : ''}>
            {String(currentProgress).padStart(3, '0')}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default Loader