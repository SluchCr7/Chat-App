'use client';

import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { LuSparkles, LuShieldCheck, LuZap, LuUsers } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { AuthContext } from '@/app/Context/AuthContext';
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';

const LoginPage = () => {
  const { login, authUser } = useContext(AuthContext);
  const router = useRouter();
  const [user, setUser] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authUser) {
      router.push('/');
    }
  }, [authUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!user.password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(user.email.trim(), user.password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-all duration-300 relative flex items-center justify-center overflow-hidden py-10 px-4 sm:px-6 lg:px-8 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch relative z-10"
      >
        
        {/* Left Side Form Container */}
        <div className="rounded-3xl border border-border bg-surface/80 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between text-left">
          
          <div>
            {/* Header / Logo */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <Logo />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                  <LuSparkles size={12} />
                  <span>Next-Gen Chat</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-text-secondary font-medium leading-relaxed mt-1">
                  Sign in to access your workspace, encrypted channels, and team conversations.
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block pl-0.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-3.5 transition duration-200 shadow-inner">
                  <MdEmail className="text-text-muted text-base shrink-0" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/60 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-0.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                    Password
                  </label>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-3.5 transition duration-200 shadow-inner">
                  <FaLock className="text-text-muted text-sm shrink-0" />
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="Enter security password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/60 text-xs font-semibold"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShow(!show)} 
                    className="text-text-muted transition hover:text-text-primary focus:outline-none p-1"
                    title={show ? "Hide password" : "Show password"}
                  >
                    {show ? <BiSolidHide size={18} /> : <BiSolidShow size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] px-5 py-4 text-xs font-black text-text-inverse uppercase tracking-widest shadow-lg shadow-primary/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Workspace</span>
                )}
              </button>
            </form>
          </div>

          {/* Quick Feature Badges & Footer CTA */}
          <div className="pt-8 mt-6 border-t border-border/50 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-text-muted">
              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-surface/50 border border-border/40">
                <LuShieldCheck className="text-emerald-500 text-xs" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-surface/50 border border-border/40">
                <LuZap className="text-amber-500 text-xs" />
                <span>Real-time</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-surface/50 border border-border/40">
                <LuUsers className="text-primary text-xs" />
                <span>Channels</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-text-muted font-semibold">
                Don’t have an account?{' '}
                <Link className="font-black text-primary hover:underline transition ml-1" href="/Pages/Register">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

        </div>

        {/* Right Side Showcase Column */}
        <div className="rounded-3xl border border-border bg-surface/30 backdrop-blur-xl shadow-xl overflow-hidden hidden lg:block min-h-[520px]">
          <AuthImagePattern
            title="ChatYou Professional Workspace"
            subtitle="Connect with friends, build private or public group networks, share media, and customize appearance in a real-time messaging platform."
          />
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
