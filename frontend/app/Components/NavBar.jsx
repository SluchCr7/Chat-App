'use client'
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { CiSettings } from "react-icons/ci";
import { FaLock, FaUser, FaUserShield } from "react-icons/fa";
import { CiLogout, CiUser } from "react-icons/ci";
import { AuthContext } from '../Context/AuthContext';
import { IoIosNotificationsOutline } from "react-icons/io";
import NotificationComponent from './NotificationComponent';
import Logo from './Logo'

const NavBar = ({showMenu, setShowMenu, showNotification, setShowNotification}) => {
  const {authUser, logout, socketStatus} = useContext(AuthContext)
  return (
    <nav className="flex items-center justify-between w-full py-4 px-8 border-b border-border bg-bg-navbar shadow-sm transition-all duration-300">
      <div className="flex items-center gap-1">
        <Logo compact />
        {authUser && (
          <div className="ml-3 flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 text-xs font-semibold shadow-inner transition-all duration-300">
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
              socketStatus === "connected" 
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                : socketStatus === "connecting" 
                  ? "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" 
                  : "bg-rose-500 shadow-[0_0_8px_#ef4444]"
            }`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              socketStatus === "connected" 
                ? "text-emerald-500" 
                : socketStatus === "connecting" 
                  ? "text-amber-500 animate-pulse" 
                  : "text-rose-500 animate-bounce"
            }`}>
              {socketStatus === "connected" 
                ? "Online" 
                : socketStatus === "connecting" 
                  ? "Connecting" 
                  : "Offline"}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3.5 relative">
        {authUser?.isAdmin && (
          <Link 
            href={"/Pages/Admin"} 
            title="Admin Dashboard"
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:text-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center"
          >
            <FaUserShield className="text-lg" />
          </Link>
        )}
        <Link 
          href={"/Pages/Setting"} 
          title="App Settings"
          className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 flex items-center justify-center"
        >
          <CiSettings className="text-xl" />
        </Link>
        {
          authUser && 
            <div className="flex items-center gap-3.5">
              <Link 
                href={"/Pages/Profile"} 
                title="Your Profile"
                className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 flex items-center justify-center"
              >
                <CiUser className="text-xl font-bold" />
              </Link>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                title="Notifications"
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center relative ${
                  showMenu 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <IoIosNotificationsOutline className="text-xl" />
              </button>
              <button 
                onClick={logout} 
                title="Logout"
                className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-rose-500 hover:text-rose-600 shadow-sm transition-all duration-300 flex items-center justify-center"
              >
                <CiLogout className="text-xl font-bold" />
              </button>
              <NotificationComponent 
                showNotification={showNotification} 
                setShowNotification={setShowNotification} 
                showMenu={showMenu} 
                setShowMenu={setShowMenu} 
              />
            </div>
        }
      </div>
    </nav>
  )
}

export default NavBar