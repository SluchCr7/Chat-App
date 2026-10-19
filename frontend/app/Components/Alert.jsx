import React, { memo } from 'react';
import { LuInfo } from "react-icons/lu";

const Alert = memo(({ Notify }) => {
  if (!Notify) return null;

  return (
    <div className="fixed top-6 right-6 z-[1000] max-w-sm w-[90%] sm:w-auto p-4 rounded-2xl bg-surface border border-border shadow-2xl text-text-primary flex items-center gap-3 transition-all duration-300 animate-slide-in">
      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
        <LuInfo className="text-base" />
      </div>
      <span className="text-xs font-semibold leading-relaxed">{Notify}</span>
    </div>
  );
});

Alert.displayName = "Alert";

export default Alert;