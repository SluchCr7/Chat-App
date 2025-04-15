'use client'
import React, { useContext, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { AuthContext } from '../Context/AuthContext';

const PasswordUpdateForm = ({show , setShow}) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const {updatePassword} = useContext(AuthContext)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    updatePassword(formData.newPassword)
  }

  return (
    <div className={`${show ? 'menu_bg' : ''} w-full`}>          
        <form onSubmit={handleSubmit} className={`w-full md:w-[80%] ${show ? 'flex' : 'hidden'} bg-black shadow p-8 rounded-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex-col gap-4`}>
            <span><IoMdClose className='text-2xl text-white absolute top-4 right-4 cursor-pointer' onClick={() => setShow(false)} /></span>
            <div>
            <label className='text-gray-400 text-sm'>Old Password</label>
            <input
            type='password'
            name='oldPassword'
            value={formData.oldPassword}
            onChange={handleChange}
            className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none'
            />
        </div>
        <div>
            <label className='text-gray-400 text-sm'>New Password</label>
            <input
            type='password'
            name='newPassword'
            value={formData.newPassword}
            onChange={handleChange}
            className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none'
            />
        </div>
        <div>
            <label className='text-gray-400 text-sm'>Confirm New Password</label>
            <input
            type='password'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            className='w-full p-3 bg-transparent text-white border border-gray-600 rounded-md outline-none'
            />
        </div>

        {error && <p className='text-red-500 text-sm'>{error}</p>}
        {success && <p className='text-green-400 text-sm'>{success}</p>}

        <button
            type='submit'
            className='bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-80 transition-all duration-300'
        >
            Update Password
        </button>
        </form>
    </div>
  )
}

export default PasswordUpdateForm
