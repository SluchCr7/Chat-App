'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LuMessageSquare, 
  LuUsers, 
  LuShieldCheck, 
  LuArrowRight, 
  LuSparkles,
  LuPalette
} from 'react-icons/lu';
import { ThemeContext } from '../Context/ThemeContext';
import Logo from './Logo';

export default function HomePage() {
  const { theme, setTheme } = useContext(ThemeContext);

  const themeAccents = [
    { name: 'black', accent: '#0ea5e9', label: 'Dark' },
    { name: 'white', accent: '#4f46e5', label: 'Light' },
    { name: 'blue', accent: '#3b82f6', label: 'Blue' },
    { name: 'green', accent: '#10b981', label: 'Green' },
    { name: 'red', accent: '#f43f5e', label: 'Rose' },
    { name: 'yellow', accent: '#f59e0b', label: 'Amber' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-colors duration-300">
      
      {/* Clean Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-border/40">
        <Logo />
        <div className="flex items-center gap-4">
          <Link 
            href="/Pages/Login" 
            className="text-xs font-bold text-text-secondary hover:text-text-primary transition"
          >
            Sign In
          </Link>
          <Link 
            href="/Pages/Register" 
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-text-inverse text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <span>Get Started</span>
            <LuArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center text-center space-y-16">
        
        {/* Simple Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          {/* Minimal Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 shadow-sm">
            <LuSparkles className="text-primary text-xs" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Fast, Simple & Secure Messaging
            </span>
          </div>

          {/* Clean Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-text-primary leading-tight">
            Connect with your team and communities <span className="text-primary">effortlessly.</span>
          </h1>

          {/* Simple Subtitle */}
          <p className="text-xs sm:text-sm text-text-secondary font-semibold max-w-xl mx-auto leading-relaxed">
            ChatYou provides instant real-time messaging, group channels, voice notes, and personalized theme accents — designed for focus and clarity.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link 
              href="/Pages/Register" 
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-xs font-black text-text-inverse shadow-md transition uppercase tracking-wider active:scale-95"
            >
              <span>Get Started Free</span>
              <LuArrowRight size={14} />
            </Link>
            <Link 
              href="/Pages/Login" 
              className="inline-flex items-center rounded-xl border border-border bg-surface hover:bg-surface-hover px-6 py-3.5 text-xs font-black text-text-primary transition uppercase tracking-wider"
            >
              Sign In to Workspace
            </Link>
          </div>
        </motion.div>

        {/* Simple 3-Column Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          {/* Card 1 */}
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm hover:border-border-hover transition">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <LuMessageSquare className="text-lg" />
            </div>
            <h3 className="text-sm font-black text-text-primary">Real-Time Messaging</h3>
            <p className="text-xs text-text-secondary font-semibold leading-relaxed">
              Instant message delivery with typing indicators, read receipts, and voice note recordings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm hover:border-border-hover transition">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <LuUsers className="text-lg" />
            </div>
            <h3 className="text-sm font-black text-text-primary">Groups & Channels</h3>
            <p className="text-xs text-text-secondary font-semibold leading-relaxed">
              Organize public and private communities with dedicated channels and admin controls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm hover:border-border-hover transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <LuShieldCheck className="text-lg" />
            </div>
            <h3 className="text-sm font-black text-text-primary">Secure & Custom</h3>
            <p className="text-xs text-text-secondary font-semibold leading-relaxed">
              Protected authentication, document sharing, custom wallpapers, and light/dark theme modes.
            </p>
          </div>
        </motion.div>

        {/* Minimal Theme Switcher Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl border border-border bg-surface/50 p-4 w-full max-w-xl flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <LuPalette className="text-primary text-sm" />
            <span>Theme Accent:</span>
          </div>

          <div className="flex items-center gap-2">
            {themeAccents.map((t) => {
              const isActive = theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-extrabold transition ${
                    isActive 
                      ? 'bg-primary text-text-inverse border-primary shadow-sm' 
                      : 'border-border bg-bg-primary text-text-muted hover:text-text-primary'
                  }`}
                  title={`Switch to ${t.label} theme`}
                >
                  <span style={{ backgroundColor: t.accent }} className="w-2.5 h-2.5 rounded-full border border-white/20" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-text-muted font-semibold">
        ChatYou Workspace — Simple, Fast & Secure Messaging © {new Date().getFullYear()}
      </footer>

    </div>
  );
}
