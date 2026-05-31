'use client';

import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '@/app/Context/AuthContext';

const Page = () => {
  const { login } = useContext(AuthContext);
  const [user, setUser] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user.email) {
      toast.error('Please enter your email');
      return;
    }
    if (!user.password) {
      toast.error('Please enter your password');
      return;
    }
    login(user.email, user.password);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-all duration-300">
      <ToastContainer />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col-reverse lg:flex-row items-center justify-center gap-10 px-6 py-12">
        
        {/* Left Side Form */}
        <div className="w-full lg:w-1/2 rounded-[28px] border border-border bg-surface p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-3 shadow-inner">
              <Logo compact />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Sign in to ChatYou</h1>
                <p className="mt-1 max-w-md text-xs text-text-secondary font-medium leading-relaxed">
                  Access your conversations, communities, and instant replies in one polished workspace.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary focus-within:border-primary px-4 py-3 transition duration-300">
                <MdEmail className="text-text-muted" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Password</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary focus-within:border-primary px-4 py-3 transition duration-300">
                <FaLock className="text-text-muted" />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter your security password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-medium"
                />
                <button type="button" onClick={() => setShow(!show)} className="text-text-muted transition hover:text-primary">
                  {show ? <BiSolidHide /> : <BiSolidShow />}
                </button>
              </div>
            </div>

            <button className="w-full rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-bold text-text-inverse shadow-md transition duration-300 active:scale-95">
              Login
            </button>

            <p className="text-xs text-text-muted font-bold text-center">
              Don’t have an account yet?{' '}
              <Link className="font-extrabold text-primary hover:text-primary-hover" href="/Pages/Register">
                Create one
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side Pattern */}
        <div className="w-full lg:w-1/2">
          <div className="rounded-[28px] border border-border bg-surface p-8 shadow-xl">
            <AuthImagePattern
              title="Join the ChatYou network"
              subtitle="Share messages, build groups, and connect with your people in a premium digital lounge."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
