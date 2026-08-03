'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoPersonOutline, 
  IoNotificationsOutline 
} from "react-icons/io5";
import { FaUserShield } from "react-icons/fa6";
import { AuthContext } from '../Context/AuthContext';
import { NotifyContext } from '../Context/NotifyContext';
import NotificationComponent from './NotificationComponent';

const NavBar = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { authUser, logout, socketStatus } = useContext(AuthContext);
  const { notifications } = useContext(NotifyContext) || { notifications: [] };
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Socket status configuration
  const statusConfig = {
    connected: { dot: "bg-emerald-500 ring-emerald-500/20", text: "text-emerald-500", label: "Online" },
    connecting: { dot: "bg-amber-500 animate-pulse ring-amber-500/20", text: "text-amber-500", label: "Syncing" },
    disconnected: { dot: "bg-rose-500 ring-rose-500/20", text: "text-rose-500", label: "Offline" }
  };

  const currentStatus = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <header className="w-full h-14 min-h-[56px] px-5 border-b border-border bg-bg-navbar/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between transition-all duration-300">
      
      {/* Left Column: Brand & Socket Connection Indicator */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png" 
              alt="ChatYou Logo" 
              width={32} 
              height={32} 
              className="rounded-[10px] object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-extrabold text-sm text-text-primary tracking-tight">ChatYou</span>
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold mt-0.5">Workspace</span>
          </div>
        </Link>

        {authUser && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-surface/60 text-[10px] font-bold tracking-wide transition-all duration-300">
            <span className={`w-2 h-2 rounded-full ring-4 ${currentStatus.dot}`} />
            <span className={currentStatus.text}>
              {currentStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Right Column: Actions & User Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 relative">
        
        {/* Admin Dashboard Launcher */}
        {authUser?.isAdmin && (
          <Link 
            href="/Pages/Admin" 
            title="Admin Dashboard"
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 flex items-center justify-center"
          >
            <FaUserShield className="text-sm" />
          </Link>
        )}

        {/* Settings button */}
        <Link 
          href="/Pages/Setting" 
          title="Appearance & Settings"
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent hover:border-border transition-all duration-200 flex items-center justify-center"
        >
          <IoSettingsOutline className="text-base" />
        </Link>

        {authUser && (
          <div className="flex items-center gap-1.5">
            
            {/* User Profile */}
            <Link 
              href="/Pages/Profile" 
              title="My Account Profile"
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent hover:border-border transition-all duration-200 flex items-center justify-center"
            >
              <IoPersonOutline className="text-base" />
            </Link>

            {/* Notifications Popover */}
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              title="Notifications"
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center relative ${
                showMenu 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border-transparent hover:border-border"
              }`}
            >
              <IoNotificationsOutline className="text-base" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-text-inverse text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Separator Divider */}
            <div className="h-4 w-[1px] bg-border mx-1" />

            {/* Logout button */}
            <button 
              onClick={logout} 
              title="Sign out of account"
              className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 flex items-center justify-center"
            >
              <IoLogOutOutline className="text-base" />
            </button>

            {/* Notifications Dropdown Component */}
            <NotificationComponent 
              showNotification={showNotification} 
              setShowNotification={setShowNotification} 
              showMenu={showMenu} 
              setShowMenu={setShowMenu} 
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(NavBar);