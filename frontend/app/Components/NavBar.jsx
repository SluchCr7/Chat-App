'use client'
import React, { useContext } from 'react'
import Link from 'next/link'
import { CiSettings, CiLogout, CiUser } from "react-icons/io5"; // تم استبدالها بـ io5 لشكل أكثر اتساقاً ونعومة
import { FaUserShield } from "react-icons/fa6";
import { IoNotificationsOutline } from "react-icons/io5";
import { AuthContext } from '../Context/AuthContext';
import NotificationComponent from './NotificationComponent';
import Logo from './Logo'

const NavBar = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { authUser, logout, socketStatus } = useContext(AuthContext)

  // تحديد ألوان حالة الاتصال بشكل منظم ونظيف
  const statusConfig = {
    connected: { dot: "bg-emerald-500 ring-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Online" },
    connecting: { dot: "bg-amber-500 animate-pulse ring-amber-500/20", text: "text-amber-600 dark:text-amber-400", label: "Connecting" },
    disconnected: { dot: "bg-rose-500 ring-rose-500/20", text: "text-rose-600 dark:text-rose-400", label: "Offline" }
  };

  const currentStatus = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <nav className="flex items-center justify-between w-full py-3.5 px-6 border-b border-border bg-bg-navbar/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      
      {/* الجزء الأيسر: الشعار وحالة الاتصال */}
      <div className="flex items-center gap-4">
        <Logo compact />
        
        {authUser && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-surface/40 backdrop-blur-sm text-[11px] font-medium transition-all duration-300">
            <span className={`w-2 h-2 rounded-full ring-4 ${currentStatus.dot}`} />
            <span className={`font-semibold tracking-wide ${currentStatus.text}`}>
              {currentStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* الجزء الأيمن: الأيقونات وأزرار التحكم */}
      <div className="flex items-center gap-1.5 relative">
        
        {/* زر لوحة التحكم للمشرف */}
        {authUser?.isAdmin && (
          <Link 
            href={"/Pages/Admin"} 
            title="Admin Dashboard"
            className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center"
          >
            <FaUserShield className="text-[20px]" />
          </Link>
        )}

        {/* زر الإعدادات */}
        <Link 
          href={"/Pages/Setting"} 
          title="App Settings"
          className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200 flex items-center justify-center"
        >
          <CiSettings className="text-[22px]" />
        </Link>

        {authUser && (
          <div className="flex items-center gap-1.5">
            
            {/* زر الملف الشخصي */}
            <Link 
              href={"/Pages/Profile"} 
              title="Your Profile"
              className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200 flex items-center justify-center"
            >
              <CiUser className="text-[22px]" />
            </Link>

            {/* زر الإشعارات */}
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              title="Notifications"
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center relative ${
                showMenu 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <IoNotificationsOutline className="text-[22px]" />
              {/* نقطة إشعار صغيرة اختيارية إذا كان هناك إشعارات غير مقروءة */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full hidden" />
            </button>

            {/* خط فاصل بسيط يعطي لمسة جمالية وفصل لزر تسجيل الخروج */}
            <div className="h-5 w-[1px] bg-border mx-1" />

            {/* زر تسجيل الخروج */}
            <button 
              onClick={logout} 
              title="Logout"
              className="p-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 transition-all duration-200 flex items-center justify-center"
            >
              <CiLogout className="text-[22px]" />
            </button>

            {/* مكون الإشعارات المنسدل */}
            <NotificationComponent 
              showNotification={showNotification} 
              setShowNotification={setShowNotification} 
              showMenu={showMenu} 
              setShowMenu={setShowMenu} 
            />
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar