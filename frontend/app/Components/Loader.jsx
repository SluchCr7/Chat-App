'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Loader = ({ currentProgress = 0, currentStep = '', completionState = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.98,
        filter: 'blur(8px)',
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-50 bg-[#080b11] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
      role="progressbar"
      aria-valuenow={currentProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Initializing VYRO Secure Workspace"
    >
      {/* Deep Space Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_70%)] pointer-events-none" />
      <div 
        className="absolute w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" 
        style={{ animationDuration: '6s' }} 
      />

      {/* Main Container */}
      <div className="flex flex-col items-center w-full max-w-[280px] sm:max-w-[320px] relative z-10">
        
        {/* Modern Minimalist Logo Sphere */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-accent via-primary to-indigo-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition duration-1000 animate-pulse" />
          
          <motion.div 
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: "easeInOut"
            }}
            className="relative w-20 h-20 rounded-3xl bg-surface border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl"
          >
            <Logo compact size="lg" />
          </motion.div>
        </div>

        {/* Branding & Sub-label */}
        <div className="text-center mb-8">
          <h1 className="inline-flex items-center gap-1.5 font-sans text-2xl font-black tracking-widest text-text-primary mb-1">
            VYRO
          </h1>
          <p className="text-[9px] uppercase font-bold tracking-[0.25em] text-text-muted">
            A new space for conversations
          </p>
        </div>

        {/* Loading Bar Track */}
        <div className="w-full h-[3px] bg-white/[0.06] border border-white/[0.02] rounded-full overflow-hidden relative mb-4">
          <motion.div 
            className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-accent via-primary to-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px rgba(139,92,246,0.35)"
            }}
          />
        </div>

        {/* Dual-Column Metadata Info Display */}
        <div className="w-full flex items-center justify-between text-[10px] text-text-muted tracking-wider select-none px-0.5 font-medium">
          {/* Status Message */}
          <div className="h-4 flex items-center overflow-hidden max-w-[75%]">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="truncate font-bold uppercase tracking-widest text-[8.5px] text-text-secondary"
              >
                {currentStep || "Connecting..."}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Progressive Percentage */}
          <span className="font-bold text-primary tabular-nums font-mono">
            {String(currentProgress).padStart(3, '0')}%
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default Loader;