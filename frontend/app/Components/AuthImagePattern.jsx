'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-bg-secondary via-surface to-bg-primary relative overflow-hidden select-none h-full min-h-[500px]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Card Containers */}
      <div className="grid grid-cols-3 gap-3.5 mb-10 relative z-10 w-full max-w-sm">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.08,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 3 + i * 0.2
            }}
            className={`aspect-square rounded-2xl border transition-all duration-300 flex items-center justify-center ${
              i % 2 === 0 
                ? "bg-surface/80 border-primary/20 shadow-lg shadow-primary/5" 
                : "bg-bg-primary/60 border-border"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? "bg-primary animate-pulse" : "bg-border"}`} />
          </motion.div>
        ))}
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-2 relative z-10 max-w-md">
        <h2 className="text-xl font-black text-text-primary tracking-tight">{title}</h2>
        <p className="text-xs text-text-secondary font-medium leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;