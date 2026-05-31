'use client';

import { AuthContext } from '@/app/Context/AuthContext';
import Image from 'next/image';
import Logo from '@/app/Components/Logo';
import React, { useContext, useState } from 'react';
import { IoIosCamera } from 'react-icons/io';
import ProfileUpdateForm from '@/app/Components/ProfileUpdateForm';
import PasswordUpdateForm from '@/app/Components/PasswordUpdateForm';

const Profile = () => {
  const [image, setImage] = useState(null);
  const { authUser, updateProfilePhoto } = useContext(AuthContext);
  const [show, setShow] = useState(false);

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
    <div className="min-h-screen bg-bg-primary text-text-primary py-12 transition-all duration-300">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Banner/Header Block */}
        <div className="mb-8 flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-6 shadow-md">
          <div className="flex items-center gap-3">
            <Logo compact />
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Profile Dashboard</h1>
              <p className="text-xs text-text-secondary font-medium mt-0.5">A premium place to manage your identity, security, and personal presence.</p>
            </div>
          </div>
        </div>

        {/* Content columns */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.5fr] text-left">
          
          {/* Main profile form card */}
          <div className="rounded-[28px] border border-border bg-surface p-8 shadow-xl">
            <div className="flex flex-col items-center gap-6 text-center border-b border-border pb-8 mb-8">
              <div className="relative">
                <input
                  id="image"
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-primary/20 hover:border-primary transition duration-300">
                    <Image
                      src={authUser?.profilePic?.url || '/default-avatar.png'}
                      alt="profile_img"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 rounded-full bg-primary p-2 text-text-inverse shadow-md">
                      <IoIosCamera size={20} />
                    </div>
                  </div>
                </label>
              </div>
              
              <div>
                <h1 className="text-2xl font-extrabold text-text-primary">{authUser?.username}</h1>
                <p className="text-xs text-text-muted font-bold mt-0.5">{authUser?.profileName ? `@${authUser.profileName}` : 'Profile name not set'}</p>
              </div>
              <p className="max-w-xl text-sm text-text-secondary font-medium leading-relaxed">
                {authUser?.description || 'No description added yet. Tell us something about yourself!'}
              </p>
            </div>

            <div className="space-y-8">
              {/* Profile Details Edit */}
              <div className="space-y-4 rounded-2xl border border-border bg-bg-primary/40 p-6 shadow-inner">
                <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Edit Profile Details</h2>
                <ProfileUpdateForm />
              </div>

              {/* Informational Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-bg-primary/40 p-6">
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Account Information</h2>
                  <div className="mt-4 space-y-3.5 text-xs text-text-secondary font-semibold">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span>Account since</span>
                      <span className="text-text-primary font-bold">{authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="text-success font-bold">Active</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-bg-primary/40 p-6">
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Account Security</h2>
                  <div className="mt-4 space-y-3.5 text-xs text-text-secondary font-semibold">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span>Password</span>
                      <span className="text-text-primary font-bold">********</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Two-factor Auth</span>
                      <span className="text-success font-bold">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShow(true)} 
              className="mt-8 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 text-xs font-bold text-text-inverse shadow-md transition duration-300 active:scale-95"
            >
              Change Password
            </button>
            {show && <PasswordUpdateForm show={show} setShow={setShow} />}
          </div>

          {/* Right sidebar meta placeholder */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-md text-left">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-muted mb-3">Premium Member</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Thank you for joining ChatYou! Explore groups, configure customizable themes, and synchronize instant messages globally.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
