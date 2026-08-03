'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  IoIosCamera, 
  IoMdKey, 
  IoMdInformationCircle
} from 'react-icons/io';
import { FaCalendarAlt, FaToggleOn, FaShieldAlt } from 'react-icons/fa';
import { AuthContext } from '@/app/Context/AuthContext';
import Logo from '@/app/Components/Logo';
import ProfileUpdateForm from '@/app/Components/ProfileUpdateForm';
import PasswordUpdateForm from '@/app/Components/PasswordUpdateForm';

const Profile = () => {
  const [image, setImage] = useState(null);
  const { authUser, updateProfilePhoto } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setImage(reader.result);
      await updateProfilePhoto(file);
    };
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 px-4 sm:px-6 transition-all duration-300 relative">
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl space-y-6 relative z-10">
        
        {/* Banner/Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2 rounded-3xl border border-border bg-surface/60 backdrop-blur-md p-6 shadow-sm text-left"
        >
          <div className="flex items-center gap-3">
            <Logo compact />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Account Dashboard</h1>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">
                Manage your profile identity, avatar photo, and security credentials.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content columns */}
        <div className="grid gap-6 lg:grid-cols-12 items-start text-left">
          
          {/* Main profile form card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            
            {/* Cover Photo Banner Mockup */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 border-b border-border/20" />

            <div className="flex flex-col items-center gap-3 text-center pb-6 border-b border-border relative z-10 pt-12">
              
              {/* Avatar Upload */}
              <div className="relative">
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer group block">
                  <div className="relative h-24 w-24 rounded-full border-4 border-surface overflow-hidden shadow-xl transition group-hover:scale-105 bg-bg-secondary">
                    <Image
                      src={image || authUser?.profilePic?.url || '/default-avatar.png'}
                      alt="profile_img"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <IoIosCamera size={24} />
                    </div>
                  </div>
                </label>
              </div>
              
              {/* Profile info */}
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-text-primary tracking-tight">{authUser?.username || 'User Name'}</h2>
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  {authUser?.profileName ? `@${authUser.profileName}` : '@username'}
                </p>
              </div>

              {authUser?.description && (
                <p className="max-w-md text-xs text-text-secondary font-semibold leading-relaxed mt-1 bg-bg-primary/40 border border-border/50 px-4 py-2 rounded-2xl">
                  {authUser.description}
                </p>
              )}
            </div>

            {/* Profile Update Form */}
            <div className="mt-6 space-y-4">
              <div className="space-y-4 rounded-2xl border border-border bg-bg-primary/30 p-5">
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-3">
                  <IoMdInformationCircle size={14} className="text-primary" />
                  Personal Information
                </h3>
                <ProfileUpdateForm />
              </div>
            </div>

          </motion.div>

          {/* Right sidebar metrics column */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            
            {/* Account Details card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-md space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border pb-3">
                <FaShieldAlt className="text-primary" size={12} />
                Security & Metrics
              </h3>
              
              <div className="space-y-3 text-xs text-text-secondary font-semibold">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-text-muted" size={12} />
                    <span>Member Since</span>
                  </span>
                  <span className="text-text-primary font-bold">
                    {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2">
                    <FaToggleOn className="text-text-muted" size={14} />
                    <span>Account Status</span>
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black text-[10px] text-emerald-500 uppercase tracking-wide">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FaShieldAlt className="text-text-muted" size={14} />
                    <span>Identity Status</span>
                  </span>
                  <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-black text-[10px] text-primary uppercase tracking-wide">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-md space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border pb-3">
                <IoMdKey className="text-primary" size={14} />
                Security Options
              </h3>
              
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Update account security options. Changing your password will invalidate active local workspace sessions.
              </p>

              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="w-full mt-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-text-inverse px-4 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm"
              >
                Change password
              </button>
            </div>

          </motion.div>

        </div>
      </div>

      <PasswordUpdateForm show={showPasswordModal} setShow={setShowPasswordModal} />
    </div>
  );
};

export default Profile;
