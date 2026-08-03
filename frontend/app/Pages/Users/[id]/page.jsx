'use client';

import { AuthContext } from '@/app/Context/AuthContext';
import Image from 'next/image';
import React, { useContext } from 'react';

const User = ({ params }) => {
  const { id } = params;
  const { allUsers } = useContext(AuthContext);
  const user = allUsers?.find((u) => u._id === id);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary shadow-lg bg-bg-secondary">
              <Image
                src={user?.profilePic?.url || '/default-avatar.png'}
                alt="profile_img"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight">{user?.username}</h1>
              <p className="text-xs font-bold text-primary mt-0.5">{user?.profileName ? `@${user.profileName}` : 'No profile handle'}</p>
            </div>
            <p className="max-w-xl text-xs text-text-secondary font-semibold leading-relaxed">
              {user?.description || 'No description added yet.'}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 text-left">
            <div className="rounded-2xl border border-border bg-bg-primary/40 p-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary border-b border-border pb-2">Account details</h2>
              <div className="space-y-2 text-xs text-text-secondary font-semibold">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Member Since</span>
                  <span className="font-bold text-text-primary">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification Status</span>
                  <span className={`font-bold ${user?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-primary/40 p-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary border-b border-border pb-2">Community Profile</h2>
              <div className="space-y-2 text-xs text-text-secondary font-semibold">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Role</span>
                  <span className="font-bold text-text-primary">{user?.isAdmin ? 'Admin' : 'Member'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visibility</span>
                  <span className="font-bold text-text-primary">{user?.isPrivate ? 'Private' : 'Open'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;