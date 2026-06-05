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
      toast.error('Please enter your email');
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
      {/* Decorative ambient background blur blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        
        {/* Left Side Form Container */}
        <div className="rounded-[32px] border border-border bg-surface/50 backdrop-blur-xl p-8 sm:p-12 shadow-2xl flex flex-col justify-center border-white/[0.04]">
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-2.5 shadow-inner">
              <Logo compact />
              <div className="text-left leading-tight">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">Sign in to ChatYou</h1>
                <p className="text-[10px] text-text-secondary font-bold tracking-wide mt-0.5 uppercase">Digital Lounge & Workspace</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary font-medium leading-relaxed text-left max-w-sm pl-1">
              Access your global conversations, active communities, and custom settings in one unified dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block pl-1">Email Address</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3.5 transition duration-300 shadow-sm">
                <MdEmail className="text-text-muted text-sm" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/65 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Password</label>
                <Link href="#" className="text-[10px] font-extrabold text-primary hover:underline uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3.5 transition duration-300 shadow-sm">
                <FaLock className="text-text-muted text-xs" />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter security password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/65 text-sm font-semibold"
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
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className="w-full mt-3 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3.5 text-xs font-extrabold text-text-inverse uppercase tracking-widest shadow-lg shadow-primary/15 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Login to Workspace</span>
              )}
            </motion.button>

            {/* Link to Register */}
            <div className="pt-2 text-center">
              <p className="text-xs text-text-muted font-semibold">
                Don’t have an account yet?{' '}
                <Link className="font-extrabold text-primary hover:underline hover:text-primary-hover" href="/Pages/Register">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Side Pattern Column */}
        <div className="rounded-[32px] border border-border bg-surface/30 backdrop-blur-xl shadow-xl overflow-hidden border-white/[0.04]">
          <AuthImagePattern
            title="Join the ChatYou workspace"
            subtitle="Share messages, build group networks, and custom-design your messaging screen in a premium digital lounge."
          />
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
