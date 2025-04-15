'use client'
import { AuthContext } from '@/app/Context/AuthContext'
import Image from 'next/image'
import React, { useContext, useEffect } from 'react'

const User = ({ params }) => {
  const { id } = params
  const { allUsers } = useContext(AuthContext) 
  const user = allUsers.find(user => user._id === id)
  useEffect(() => {
    console.log(user)
  },[user])
  return (
  <div className='min-h-screen w-full py-10 bg-[#0f0f0f] text-white'>
    <div className='max-w-5xl mx-auto px-4'>
      <div className='flex flex-col items-center gap-6 py-10'>
        <div className='relative group'>
          <div className='relative w-40 h-40'>
            <Image
              src={user?.profilePic?.url}
              alt='profile_img'
              layout='fill'
              objectFit='cover'
              className='rounded-full border-4 border-primary'
            />
          </div>
        </div>

        <h1 className='text-2xl font-bold text-primary'>{user?.username} <span className='text-gray-400'>({user?.profileName})</span></h1>
        <p className='text-center text-sm text-gray-400 max-w-xl'>
          {user?.description || 'No description added yet. Tell us something about yourself!'}
        </p>
      </div>
      <div className='bg-[#1a1a1a] p-6 rounded-xl shadow-md mb-10'>
        <h2 className='text-xl font-semibold mb-4 text-primary'>Account Information</h2>
        <div className='flex justify-between text-gray-400 border-b border-gray-600 pb-3 mb-3'>
          <span>Account Since</span>
          <span className='text-white'>{new Date(user?.createdAt).toLocaleDateString()}</span>
        </div>
        <div className='flex justify-between text-gray-400'>
          <span>Status</span>
            <span className='text-green-400'>{
              user?.isVerified ? 'Verified' : 'Not Verified'
            }
          </span>
        </div>
      </div>
      </div>
    </div>
  )
}

export default User