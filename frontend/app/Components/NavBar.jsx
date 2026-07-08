import React, { useContext } from 'react'
import Link from 'next/link'
import { IoSettingsOutline, IoLogOutOutline, IoPersonOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa6";
import { AuthContext } from '../Context/AuthContext';
import { NotifyContext } from '../Context/NotifyContext';
import NotificationComponent from './NotificationComponent';
import Logo from './Logo'
import Image from 'next/image';
const NavBar = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { authUser, logout, socketStatus } = useContext(AuthContext)
  const { notifications } = useContext(NotifyContext) || { notifications: [] }
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // تحديد ألوان حالة الاتصال بشكل منظم ونظيف
  const statusConfig = {
    connected: { dot: "bg-emerald-500 ring-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Online" },
    connecting: { dot: "bg-amber-500 animate-pulse ring-amber-500/20", text: "text-amber-600 dark:text-amber-400", label: "Connecting" },
    disconnected: { dot: "bg-rose-500 ring-rose-500/20", text: "text-rose-600 dark:text-rose-400", label: "Offline" }
  };

  const currentStatus = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <nav className="flex items-center justify-between w-full py-1 px-6 border-b border-border bg-bg-navbar/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      
      {/* الجزء الأيسر: الشعار وحالة الاتصال */}
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png" 
          alt="Logo" 
          width={32} 
          height={32} 
          className="rounded-full"
        />
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
            <FaUserShield className="text-[15px]" />
          </Link>
        )}

        {/* زر الإعدادات */}
        <Link 
          href={"/Pages/Setting"} 
          title="App Settings"
          className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200 flex items-center justify-center"
        >
          <IoSettingsOutline className="text-[17px]" />
        </Link>

        {authUser && (
          <div className="flex items-center gap-1.5">
            
            {/* زر الملف الشخصي */}
            <Link 
              href={"/Pages/Profile"} 
              title="Your Profile"
              className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200 flex items-center justify-center"
            >
              <IoPersonOutline className="text-[17px]" />
            </Link>

            {/* زر الإشعارات */}
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              title="Notifications"
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center relative hover:scale-105 active:scale-95 ${
                showMenu 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <IoNotificationsOutline className="text-[17px]" />
              {/* نقطة إشعار صغيرة إذا كان هناك إشعارات غير مقروءة */}
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-text-inverse text-[9px] font-extrabold rounded-full flex items-center justify-center border border-bg-navbar active-dot-neon animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* خط فاصل بسيط يعطي لمسة جمالية وفصل لزر تسجيل الخروج */}
            <div className="h-5 w-[1px] bg-border mx-1" />

            {/* زر تسجيل الخروج */}
            <button 
              onClick={logout} 
              title="Logout"
              className="p-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 transition-all duration-200 flex items-center justify-center"
            >
              <IoLogOutOutline className="text-[17px]" />
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