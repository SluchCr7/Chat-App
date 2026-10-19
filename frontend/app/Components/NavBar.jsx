'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoPersonOutline, 
  IoNotificationsOutline,
  IoShieldCheckmarkOutline
} from "react-icons/io5";
import { AuthContext } from '../Context/AuthContext';
import { NotifyContext } from '../Context/NotifyContext';
import NotificationComponent from './NotificationComponent';
import Logo from './Logo';

const NavBar = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { authUser, logout, socketStatus } = useContext(AuthContext);
  const { notifications } = useContext(NotifyContext) || { notifications: [] };
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Real-time socket status indicator configuration
  const statusConfig = {
    connected: { 
      dot: "bg-emerald-400 ring-emerald-500/30", 
      text: "text-emerald-400", 
      label: "Live" 
    },
    connecting: { 
      dot: "bg-amber-400 animate-pulse ring-amber-500/30", 
      text: "text-amber-400", 
      label: "Syncing" 
    },
    disconnected: { 
      dot: "bg-rose-400 ring-rose-500/30", 
      text: "text-rose-400", 
      label: "Offline" 
    }
  };

  const currentStatus = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <header className="w-full h-14 min-h-[56px] px-4 sm:px-6 border-b border-border bg-bg-navbar/85 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between transition-colors duration-200">
      
      {/* Brand Identity & Socket Connection Pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/" 
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          aria-label="VYRO Home"
        >
          <Logo size="sm" showTagline={false} />
        </Link>

        {authUser && (
          <div 
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-surface/70 text-[10px] font-semibold tracking-wide transition-all"
            title={`Real-time status: ${currentStatus.label}`}
          >
            <span className={`w-2 h-2 rounded-full ring-2 ${currentStatus.dot}`} />
            <span className={currentStatus.text}>
              {currentStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Actions & Controls */}
      <div className="flex items-center gap-1 sm:gap-2 relative">
        
        {/* Admin Dashboard Launcher */}
        {authUser?.isAdmin && (
          <Link 
            href="/Pages/Admin" 
            title="Admin Console"
            aria-label="Admin Console"
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <IoShieldCheckmarkOutline className="text-lg" />
          </Link>
        )}

        {/* Settings button */}
        <Link 
          href="/Pages/Setting" 
          title="Theme & Preferences"
          aria-label="Theme & Preferences"
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent hover:border-border transition duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IoSettingsOutline className="text-lg" />
        </Link>

        {authUser && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* User Profile */}
            <Link 
              href="/Pages/Profile" 
              title="My Profile"
              aria-label="My Profile"
              className="p-1 sm:p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent hover:border-border transition duration-150 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border bg-surface flex items-center justify-center">
                {authUser?.profilePic?.url ? (
                  <Image 
                    src={authUser.profilePic.url} 
                    alt={authUser?.username || "User avatar"} 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <IoPersonOutline className="text-xs text-text-muted" />
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold text-text-primary max-w-[100px] truncate">
                {authUser?.username}
              </span>
            </Link>

            {/* Notifications Popover */}
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              title="Notifications"
              aria-label={`Notifications ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} unread)` : ''}`}
              className={`p-2 rounded-xl border transition duration-150 flex items-center justify-center relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                showMenu 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border-transparent hover:border-border"
              }`}
            >
              <IoNotificationsOutline className="text-lg" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-text-inverse text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Subtle Divider */}
            <div className="h-4 w-[1px] bg-border mx-1" aria-hidden="true" />

            {/* Logout button */}
            <button 
              onClick={logout} 
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <IoLogOutOutline className="text-lg" />
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