'use client';

import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ currentProgress = 0, currentStep = '', completionState = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.98,
        filter: 'blur(8px)',
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
      role="progressbar"
      aria-valuenow={currentProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Initializing ChatYou Secure Network"
    >
      {/* Sleek Deep Space Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Main Container */}
      <div className="flex flex-col items-center w-full max-w-[280px] sm:max-w-[320px]">
        
        {/* Modern Minimalist Glowing Logo Container */}
        <div className="relative mb-8 group">
          {/* Logo Glow Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-primary to-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 animate-tilt" />
          
          {/* Main Logo Sphere */}
          <motion.div 
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 40px rgba(56,189,248,0.04)",
                "0 0 50px rgba(56,189,248,0.1)",
                "0 0 40px rgba(56,189,248,0.04)"
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
            className="relative w-20 h-20 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl"
          >
            {/* Minimal High-Tech Inner Pattern */}
            <div className="absolute inset-1.5 rounded-full border border-white/5 border-dashed animate-[spin_40s_linear_infinite]" />
            
            {/* Premium Icon (Sleek minimalist SVG chat bubble) */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-primary-light drop-shadow-[0_0_10px_rgba(56,189,248,0.35)]"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </motion.div>
        </div>

        {/* Branding & Sub-label */}
        <div className="text-center mb-8">
          <h1 className="inline-flex items-center gap-2 tracking-[0.25em] font-sans text-xl font-light mb-1">
            <span className="text-[#f3f4f6] font-medium">CHAT</span>
            <span className="text-primary font-black drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">YOU</span>
          </h1>
          <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#6b7280] font-sans">
            Secure Connection System
          </p>
        </div>

        {/* Sleek Minimalist Loading Bar Track */}
        <div className="w-full h-[3px] bg-white/[0.04] border border-white/[0.01] rounded-full overflow-hidden relative mb-4">
          <motion.div 
            className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-primary to-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px rgba(56,189,248,0.3)"
            }}
          />
        </div>

        {/* Dual-Column Metadata Info Display */}
        <div className="w-full flex items-center justify-between font-mono text-[10px] text-[#9ca3af] tracking-wider select-none px-0.5">
          {/* Status Message */}
          <div className="h-4 flex items-center overflow-hidden max-w-[75%]">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="truncate font-bold uppercase text-[#6b7280] tracking-widest text-[8.5px]"
              >
                {currentStep}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Progressive Monospace Percentage */}
          <span className="font-bold text-primary-light tabular-nums font-mono">
            {String(currentProgress).padStart(3, '0')}%
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default Loader;