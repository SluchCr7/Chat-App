'use client'
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { CiSettings } from "react-icons/ci";
import { FaLock, FaUser } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { AuthContext } from '../Context/AuthContext';
import { LuMessageSquare } from "react-icons/lu";
import { CiUser } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import NotificationComponent from './NotificationComponent';

const NavBar = ({showMenu , setShowMenu , showNotification , setShowNotification}) => {
  const {authUser , logout} = useContext(AuthContext)
  const [show, setShow] = useState(false)
  return (
    <div className='flex items-center justify-between w-full py-4 px-8'>
      <div className='flex items-center gap-1'>
        <span className='text-white bg-black rounded-full w-8 h-8 justify-center flex items-center'><LuMessageSquare className='text-lg' /></span>
        <Link href={"/"} className='font-bold text-xl uppercase'>ChatYou</Link>
      </div>
      <div className='flex items-center gap-3 relative'>
        <Link href={"/Pages/Setting"}><CiSettings className='text-primary text-2xl' /></Link>
        {
          authUser && 
            <div className='flex items-center gap-3'>
              <Link href={"/Pages/Profile"}><CiUser className='text-primary text-2xl' /></Link>
              <span onClick={() => setShowMenu(!showMenu)} className='text-primary text-2xl'><IoIosNotificationsOutline /></span>
              <span onClick={logout} ><CiLogout className='text-primary text-2xl' /></span>
              <NotificationComponent showNotification={showNotification} setShowNotification={setShowNotification} showMenu={showMenu} setShowMenu={setShowMenu} />
            </div>
        }
      </div>
    </div>
  )
}

export default NavBar