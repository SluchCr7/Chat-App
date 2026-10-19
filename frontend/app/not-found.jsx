'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Components/Logo';
import { LuCompass, LuArrowLeft } from 'react-icons/lu';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-hidden select-none transition-colors duration-200">
      {/* Background visual ambient glow */}
      <div className="absolute inset-0 opacity-15 blur-3xl bg-[radial-gradient(circle_at_center,_var(--primary),_transparent_55%)] pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl border border-border bg-surface p-8 sm:p-10 shadow-2xl text-center space-y-6 relative z-10">
        
        {/* Logo and Icon */}
        <div className="flex flex-col items-center gap-3">
          <Logo compact size="md" />
          <div className="relative w-16 h-16 flex items-center justify-center mt-2">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-primary border border-border text-primary shadow-sm">
              <LuCompass className="text-2xl animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-black">
            System Code 404
          </p>
          <h1 className="text-2xl font-black tracking-tight text-text-primary">
            Route Not Found
          </h1>
          <p className="text-text-secondary text-xs font-medium max-w-xs mx-auto leading-relaxed">
            The space, channel, or page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-black text-text-inverse shadow-md transition uppercase tracking-wider"
          >
            <LuArrowLeft className="text-sm" /> Return to Workspace
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
