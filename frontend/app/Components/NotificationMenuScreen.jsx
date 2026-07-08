'use client'
import React, { useContext, useState } from 'react'
import { NotifyContext } from '../Context/NotifyContext'
import { MessageContext } from '../Context/MessageContext'
import Image from 'next/image'
import { IoMdClose } from "react-icons/io";
import { IoNotificationsOutline, IoMailOutline, IoAtOutline, IoPersonAddOutline, IoShieldCheckmarkOutline, IoCheckmarkDoneOutline, IoTrashOutline } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';

const NotificationMenuScreen = ({ showNotification, setShowNotification }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useContext(NotifyContext) || { notifications: [] };
  const { setSelectedUser, setSelectedGroup, setSelectedChannel, groupChats } = useContext(MessageContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    
    setShowNotification(false);

    // Auto-navigate to appropriate chat window
    if (notif.type === 'message' || notif.type === 'mention') {
      const roomType = notif.metadata?.roomType;
      const refId = notif.referenceId;

      if (roomType === 'group' || roomType === 'channel') {
        const groupObj = groupChats.find(g => g._id === refId || g.channels?.some(c => c._id === refId));
        if (groupObj) {
          setSelectedGroup(groupObj);
          setSelectedUser(null);
          if (roomType === 'channel') {
            const channelObj = groupObj.channels?.find(c => c._id === refId);
            if (channelObj) setSelectedChannel(channelObj);
          } else {
            setSelectedChannel(null);
          }
        }
      } else {
        if (notif.sender) {
          setSelectedUser(notif.sender);
          setSelectedGroup(null);
          setSelectedChannel(null);
        }
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    const classStr = "text-lg text-primary flex-shrink-0";
    switch(type) {
      case 'mention': return <IoAtOutline className={`${classStr} text-amber-500`} />;
      case 'group_invite': return <IoPersonAddOutline className={`${classStr} text-cyan-400`} />;
      case 'group_join_request': return <IoNotificationsOutline className={`${classStr} text-indigo-400`} />;
      case 'system': return <IoShieldCheckmarkOutline className={`${classStr} text-emerald-400`} />;
      default: return <IoMailOutline className={classStr} />;
    }
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <div className="menu_bg p-4 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-2xl bg-bg-secondary border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/30">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <IoNotificationsOutline size={20} className="active-dot-neon animate-pulse" />
                </span>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-text-primary tracking-wide">Workspace Notification Center</h2>
                  <p className="text-xs text-text-muted">Manage your incoming mentions, channel updates, and invitations.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-text-primary border border-border transition-all"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 px-6 border-b border-border/60 bg-surface/10 text-xs">
              <div className="flex p-0.5 bg-bg-primary border border-border rounded-xl">
                {['all', 'unread'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 font-bold rounded-lg capitalize transition-all ${
                      filter === tab
                      ? "bg-surface text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-4 text-text-muted">
                  <button 
                    onClick={markAllAsRead}
                    className="hover:text-primary transition flex items-center gap-1.5 font-bold"
                  >
                    <IoCheckmarkDoneOutline size={16} /> Mark all read
                  </button>
                  <button 
                    onClick={clearAll}
                    className="hover:text-rose-500 transition flex items-center gap-1.5 font-bold"
                  >
                    <IoTrashOutline size={16} /> Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Scroller */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 wa-scroll">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const avatarPic = notification?.sender?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-center justify-between gap-4 p-4.5 w-full rounded-2xl border transition-all duration-300 hover:scale-[1.005] hover:shadow-md cursor-pointer ${
                        !notification.isRead 
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/8' 
                        : 'bg-surface/20 border-border/50 hover:bg-surface-hover/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                        <div className="relative flex-shrink-0">
                          <Image 
                            src={avatarPic} 
                            alt="avatar" 
                            width={38} 
                            height={38} 
                            className="rounded-full object-cover w-9.5 h-9.5 border border-border"
                          />
                          {!notification.isRead && (
                            <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-bg-secondary active-dot-neon animate-pulse" />
                          )}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden min-w-0">
                          <span className={`text-sm leading-tight truncate ${!notification.isRead ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                            {notification.content}
                          </span>
                          <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">
                            {new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center text-text-muted select-none">
                  <IoNotificationsOutline size={36} className="opacity-20 mb-2" />
                  <p className="text-sm font-semibold">No notifications available.</p>
                </div>
              )}
            </div>
          </motion.div>  
        </div>
      )}
    </AnimatePresence>
  )
}

export default NotificationMenuScreen