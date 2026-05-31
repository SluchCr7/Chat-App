'use client';

import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Logo from '@/app/Components/Logo';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiSolidShow, BiSolidHide } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { AuthContext } from '@/app/Context/AuthContext';

const Page = () => {
  const [user, setUser] = useState({ email: '', password: '', Name: '' });
  const [show, setShow] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = (e) => {
    e.preventDefault();
    if (user.email && user.password && user.Name) {
      register(user.email, user.password, user.Name);
      return;
    }
    toast.error('Please fill in all target fields');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-all duration-300">

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col-reverse lg:flex-row items-center justify-center gap-10 px-6 py-12">
        
        {/* Left Side Image Overlay */}
        <div className="w-full lg:w-1/2">
          <div className="rounded-[28px] border border-border bg-surface p-8 shadow-xl">
            <AuthImagePattern
              title="Join our community"
              subtitle="Create your secure profile and start chatting with friends, groups, and teammates instantly."
            />
          </div>
        </div>

        {/* Right Side Signup Form */}
        <div className="w-full lg:w-1/2 rounded-[28px] border border-border bg-surface p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-3 shadow-inner">
              <Logo compact />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Create your account</h1>
                <p className="mt-1 max-w-md text-xs text-text-secondary font-medium leading-relaxed">
                  Get started with ChatYou and access instantly synced communities and conversations.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6 text-left">
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
                  placeholder="Create a strong security password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-medium"
                />
                <button type="button" onClick={() => setShow(!show)} className="text-text-muted transition hover:text-primary">
                  {show ? <BiSolidHide /> : <BiSolidShow />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary focus-within:border-primary px-4 py-3 transition duration-300">
                <FaUser className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={user.Name}
                  onChange={(e) => setUser({ ...user, Name: e.target.value })}
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-medium"
                />
              </div>
            </div>

            <button className="w-full rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-bold text-text-inverse shadow-md transition duration-300 active:scale-95">
              Register
            </button>

            <p className="text-xs text-text-muted font-bold text-center">
              Already have an account?{' '}
              <Link className="font-extrabold text-primary hover:text-primary-hover" href="/Pages/Login">
                Sign in
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Page;
