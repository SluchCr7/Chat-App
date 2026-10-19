'use client';

import React from "react";
import Logo from "./Logo";
import { motion } from "framer-motion";
import { LuMessageSquare, LuCompass, LuSparkles, LuSearch } from "react-icons/lu";

const NoChatSelected = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-bg-primary px-6 select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-100px] top-[-100px] h-[380px] w-[380px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[380px] w-[380px] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-lg text-center"
      >
        {/* Brand Centerpiece */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-primary/10">
          <Logo compact size="lg" />
        </div>

        {/* Brand Tagline Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 shadow-sm">
          <LuSparkles className="text-accent text-xs" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-secondary">
            A new space for conversations
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
          Welcome to VYRO
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-md text-xs leading-relaxed text-text-secondary font-medium">
          Choose a conversation from the sidebar to send encrypted direct messages, share audio notes, or collaborate in community channels.
        </p>

        {/* Quick Shortcut Guides */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] text-text-muted">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface/40">
            <LuSearch className="text-primary text-xs" />
            <span>Search contacts or channels</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface/40">
            <LuCompass className="text-accent text-xs" />
            <span>Explore public groups</span>
          </div>
        </div>

        {/* Subtle accent divider */}
        <div className="mx-auto mt-8 h-[1px] w-28 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </motion.div>
    </div>
  );
};

export default NoChatSelected;