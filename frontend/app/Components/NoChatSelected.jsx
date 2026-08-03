'use client';

import React from "react";
import Logo from "./Logo";
import { motion } from "framer-motion";
import { LuMessageSquare } from "react-icons/lu";

const NoChatSelected = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-bg-primary px-6 select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-accent/10 blur-[140px]" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg text-center"
      >
        {/* Logo Shield */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-surface shadow-2xl">
          <Logo compact />
        </div>

        {/* SaaS Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 shadow-sm">
          <LuMessageSquare className="text-primary text-xs" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary">
            ChatYou Workspace
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
          Select a Conversation
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-md text-xs leading-relaxed text-text-secondary font-semibold">
          Select a contact or community from the left navigation panel to view real-time messages, audio notes, and shared files.
        </p>

        {/* Divider */}
        <div className="mx-auto mt-8 h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </motion.div>
    </div>
  );
};

export default NoChatSelected;