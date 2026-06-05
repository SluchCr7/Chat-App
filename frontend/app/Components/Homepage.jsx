'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LuMessageSquare, 
  LuUsers, 
  LuSparkles, 
  LuShieldCheck, 
  LuArrowRight, 
  LuPalette,
  LuCpu
} from 'react-icons/lu';
import { ThemeContext } from '../Context/ThemeContext';
import Logo from './Logo';

export default function HomePage() {
  const { theme, setTheme } = useContext(ThemeContext);

  const themeAccents = [
    { name: 'white', bg: '#f8fafc', accent: '#4f46e5', label: 'Indigo Light' },
    { name: 'black', bg: '#090b11', accent: '#0ea5e9', label: 'Cyber Dark' },
    { name: 'blue', bg: '#050b14', accent: '#3b82f6', label: 'Sapphire Ocean' },
    { name: 'green', bg: '#050a07', accent: '#10b981', label: 'Emerald Forest' },
    { name: 'red', bg: '#0d090a', accent: '#f43f5e', label: 'Coral Rose' },
    { name: 'yellow', bg: '#080603', accent: '#f59e0b', label: 'Amber Gold' },
  ];

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary overflow-hidden relative transition-colors duration-500">
      
      {/* Dynamic Ambient Mesh Backdrop Grid */}
      <div className="absolute inset-0 opacity-25 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Glassmorphic Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-border/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/Pages/Login" 
            className="text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary transition duration-300"
          >
            Sign In
          </Link>
          <Link 
            href="/Pages/Register" 
            className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-text-inverse text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition duration-300 active:scale-95"
          >
            <span>Get Started</span>
            <LuArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          
          {/* Left Hero Content: Intro column */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full bg-surface/50 border border-border px-4 py-2 shadow-sm backdrop-blur-md">
              <LuSparkles className="text-primary h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-secondary">
                A Premium Real-Time Chat Experience
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1] max-w-xl">
                Chat smarter. Connect <span className="text-primary transition-colors duration-500">instantly.</span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl font-medium leading-relaxed">
                ChatYou integrates modern glassmorphic interface designs, secure cookie validation, global message search, and fully customizable chat backgrounds into a unified social network.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/Pages/Register" 
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-xs font-bold text-text-inverse shadow-lg shadow-primary/15 transition-all duration-300 hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
              >
                Create Free Account
              </Link>
              <Link 
                href="/Pages/Login" 
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/40 hover:bg-surface/75 px-6 py-3.5 text-xs font-bold text-text-primary transition-all duration-300 shadow-sm hover:scale-[1.02] uppercase tracking-wider backdrop-blur-sm"
              >
                Join Workspace
              </Link>
            </div>

            {/* Core Features list */}
            <div className="grid gap-4 sm:grid-cols-2 pt-4">
              {[
                { icon: LuUsers, label: "Community & Channel Chats" },
                { icon: LuShieldCheck, label: "Secure Authentication Guards" },
                { icon: LuMessageSquare, label: "Pulsing WebSocket Latencies" },
                { icon: LuSparkles, label: "Interactive Theme Engine" },
              ].map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div 
                    key={feature.label} 
                    className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface/20 p-4 transition-all hover:bg-surface/45 hover:border-border-hover duration-300"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10 transition-all duration-500">
                      <FeatureIcon className="h-4 w-4" />
                    </span>
                    <p className="text-xs text-text-primary font-bold tracking-wide">{feature.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Right Hero Content: Theme Accent Sandbox & Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Mock Chat Preview Container */}
            <div className="rounded-3xl border border-border bg-surface/50 backdrop-blur-xl p-6 shadow-2xl space-y-4 border-white/[0.04] text-left relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-border/55 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary transition-all duration-500">
                    CY
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">ChatYou Sandbox</span>
                    <span className="text-[9px] text-emerald-500 font-extrabold tracking-wider uppercase animate-pulse">active workspace</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 border border-primary/10 text-[9px] font-extrabold text-primary px-2.5 py-0.5 rounded-full transition-all duration-500">
                  <LuCpu size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                  <span>&lt; 10ms</span>
                </div>
              </div>

              {/* Chat message streams */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-start">
                  <div className="bg-bg-primary border border-border text-text-primary px-3 py-2 rounded-2xl rounded-bl-none text-[10px] font-semibold leading-relaxed shadow-sm max-w-[85%]">
                    Hey! Click the color accents below to test out the live theme engine.
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-primary text-text-inverse px-3 py-2 rounded-2xl rounded-br-none text-[10px] font-bold leading-relaxed shadow-md max-w-[85%] transition-all duration-500">
                    Whoa! The whole page instantly adapts its borders, accents, and glows!
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox Controls panel */}
            <div className="rounded-3xl border border-border bg-surface/30 backdrop-blur-md p-6 shadow-xl space-y-4 text-left border-white/[0.04]">
              <div className="flex items-center gap-2">
                <LuPalette className="text-primary h-4 w-4 animate-bounce transition-colors duration-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
                  Live Theme Customizer
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {themeAccents.map((accent) => {
                  const isActive = theme === accent.name;
                  return (
                    <button
                      key={accent.name}
                      onClick={() => setTheme(accent.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 relative overflow-hidden group hover:scale-[1.03] ${
                        isActive
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/20 shadow-md'
                          : 'border-border bg-bg-primary/20 hover:border-border-hover'
                      }`}
                    >
                      {/* Color circle */}
                      <span 
                        style={{ backgroundColor: accent.accent }} 
                        className="w-4 h-4 rounded-full border border-white/10 shadow-inner"
                      />
                      <span className="text-[9px] font-bold text-text-primary text-center truncate w-full">
                        {accent.label}
                      </span>
                      {isActive && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      
    </main>
  );
}
