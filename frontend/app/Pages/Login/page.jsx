'use client';

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { AuthContext } from '@/app/Context/AuthContext';
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [user, setUser] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!user.password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(user.email, user.password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-all duration-300 relative flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient background glow */}
      <div className="absolute top-12 left-12 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        
        {/* Left Side Form Container */}
        <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl flex flex-col justify-center text-left">
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/60 border border-border px-3.5 py-2 shadow-inner">
              <Logo compact />
              <div className="leading-tight">
                <h1 className="text-xl font-black text-text-primary tracking-tight">Sign in to ChatYou</h1>
                <p className="text-[9px] text-text-secondary font-extrabold tracking-widest uppercase">Digital Workspace</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary font-semibold leading-relaxed max-w-sm pl-0.5">
              Access your real-time conversations, communities, and personal appearance settings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider block pl-0.5">Email Address</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary px-3.5 py-3 transition shadow-sm">
                <MdEmail className="text-text-muted text-sm" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/60 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between pl-0.5">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider block">Password</label>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary px-3.5 py-3 transition shadow-sm">
                <FaLock className="text-text-muted text-xs" />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter security password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/60 text-xs font-semibold"
                />
                <button 
                  type="button" 
                  onClick={() => setShow(!show)} 
                  className="text-text-muted transition hover:text-text-primary focus:outline-none"
                >
                  {show ? <BiSolidHide size={16} /> : <BiSolidShow size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-3.5 text-xs font-black text-text-inverse uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Login to Workspace</span>
              )}
            </button>

            {/* Link to Register */}
            <div className="pt-2 text-center">
              <p className="text-xs text-text-muted font-semibold">
                Don’t have an account?{' '}
                <Link className="font-black text-primary hover:underline" href="/Pages/Register">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Side Pattern Column */}
        <div className="rounded-3xl border border-border bg-surface/30 backdrop-blur-xl shadow-xl overflow-hidden">
          <AuthImagePattern
            title="Join ChatYou Workspace"
            subtitle="Share real-time messages, build group networks, and custom-design your messaging screen in a premium SaaS lounge."
          />
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
