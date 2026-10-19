'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/app/Context/AuthContext';
import { MessageContext } from '@/app/Context/MessageContext';
import Avatar from '@/app/Components/Avatar';
import Link from 'next/link';
import { LuShieldCheck, LuMessageSquare, LuCalendar, LuCircleCheck, LuArrowLeft } from 'react-icons/lu';

const User = ({ params }) => {
  const { id } = params;
  const { allUsers = [] } = useContext(AuthContext);
  const { setSelectedUser } = useContext(MessageContext);
  const user = allUsers?.find((u) => u._id === id);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition"
        >
          <LuArrowLeft className="text-sm" /> Back to conversations
        </Link>

        {/* Profile Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar 
              src={user?.profilePic?.url} 
              name={user?.username || 'User'} 
              size={96} 
              isOnline={user?.isOnline} 
              showStatus={true} 
            />

            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight">
                {user?.username || 'User Profile'}
              </h1>
              <p className="text-xs font-bold text-primary mt-0.5">
                {user?.profileName ? `@${user.profileName.replace(/^@/, '')}` : '@handle'}
              </p>
            </div>

            <p className="max-w-md text-xs text-text-secondary font-medium leading-relaxed">
              {user?.description || 'No bio description provided.'}
            </p>

            {user && (
              <button
                onClick={() => setSelectedUser(user)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverse text-xs font-bold shadow-md transition"
              >
                <LuMessageSquare className="text-sm" /> Send Direct Message
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-border bg-bg-primary/50 p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border/60 pb-2">
                Account Details
              </h2>
              <div className="space-y-2 text-xs text-text-secondary font-medium">
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="flex items-center gap-1.5">
                    <LuCalendar size={13} className="text-text-muted" /> Member Since
                  </span>
                  <span className="font-bold text-text-primary">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <LuCircleCheck size={13} className="text-text-muted" /> Verification
                  </span>
                  <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${user?.isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface text-text-muted border border-border'}`}>
                    {user?.isVerified ? 'Verified' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-primary/50 p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-border/60 pb-2">
                Community Status
              </h2>
              <div className="space-y-2 text-xs text-text-secondary font-medium">
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="flex items-center gap-1.5">
                    <LuShieldCheck size={13} className="text-text-muted" /> Role
                  </span>
                  <span className="font-bold text-text-primary">
                    {user?.isAdmin ? 'Administrator' : 'Member'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Space Visibility</span>
                  <span className="font-bold text-text-primary text-[10px] uppercase">
                    {user?.isPrivate ? 'Private Space' : 'Open Space'}
                  </span>
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