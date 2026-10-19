'use client';

import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaLock, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { LuSparkles } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { AuthContext } from '@/app/Context/AuthContext';
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';

const RegisterPage = () => {
  const [user, setUser] = useState({ email: '', password: '', username: '', profileName: '' });
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, authUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push('/');
    }
  }, [authUser, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user.email.trim() || !user.password || !user.username.trim() || !user.profileName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(user.email.trim(), user.password, user.username.trim(), user.profileName.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-200 relative flex items-center justify-center overflow-hidden py-10 px-4 sm:px-6 lg:px-8 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch relative z-10"
      >
        
        {/* Left Side Visual Showcase */}
        <div className="rounded-3xl border border-border bg-surface/30 backdrop-blur-xl shadow-xl overflow-hidden hidden lg:block min-h-[580px] order-2 lg:order-1">
          <AuthImagePattern
            title="Join the VYRO Network"
            subtitle="Build your verified profile, participate in encrypted channels, share audio notes, and experience real-time messaging."
          />
        </div>

        {/* Right Side Signup Form Container */}
        <div className="rounded-3xl border border-border bg-surface/90 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between text-left order-1 lg:order-2">
          
          <div>
            {/* Header / Logo */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Logo size="md" />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                  <LuSparkles size={12} />
                  <span>Get Started</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  Create your Account
                </h1>
                <p className="text-xs text-text-secondary font-medium leading-relaxed mt-1">
                  Join VYRO and establish your presence in a modern space for conversations.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block pl-0.5">
                  Display Name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-primary/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-2.5 transition duration-150 shadow-inner">
                  <FaUser className="text-text-muted text-xs shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Profile Handle */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block pl-0.5">
                  Profile Handle
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg-primary/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-2.5 transition duration-150 shadow-inner">
                  <span className="text-text-muted text-xs font-bold select-none shrink-0">@</span>
                  <input
                    type="text"
                    placeholder="handle"
                    value={user.profileName}
                    onChange={(e) => setUser({ ...user, profileName: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block pl-0.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-primary/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-2.5 transition duration-150 shadow-inner">
                  <MdEmail className="text-text-muted text-sm shrink-0" />
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block pl-0.5">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-primary/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-2.5 transition duration-150 shadow-inner">
                  <FaLock className="text-text-muted text-xs shrink-0" />
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShow(!show)} 
                    className="text-text-muted transition hover:text-text-primary focus:outline-none p-1"
                    title={show ? "Hide password" : "Show password"}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <BiSolidHide size={18} /> : <BiSolidShow size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] px-5 py-3.5 text-xs font-black text-text-inverse uppercase tracking-widest shadow-lg shadow-primary/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Free Account</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer CTA */}
          <div className="pt-6 mt-4 border-t border-border/60 text-center">
            <p className="text-xs text-text-muted font-medium">
              Already have an account?{' '}
              <Link className="font-bold text-primary hover:underline transition ml-1" href="/Pages/Login">
                Sign In to VYRO
              </Link>
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default RegisterPage;
