'use client'
import { AuthContext } from '@/app/Context/AuthContext'
import Image from 'next/image'
import React, { useContext, useEffect } from 'react'

const User = ({ params }) => {
  const { id } = params
  const { allUsers } = useContext(AuthContext)
  const user = allUsers?.find((user) => user._id === id)
  useEffect(() => {
    console.log(user)
  }, [user])
  return (
    <div className='min-h-screen bg-bg text-text py-12'>
    <div className='max-w-5xl mx-auto px-4'>
      <div className='mx-auto max-w-3xl rounded-[32px] border border-custom bg-card-custom p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl'>
        <div className='flex flex-col items-center gap-6 text-center'>
          <div className='relative h-40 w-40 overflow-hidden rounded-full border-4 border-primary'>
            <Image
              src={user?.profilePic?.url || '/default-avatar.png'}
              alt='profile_img'
              fill
              className='object-cover'
            />
          </div>
          <h1 className='text-3xl font-semibold text-text-active'>{user?.username}</h1>
          <p className='text-sm text-muted'>{user?.profileName ? `@${user.profileName}` : 'No profile handle set'}</p>
          <p className='max-w-2xl text-sm text-slate-400'>
            {user?.description || 'No description added yet. Tell us something about yourself!'}
          </p>
        </div>
        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          <div className='rounded-3xl border border-white/10 bg-slate-950/80 p-6'>
            <h2 className='text-lg font-semibold text-text-active'>Account details</h2>
            <div className='mt-4 space-y-3 text-sm text-slate-400'>
              <div className='flex justify-between border-b border-white/10 pb-3'>
                <span>Joined</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              </div>
              <div className='flex justify-between'>
                <span>Status</span>
                <span className={user?.isVerified ? 'text-emerald-400' : 'text-amber-400'}>{user?.isVerified ? 'Verified' : 'Not verified'}</span>
              </div>
            </div>
          </div>
          <div className='rounded-3xl border border-white/10 bg-slate-950/80 p-6'>
            <h2 className='text-lg font-semibold text-text-active'>Community snapshot</h2>
            <div className='mt-4 space-y-3 text-sm text-slate-400'>
              <div className='flex justify-between border-b border-white/10 pb-3'>
                <span>Role</span>
                <span>{user?.isAdmin ? 'Admin' : 'Member'}</span>
              </div>
              <div className='flex justify-between'>
                <span>Visibility</span>
                <span>{user?.isPrivate ? 'Private' : 'Open'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default User