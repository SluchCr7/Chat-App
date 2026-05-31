'use client';

import React, { useContext } from 'react';
import Logo from '@/app/Components/Logo';
import { ThemeContext } from '@/app/Context/ThemeContext';

const ThemeSettingsPage = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const themes = [
    { name: 'white', bg: '#f8fafc', text: '#0f172a', border: 'border-slate-300' },
    { name: 'black', bg: '#090b11', text: '#f3f4f6', border: 'border-slate-800' },
    { name: 'red', bg: '#0d090a', text: '#ffe4e6', border: 'border-rose-950' },
    { name: 'green', bg: '#050a07', text: '#d1fae5', border: 'border-emerald-950' },
    { name: 'blue', bg: '#050b14', text: '#dbeafe', border: 'border-blue-950' },
    { name: 'yellow', bg: '#080603', text: '#fef9c3', border: 'border-amber-950' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-14 px-6 transition-all duration-300">
      <div className="mx-auto max-w-5xl space-y-10 text-left">
        
        {/* Settings Outer Card */}
        <div className="rounded-[28px] border border-border bg-surface p-8 shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-3 shadow-inner">
              <Logo compact />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Appearance Settings</h1>
                <p className="max-w-2xl text-xs text-text-secondary font-medium mt-0.5">
                  Personalize the app experience with premium themes designed for focus and clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Selector panel */}
          <div className="mt-8 rounded-2xl border border-border bg-bg-primary/40 p-6 shadow-inner">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Choose Theme Accent</h2>
                <p className="text-xs text-text-muted mt-1 font-bold">
                  Current workspace theme: <span className="text-primary uppercase font-extrabold tracking-wider">{theme}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {themes.map((t) => {
                const isActive = theme === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className={`rounded-xl p-4 text-xs font-bold transition-all duration-300 border uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-sm ${
                      isActive 
                        ? "border-primary ring-2 ring-primary/40 scale-105" 
                        : "border-border hover:scale-102 hover:border-border-hover"
                    }`}
                  >
                    <span>{t.name}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border border-current ${isActive ? "bg-current" : "bg-transparent"}`}></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSettingsPage;
