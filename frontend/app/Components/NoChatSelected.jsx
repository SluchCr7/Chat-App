import React from 'react';
import Logo from './Logo';
import { LuMessageSquare } from "react-icons/lu";

const NoChatSelected = () => {
  return (
    <div className="flex min-h-[90vh] w-full flex-col items-center justify-center bg-bg p-8 text-center">
      <div className="max-w-xl rounded-[32px] border border-custom bg-card-custom p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LuMessageSquare className="h-10 w-10" />
        </div>
        <div className="mb-6 inline-flex items-center gap-3 rounded-3xl bg-card-custom px-4 py-3 shadow-sm shadow-cyan-500/10">
          <Logo compact />
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-text-active">ChatYou</span>
        </div>
        <h1 className="text-3xl font-semibold text-text-active mb-3">Welcome to ChatYou</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Select a conversation or community from the left sidebar to start chatting. Everything is ready for your next message.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;