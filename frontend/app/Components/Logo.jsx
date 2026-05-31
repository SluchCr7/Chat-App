"use client";

export default function Logo({ compact = false, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-cyan-500 text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.22)]">
        <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20C18 13.3726 23.3726 8 30 8H34C40.6274 8 46 13.3726 46 20V34C46 40.6274 40.6274 46 34 46H30L22 56V46H18C11.3726 46 6 40.6274 6 34V20C6 13.3726 11.3726 8 18 8H22" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
          <path d="M32 20C37.5228 20 42 24.4772 42 30C42 35.5228 37.5228 40 32 40C26.4772 40 22 35.5228 22 30C22 24.4772 26.4772 20 32 20Z" fill="#0f172a" opacity="0.08" />
          <path d="M28 28L36 24M28 32L40 26" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <div className="space-y-0.5">
          <span className="block text-lg font-semibold uppercase tracking-[0.22em] text-text-active">ChatYou</span>
          <span className="text-xs text-muted">Pro chat & group hub</span>
        </div>
      )}
    </div>
  );
}
