"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LuMessageSquare, LuUsers, LuSparkles, LuShieldCheck } from "react-icons/lu";
import Logo from "./Logo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary overflow-hidden relative">
      {/* Visual ambient backdrop glow */}
      <div className="absolute inset-0 opacity-20 blur-3xl bg-[radial-gradient(circle_at_top,_var(--primary),_transparent_35%),radial-gradient(circle_at_bottom_right,_var(--accent),_transparent_30%)] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] items-center">
          
          {/* Brand Intro Column */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-surface border border-border px-4 py-2 shadow-sm">
              <Logo compact />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">A fresh, professional chat network</span>
            </div>

            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-6.5xl font-extrabold tracking-tight text-text-primary leading-tight">
                Chat smarter, collaborate faster.
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl font-medium leading-relaxed">
                ChatYou brings modern messaging UI, live direct/group conversations, and secure workspace collaboration into a premium experience built for professional communities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <Link 
                href="/Pages/Register" 
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-sm font-bold text-text-inverse shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Create Account
              </Link>
              <Link 
                href="/Pages/Login" 
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-hover px-6 py-3.5 text-sm font-bold text-text-primary transition-all duration-300 shadow-sm hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </div>

            {/* Feature lists grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: LuUsers, label: "Community-first Group Chats" },
                { icon: LuShieldCheck, label: "Secure JWT & Cookie Protection" },
                { icon: LuMessageSquare, label: "Fast Real-Time WebSockets" },
                { icon: LuSparkles, label: "Premium Customizable Themes" },
              ].map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.label} className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface/40 p-4 transition hover:bg-surface-hover hover:border-border-hover duration-300">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                      <FeatureIcon className="h-5 w-5" />
                    </span>
                    <p className="text-xs text-text-primary font-bold tracking-wide">{feature.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Right Visual elevations card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-3xl border border-border bg-surface p-8 shadow-xl text-left"
          >
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl bg-bg-primary/50 p-5 border border-border/80 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Workspace Monitor</p>
                    <h2 className="mt-2 text-xl font-bold text-text-primary leading-tight">Your modern connection hub</h2>
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary">Instant</span>
                </div>
                <div className="mt-5 space-y-3.5 text-xs text-text-secondary font-medium leading-relaxed">
                  <p>Organize discussions into channels, exchange images, videos, audio notes, and secure PDF/ZIP documents in real-time.</p>
                  <p>Experience custom profiles, live typing alerts, and read seen checkmarks built on top of robust socket gateways.</p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-5 hover:border-border-hover transition duration-300">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Communities</p>
                  <p className="mt-3 text-3xl font-extrabold text-text-primary tracking-tight">Active</p>
                  <p className="mt-1 text-xs text-text-secondary font-semibold">Join public groups or request access to private rooms.</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5 hover:border-border-hover transition duration-300">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Latency Hub</p>
                  <p className="mt-3 text-3xl font-extrabold text-text-primary tracking-tight">&lt; 10ms</p>
                  <p className="mt-1 text-xs text-text-secondary font-semibold">Blazing fast WebSockets ensure seamless instant messages.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
