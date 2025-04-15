'use client'
import React, { useState, useContext } from 'react'
import { AuthContext } from '@/app/Context/AuthContext'

const ProfileUpdateForm = () => {
  const { authUser,updatePassword ,handleUpdateProfile  } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: authUser?.username || '',
    profileName: authUser?.profileName || '',
    description: authUser?.description || '',
  })
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Call update logic here
    handleUpdateProfile(formData.name , formData.profileName , formData.description)
  }

  return (
    <form onSubmit={handleSubmit} className='w-full md:w-[100%] flex flex-col gap-4'>
      <div>
        <label className='text-gray-400 text-sm'>Name</label>
        <input name='name' value={formData.name} onChange={handleChange} className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none' />
      </div>
      <div>
        <label className='text-gray-400 text-sm'>Profile Name</label>
        <input name='profileName' value={formData.profileName} onChange={handleChange} className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none' />
      </div>
      <div>
        <label className='text-gray-400 text-sm'>Description</label>
        <textarea name='description' value={formData.description} onChange={handleChange} rows={4} className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none resize-none' />
      </div>
      <button type='submit' className='bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-80 transition-all duration-300'>
        Save Changes
      </button>
    </form>
  )
}

export default ProfileUpdateForm
