'use client';

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLock, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { AuthContext } from '@/app/Context/AuthContext';
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';

const RegisterPage = () => {
  const [user, setUser] = useState({ email: '', password: '', username: '', profileName: '' });
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password || !user.username || !user.profileName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(user.email, user.password, user.username, user.profileName);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-all duration-300 relative flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient glowing backdrop elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        
        {/* Left Side Pattern Column */}
        <div className="rounded-[32px] border border-border bg-surface/30 backdrop-blur-xl shadow-xl overflow-hidden border-white/[0.04] order-2 lg:order-1">
          <AuthImagePattern
            title="Join our digital workspace"
            subtitle="Create your secure profile, set customized chat screens, and connect with friends or groups instantly."
          />
        </div>

        {/* Right Side Signup Form Container */}
        <div className="rounded-[32px] border border-border bg-surface/50 backdrop-blur-xl p-8 sm:p-12 shadow-2xl flex flex-col justify-center border-white/[0.04] order-1 lg:order-2">
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-2.5 shadow-inner">
              <Logo compact />
              <div className="text-left leading-tight">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">Create your account</h1>
                <p className="text-[10px] text-text-secondary font-bold tracking-wide mt-0.5 uppercase">Registration portal</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary font-medium leading-relaxed text-left max-w-sm pl-1">
              Start your ChatYou journey, customize themes, and access instantly synced rooms and direct messages.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block pl-1">Email Address</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block pl-1">Password</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
                <FaLock className="text-text-muted text-xs" />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Create secure password"
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

            {/* Display Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block pl-1">Display Name</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
                <FaUser className="text-text-muted text-xs" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/65 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Profile username @ handle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block pl-1">Profile Name (Handle)</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg-primary/45 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
                <span className="text-text-muted text-sm font-extrabold select-none pl-0.5">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={user.profileName}
                  onChange={(e) => setUser({ ...user, profileName: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted/65 text-sm font-semibold"
                />
              </div>
              <p className="text-[9px] text-text-muted font-bold pl-1 mt-0.5">Unique ID for handles, tags, and search.</p>
            </div>

            {/* Register Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className="w-full mt-4 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3.5 text-xs font-extrabold text-text-inverse uppercase tracking-widest shadow-lg shadow-primary/15 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </motion.button>

            {/* Link to Login */}
            <div className="pt-2 text-center">
              <p className="text-xs text-text-muted font-semibold">
                Already have an account?{' '}
                <Link className="font-extrabold text-primary hover:underline hover:text-primary-hover" href="/Pages/Login">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

      </motion.div>
    </div>
  );
};

export default RegisterPage;
