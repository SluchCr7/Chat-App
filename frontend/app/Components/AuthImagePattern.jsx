'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LuCheckCheck, LuHeart, LuSmile } from 'react-icons/lu';
import Logo from './Logo';

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-full h-full min-h-[500px] p-8 relative overflow-hidden select-none">
      
      {/* Decorative Glowing Backdrop Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[90px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-[90px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10 text-center space-y-8">
        
        {/* Logo and Branding header */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/40 border border-border/80 px-4 py-2.5 backdrop-blur-md shadow-md"
          >
            <Logo compact />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-text-secondary">Enterprise Sync</span>
          </motion.div>
        </div>

        {/* Premium Floating Interactive Chat Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-3xl border border-border bg-bg-secondary/40 backdrop-blur-lg p-5 shadow-2xl space-y-4 text-left border-white/[0.04]"
        >
          {/* Header mockup */}
          <div className="flex items-center justify-between border-b border-border/55 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white border border-bg-secondary">JD</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-extrabold text-white border border-bg-secondary">AS</div>
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-extrabold text-white border border-bg-secondary">MK</div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-text-primary">Development Channel</span>
                <span className="text-[9px] text-text-muted font-semibold">3 active developers</span>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* Messages Stream mockup */}
          <div className="space-y-4 py-1">
            
            {/* Mock message 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-start gap-2 max-w-[85%]"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">JD</div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-text-secondary">John Doe</span>
                <div className="bg-bg-primary/80 border border-border px-3.5 py-2 rounded-2xl rounded-tl-none text-[10px] font-medium leading-relaxed text-text-primary shadow-sm">
                  Hey team! Check out the updated theme system. Color palettes are fully synced.
                </div>
              </div>
            </motion.div>

            {/* Mock message 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="flex items-start gap-2 max-w-[85%] ml-auto flex-row-reverse"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">AS</div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[8px] font-bold text-text-secondary">Alice Smith</span>
                <div className="bg-primary text-white px-3.5 py-2 rounded-2xl rounded-tr-none text-[10px] font-semibold leading-relaxed shadow-sm relative group">
                  Wow, the glassmorphism layout feels incredibly snappy! 🚀
                  {/* Floating heart icon reaction */}
                  <span className="absolute -bottom-2.5 -left-1.5 bg-surface border border-border rounded-full p-1 flex items-center gap-0.5 text-[8px] text-amber-500 shadow-sm">
                    <LuHeart size={7} className="fill-current text-rose-500" />
                    <span className="text-text-secondary font-bold">1</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Mock typing indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="flex items-center gap-2 max-w-[80%]"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white">MK</div>
              <div className="flex items-center gap-1.5 bg-bg-primary/40 px-3.5 py-2 border border-border/50 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Text descriptions */}
        <div className="space-y-2.5">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed max-w-sm mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

      </div>
    </div>
  );
};

export default AuthImagePattern;