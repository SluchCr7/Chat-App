import React from "react";
import Logo from "./Logo";
import { motion } from "framer-motion";
import { LuMessageSquare } from "react-icons/lu";

const NoChatSelected = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-bg px-6">

      {/* Background Blur Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute left-16 top-28 hidden xl:block"
      >
        <div className="rounded-3xl border border-white/5 bg-card-custom/50 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-500/20" />
            <div>
              <div className="mb-2 h-3 w-24 rounded-full bg-slate-700" />
              <div className="h-2 w-16 rounded-full bg-slate-800" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute right-20 bottom-24 hidden xl:block"
      >
        <div className="rounded-3xl border border-white/5 bg-card-custom/50 p-4 backdrop-blur-xl">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20" />
            <div>
              <div className="mb-2 h-3 w-28 rounded-full bg-slate-700" />
              <div className="h-2 w-20 rounded-full bg-slate-800" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl text-center"
      >
        {/* Logo Container */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/10 bg-card-custom/60 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.08)]">
          <Logo compact />
        </div>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card-custom/60 px-4 py-2 backdrop-blur-xl">
          <LuMessageSquare className="text-primary" />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-text-active">
            ChatYou
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-text-active">
          Welcome Back
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-xl text-base leading-7 text-slate-400">
          Select a conversation, join a community, or start a new chat.
          Everything is synced in real-time and ready whenever you are.
        </p>

        {/* Decorative Line */}
        <div className="mx-auto mt-10 h-px w-40 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </motion.div>
    </div>
  );
};

export default NoChatSelected;