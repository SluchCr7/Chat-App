'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LuShieldCheck, LuSparkles, LuRadio, LuZap, LuUsers, LuMic } from 'react-icons/lu';
import Logo from './Logo';

const features = [
  { icon: LuShieldCheck, label: "Encrypted direct messaging" },
  { icon: LuRadio, label: "Instant WebSocket synchronization" },
  { icon: LuUsers, label: "Dynamic community channels" },
  { icon: LuMic, label: "Studio-quality voice notes" },
];

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-between p-12 bg-gradient-to-br from-surface via-bg-secondary to-bg-primary relative overflow-hidden select-none h-full min-h-[580px] border-r border-border text-left">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Branding Badge */}
      <div className="w-full flex items-center justify-between z-10">
        <Logo size="sm" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
          <LuSparkles size={11} />
          <span>Next-Gen Platform</span>
        </div>
      </div>

      {/* Centerpiece Geometric Showcase */}
      <div className="relative z-10 w-full max-w-sm my-8">
        <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-4 rounded-full border border-white/5 border-dashed animate-[spin_35s_linear_infinite]" />
          
          {/* Glass Focal Pod */}
          <motion.div
            animate={{
              y: [-4, 4, -4],
              scale: [1, 1.02, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut"
            }}
            className="w-32 h-32 rounded-3xl bg-surface/90 border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-accent/15" />
            <Logo compact size="xl" />
          </motion.div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 gap-2.5 mt-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface/60 backdrop-blur-md"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon className="text-xs" />
                </div>
                <span className="text-[11px] font-bold text-text-secondary leading-tight">
                  {feat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Title & Subtitle */}
      <div className="w-full space-y-1.5 relative z-10">
        <h2 className="text-xl font-black text-text-primary tracking-tight">{title}</h2>
        <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-md">{subtitle}</p>
      </div>
    </div>
  );
};

export default React.memo(AuthImagePattern);