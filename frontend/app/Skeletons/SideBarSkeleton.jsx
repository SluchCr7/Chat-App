'use client';

import React from 'react';

const SideBarSkeleton = ({ activeTab = 'all' }) => {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <div className="space-y-4 animate-pulse">
      {/* Category header skeleton */}
      <div className="px-2 flex items-center justify-between">
        <div className="h-2.5 bg-surface border border-border/40 rounded-md w-24 shimmer-effect"></div>
        <div className="h-4 bg-surface border border-border/40 rounded-md w-6 shimmer-effect"></div>
      </div>

      {/* Item list skeletons */}
      <div className="space-y-2">
        {skeletonItems.map((_, index) => (
          <div 
            key={index}
            className="w-full p-3 flex items-center justify-between rounded-2xl border border-border/30 bg-surface/50"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-9.5 h-9.5 rounded-full bg-surface border border-border/40 flex-shrink-0 shimmer-effect"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-surface border border-border/40 rounded-md w-3/5 shimmer-effect"></div>
                <div className="h-2 bg-surface border border-border/40 rounded-md w-2/5 shimmer-effect"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBarSkeleton;
