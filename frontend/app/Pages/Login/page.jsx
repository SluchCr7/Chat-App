'use client'
import AuthImagePattern from '@/app/Components/AuthImagePattern';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaLock, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BiSolidShow } from "react-icons/bi";
import { BiSolidHide } from "react-icons/bi";
import { LuMessageSquare } from "react-icons/lu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '@/app/Context/AuthContext';
const Page = () => {
  // const {authUser , logout , login} = useAuthStore()
  const {login} = useContext(AuthContext)
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    if (user.email == "") {
      toast.error("Please enter your email");
    }
    else if (user.password == "") { 
      toast.error("Please enter your password");
    }
    else if (user.email != "" && user.password != "") {
      login(user.email , user.password);
    }
  }
  return (
    <>
      <ToastContainer />
      <div className='flex w-full h-screen text-white'>
        {/* Left Side - Login Form */}
        <div className='w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8'>
          <div className='flex items-center flex-col gap-3'>
            <span className='text-4xl bg-white text-black rounded-full p-3'>
              <LuMessageSquare  />
            </span>
            <h1 className='text-2xl font-bold text-red-600 uppercase'>Login</h1>
          </div>
          
          <form onSubmit={handleSubmit} className='flex flex-col w-full md:w-2/3 gap-6 mt-5'>
            <div className='relative w-full'>
              <label className='block text-gray-300 mb-2'>Email</label>
              <div className='flex items-center border border-gray-600 p-3 rounded-md bg-gray-800'>
                <MdEmail className='text-gray-400 mx-2' />
                <input 
                  type="email" 
                  placeholder='Enter your email' 
                  className='w-full bg-transparent outline-none text-white'
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
            </  div>
              
            <div className='relative w-full'>
              <label className='block text-gray-300 mb-2'>Password</label>
              <div className='flex items-center border border-gray-600 p-3 rounded-md bg-gray-800'>
                <FaLock className='text-gray-400 mx-2' />
                <input 
                  type={show ? "text" : "password"}
                  placeholder='Enter your password' 
                  className='w-full bg-transparent outline-none text-white'
                  value={user.password} 
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
                {
                  show ?
                  <BiSolidShow className='text-gray-400 mx-2 cursor-pointer' onClick={() => setShow(false)} />
                  :
                  <BiSolidHide className='text-gray-400 mx-2 cursor-pointer' onClick={() => setShow(true)} />
                }
              </div>
            </div>
            
            <button  className='bg-red-600 w-full p-3 rounded-md hover:bg-red-700 transition font-semibold'>
              Login
            </button>
            <p className='text-sm text-gray-400'>
              Don`&apos;`t have an account? 
              <Link className='text-blue-500 hover:underline ml-1' href="/Pages/Register">Register</Link>
            </p>
          </form>
        </div>
        
        {/* Right Side - Background with Full Height */}
        <div className='hidden md:flex w-1/2 h-full bg-gradient-to-b from-base-100 to-base-300 items-center justify-center'>
          <AuthImagePattern title={'Join To our Community'} subtitle={'Connect with Frinds and , share photos and videos and memories'} />
        </div>
      </div>
    </>
  );
}

export default Page;
