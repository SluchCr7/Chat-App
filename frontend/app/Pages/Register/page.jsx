'use client'
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaLock, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BiSolidShow } from "react-icons/bi";
import { BiSolidHide } from "react-icons/bi";
import { LuMessageSquare } from "react-icons/lu";
import { AuthContext } from '@/app/Context/AuthContext';

const Page = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    Name : ""
  });
  const [show, setShow] = useState(false)
  // const { signup } = useAuthStore()
  const {register} = useContext(AuthContext)
  const handleRegister = (e) => {
    e.preventDefault();
    if(user.email && user.password && user.Name){
      register(user.email , user.password , user.Name);
    }
    else {
      console.log("Please Fill All The Fields")
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen w-full text-white'>
      {/* Right Side - Background with Gradient */}
      <div className='hidden md:flex w-1/2 min-h-[100vh] bg-gradient-to-b from-base-100 to-base-300 items-center justify-center'>
        <AuthImagePattern title={'Join To our Community'} subtitle={'Connect with Frinds and , share photos and videos and memories'} />
      </div>
      {/* Left Side - Login Form */}
      <div className='w-full md:w-1/2 flex flex-col items-center p-8 gap-6'>
        <div className='flex items-center flex-col gap-2'>
          <span className='text-4xl bg-white text-black rounded-full p-3'>
            <LuMessageSquare />
          </span>
          <h1 className='text-2xl font-bold text-red-600 uppercase'>Register</h1>
        </div>
        
        <form onSubmit={(e)=> handleRegister(e)} className='flex flex-col w-full md:w-2/3 gap-5'>
          <div className='relative'>
            <label className='block text-gray-300 mb-1'>Email</label>
            <div className='flex items-center border border-gray-500 p-2 rounded-md bg-gray-800'>
              <MdEmail className='text-gray-400 mx-2' />
              <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} type="email" placeholder='Enter your email' className='w-full bg-transparent outline-none text-white' />
            </div>
          </div>

          <div className='relative'>
            <label className='block text-gray-300 mb-1'>Password</label>
            <div className='flex items-center border border-gray-500 p-2 rounded-md bg-gray-800'>
              <FaLock className='text-gray-400 mx-2' />
              <input 
              value={user.password} 
              onChange={(e) => setUser({ ...user, password: e.target.value })} 
              type={show ? "text" : "password"} placeholder='Enter your password' className='w-full bg-transparent outline-none text-white' />
                {
                  show ?
                  <BiSolidShow className='text-gray-400 mx-2 cursor-pointer' onClick={() => setShow(false)} />
                  :
                  <BiSolidHide className='text-gray-400 mx-2 cursor-pointer' onClick={() => setShow(true)} />
                }
            </div>
          </div>

          <div className='relative'>
            <label className='block text-gray-300 mb-1'>Full Name</label>
            <div className='flex items-center border border-gray-500 p-2 rounded-md bg-gray-800'>
              <FaUser className='text-gray-400 mx-2' />
              <input value={user.Name} onChange={(e) => setUser({ ...user, Name: e.target.value })} type="text" placeholder='Enter your Name' className='w-full bg-transparent outline-none text-white' />
            </div>
          </div>
          <button className='bg-red-600 w-full p-3 rounded-md hover:bg-red-700 transition font-semibold'>Register</button>
          <p className='text-sm text-gray-400'>Have an Account? <Link className='text-blue-500 hover:underline' href="/Pages/Login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}

export default Page;
