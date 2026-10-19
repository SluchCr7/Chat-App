'use client';

import React from 'react';
import Image from 'next/image';

const colorPalettes = [
  'from-violet-600 to-indigo-600',
  'from-cyan-600 to-blue-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600',
  'from-purple-600 to-fuchsia-600',
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getPalette(name) {
  if (!name) return colorPalettes[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
}

export default function Avatar({
  src,
  name = 'User',
  size = 40,
  isOnline = false,
  status = 'offline',
  showStatus = false,
  isGroup = false,
  className = '',
}) {
  const isDefaultPixabay = src && src.includes('pixabay.com');
  const hasValidPhoto = src && !isDefaultPixabay;

  const sizeClasses = {
    28: 'w-7 h-7 text-[10px]',
    32: 'w-8 h-8 text-xs',
    36: 'w-9 h-9 text-xs',
    40: 'w-10 h-10 text-sm',
    48: 'w-12 h-12 text-base',
    56: 'w-14 h-14 text-lg',
    64: 'w-16 h-16 text-xl',
    96: 'w-24 h-24 text-2xl',
  };

  const containerClass = sizeClasses[size] || 'w-10 h-10 text-sm';
  const palette = getPalette(name);

  // Status color logic
  let statusColor = 'bg-text-disabled';
  if (isOnline) {
    if (status === 'away') statusColor = 'bg-amber-400 ring-amber-500/30';
    else if (status === 'busy') statusColor = 'bg-rose-400 ring-rose-500/30';
    else statusColor = 'bg-emerald-400 ring-emerald-500/30 status-glow-online';
  }

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {hasValidPhoto ? (
        <div className={`relative ${containerClass} rounded-full overflow-hidden border border-border bg-surface`}>
          <Image
            src={src}
            alt={name || 'Avatar'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={`${containerClass} rounded-full bg-gradient-to-br ${palette} text-white font-black flex items-center justify-center border border-white/10 shadow-sm uppercase tracking-wider`}
          aria-label={name}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-bg-sidebar border border-white/10 ${statusColor}`}
          title={isOnline ? `Online (${status})` : 'Offline'}
        />
      )}
    </div>
  );
}
