import React from 'react';
import { FaUsers } from "react-icons/fa";

const SidebarSkeleton = ({ activeTab = 'all' }) => {
  const showDMs = activeTab === 'all' || activeTab === 'direct';
  const showGroups = activeTab === 'all' || activeTab === 'groups';

  return (
    <div className="space-y-6">
      {/* Direct Messages Loading Section */}
      {showDMs && (
        <div className="mb-6">
          <div className="px-2 mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
              Direct Messages
            </span>
            <div className="h-4 w-6 rounded bg-bg-secondary border border-border shimmer-effect" />
          </div>

          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={`dm-sk-${i}`}
                className="w-full p-3 mb-1.5 flex items-center justify-between rounded-xl border border-transparent bg-bg-sidebar/40"
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Avatar Skeleton */}
                  <div className="relative flex items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border/40 shimmer-effect" />
                    {/* Status Dot Skeleton */}
                    <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-bg-secondary" />
                  </div>

                  {/* Text Details Skeleton */}
                  <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
                    <div className="h-3.5 w-24 bg-bg-secondary rounded-md shimmer-effect" />
                    <div className="h-2.5 w-16 bg-bg-secondary/60 rounded-md shimmer-effect" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Loading Section */}
      {showGroups && (
        <div>
          <div className="px-2 mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
              Groups & Communities
            </span>
            <div className="h-4 w-6 rounded bg-bg-secondary border border-border shimmer-effect" />
          </div>

          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`group-sk-${i}`}
                className="w-full p-3 mb-1.5 flex items-center justify-between rounded-xl border border-transparent bg-bg-sidebar/40"
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Avatar Skeleton */}
                  <div className="relative flex items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border/40 shimmer-effect" />
                    {/* Group Icon Badge Skeleton */}
                    <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-bg-secondary flex items-center justify-center">
                      <FaUsers className="text-[8px] text-text-muted/40" />
                    </div>
                  </div>

                  {/* Text Details Skeleton */}
                  <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
                    <div className="h-3.5 w-32 bg-bg-secondary rounded-md shimmer-effect" />
                    <div className="h-2.5 w-12 bg-bg-secondary/60 rounded-md shimmer-effect" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarSkeleton;
