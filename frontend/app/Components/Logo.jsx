"use client";

import React from "react";

export default function Logo({ 
  compact = false, 
  size = "md", 
  showTagline = true, 
  className = "" 
}) {
  const sizeMap = {
    sm: {
      container: "h-7 w-7 rounded-lg",
      icon: "w-4 h-4",
      title: "text-sm tracking-wider",
      subtitle: "text-[8px] tracking-[0.2em]",
      spacing: "gap-2"
    },
    md: {
      container: "h-9 w-9 rounded-xl",
      icon: "w-5 h-5",
      title: "text-base tracking-widest",
      subtitle: "text-[9px] tracking-[0.2em]",
      spacing: "gap-2.5"
    },
    lg: {
      container: "h-12 w-12 rounded-2xl",
      icon: "w-7 h-7",
      title: "text-xl tracking-widest",
      subtitle: "text-[10px] tracking-[0.22em]",
      spacing: "gap-3.5"
    },
    xl: {
      container: "h-16 w-16 rounded-3xl",
      icon: "w-9 h-9",
      title: "text-3xl tracking-widest",
      subtitle: "text-xs tracking-[0.25em]",
      spacing: "gap-4"
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${currentSize.spacing} select-none ${className}`}>
      {/* Abstract geometric symbol */}
      <span 
        className={`relative inline-flex items-center justify-center ${currentSize.container} bg-gradient-to-br from-surface to-bg-secondary border border-white/10 shadow-lg shadow-primary/10 overflow-hidden flex-shrink-0 group`}
      >
        <svg 
          viewBox="0 0 32 32" 
          className={`${currentSize.icon} transition-transform duration-300 group-hover:scale-105`} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vyro-glyph-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#C4B5FD" />
              <stop offset="50%" stop-color="#8B5CF6" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>
          {/* Geometric V-Vector */}
          <path d="M7 8L16 23L25 8H20.5L16 16.5L11.5 8H7Z" fill="url(#vyro-glyph-grad)" />
          {/* Resonance Center Nexus */}
          <polygon points="16,9 18.5,13 16,17 13.5,13" fill="#06B6D4" />
        </svg>
      </span>

      {!compact && (
        <div className="flex flex-col text-left leading-none justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-text-primary ${currentSize.title}`}>
              VYRO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          {showTagline && (
            <span className={`font-medium uppercase text-text-muted mt-0.5 ${currentSize.subtitle}`}>
              A new space for conversations
            </span>
          )}
        </div>
      )}
    </div>
  );
}
