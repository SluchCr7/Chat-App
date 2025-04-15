'use client'
import { AuthContext } from '@/app/Context/AuthContext'
import Image from 'next/image'
import React, { useContext, useState } from 'react'
import { IoIosCamera } from 'react-icons/io'
import ProfileUpdateForm from '@/app/Components/ProfileUpdateForm'
import PasswordUpdateForm from '@/app/Components/PasswordUpdateForm'

const Profile = () => {
  const [image, setImage] = useState(null)
  const { authUser , updateProfilePhoto,updatePassword ,handleUpdateProfile } = useContext(AuthContext)
  const [show, setShow] = useState(false)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [profileName, setProfileName] = useState('')
  const [description , setDescription] = useState('')
  const [password, setPassword] = useState('')
  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async() => {
      setImage(reader.result)
      await updateProfilePhoto(file)
    }
  }

  return (
    <div className='min-h-screen w-full py-10 bg-[#0f0f0f] text-white'>
      <div className='max-w-5xl mx-auto px-4'>
        <div className='flex flex-col items-center gap-6 py-10'>
        <div className='relative group'>
        <input
          id='image'
          type='file'
          className='hidden'
          onChange={handleInputChange}
          accept='image/*'
        />
        <label htmlFor='image' className='cursor-pointer'>
          <div className='relative w-40 h-40'>
            <Image
              src={authUser?.profilePic?.url}
              alt='profile_img'
              layout='fill'
              objectFit='cover'
              className='rounded-full border-4 border-primary'
            />
            <div className='absolute bottom-3 right-3 bg-white text-black rounded-full p-2'>
              <IoIosCamera size={24} />
            </div>
          </div>
        </label>
          </div>

          <h1 className='text-2xl font-bold text-primary'>{authUser?.username} <span className='text-gray-400'>({authUser?.profileName})</span></h1>
          <p className='text-center text-sm text-gray-400 max-w-xl'>
            {authUser?.description || 'No description added yet. Tell us something about yourself!'}
          </p>
        </div>

        <div className='bg-[#1a1a1a] p-6 rounded-xl shadow-md mb-10'>
          <h2 className='text-xl font-semibold mb-4 text-primary'>Edit Profile</h2>
          <ProfileUpdateForm />
        </div>

        <div className='bg-[#1a1a1a] p-6 rounded-xl shadow-md mb-10'>
          <h2 className='text-xl font-semibold mb-4 text-primary'>Account Information</h2>
          <div className='flex justify-between text-gray-400 border-b border-gray-600 pb-3 mb-3'>
            <span>Account Since</span>
            <span className='text-white'>{new Date(authUser?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className='flex justify-between text-gray-400'>
            <span>Status</span>
            <span className='text-green-400'>Active</span>
          </div>
        </div>
        <div className='bg-[#1a1a1a] p-6 rounded-xl shadow-md'>
          <h2 className='text-xl font-semibold mb-4 text-primary'>Account Security</h2>
          <div className='flex justify-between text-gray-400 border-b border-gray-600 pb-3 mb-3'>
            <span>Password</span>
            <span className='text-white'>{'**********'}</span>
          </div>
          <div className='flex justify-between text-gray-400'>
            <span>Two-Factor Authentication</span>
            <span className='text-green-400'>Enabled</span>
          </div>
        </div>
        <button onClick={() => setShow(true)} className='bg-primary text-white py-2 px-4 rounded-md mt-4'>Change Password</button>
        {show && <PasswordUpdateForm show={show} setShow={setShow} />}
      </div>
    </div>
  )
}

export default Profile
