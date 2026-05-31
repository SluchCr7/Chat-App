'use client'
import React from 'react';
import Link from 'next/link';
import { LuCompass } from 'react-icons/lu';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-hidden select-none transition-all duration-300">
      {/* Background visual ambient glow */}
      <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(circle_at_center,_var(--primary),_transparent_45%)] pointer-events-none" />

      <div className="max-w-md w-full rounded-[28px] border border-border bg-surface p-8 shadow-xl text-center space-y-8 relative z-10">
        
        {/* Glowing Geometric Compass */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Pulsing glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
            
            {/* Spinning dotted ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-border-hover animate-[spin_10s_linear_infinite]" />
            
            {/* Glowing icon wrapper */}
            <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-primary border border-border text-primary shadow-sm">
              <LuCompass className="text-2xl animate-bounce" />
            </div>
          </div>
        </div>

        {/* Informative text section */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
            System Alert Code: 404
          </p>
          <h1 className="text-2xl font-black tracking-tight text-text-primary">
            Lost in Space
          </h1>
          <p className="text-text-secondary text-xs font-semibold max-w-xs mx-auto leading-relaxed">
            The workspace or route you are looking for has been moved, archived, or is currently unavailable.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-bold text-text-inverse shadow-md transition duration-300 active:scale-95 uppercase tracking-wider"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;

