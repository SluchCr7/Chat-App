'use client';

import React from 'react';

const MessageSkeleton = () => {
  const skeletons = [
    { sender: false, width: 'w-48' },
    { sender: true, width: 'w-64' },
    { sender: false, width: 'w-36' },
    { sender: true, width: 'w-56' },
    { sender: false, width: 'w-60' }
  ];

  return (
    <div className="flex-1 w-full h-full p-5 space-y-6 overflow-y-auto bg-bg-primary">
      {/* Header Skeleton */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-4 justify-between -mx-5 -mt-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface border border-border/40 shimmer-effect"></div>
          <div className="space-y-1">
            <div className="h-3 bg-surface border border-border/40 rounded w-28 shimmer-effect"></div>
            <div className="h-2 bg-surface border border-border/40 rounded w-16 shimmer-effect"></div>
          </div>
        </div>
      </div>

      {/* Date Separator Skeleton */}
      <div className="flex justify-center my-6">
        <div className="h-5 w-24 bg-surface border border-border/40 rounded-full shimmer-effect"></div>
      </div>

      {/* Message Bubbles Skeletons */}
      {skeletons.map((item, index) => (
        <div 
          key={index}
          className={`flex items-end gap-3.5 mb-4 ${item.sender ? 'justify-end' : 'justify-start'}`}
        >
          {!item.sender && (
            <div className="w-8 h-8 rounded-full bg-surface border border-border/40 shimmer-effect flex-shrink-0"></div>
          )}
          <div className={`p-4 rounded-2xl border border-border/30 bg-surface/40 ${item.width} space-y-2`}>
            <div className="h-3 bg-surface border border-border/40 rounded w-full shimmer-effect"></div>
            <div className="h-3 bg-surface border border-border/40 rounded w-2/3 shimmer-effect"></div>
          </div>
          {item.sender && (
            <div className="w-8 h-8 rounded-full bg-surface border border-border/40 shimmer-effect flex-shrink-0"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
