'use client'

import React, { useContext, useState, useEffect } from 'react'
import { NotifyContext } from '../Context/NotifyContext'
import { MessageContext } from '../Context/MessageContext'
import Avatar from './Avatar'
import { 
  LuBell, LuMail, LuAtSign, LuUserPlus, LuShield, 
  LuCheckCheck, LuTrash2, LuX 
} from "react-icons/lu";
import { motion, AnimatePresence } from 'framer-motion';

const NotificationMenuScreen = ({ showNotification, setShowNotification }) => {
  const { notifications = [], markAsRead, markAllAsRead, clearAll } = useContext(NotifyContext) || { notifications: [] };
  const { setSelectedUser, setSelectedGroup, setSelectedChannel, groupChats = [] } = useContext(MessageContext);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showNotification) {
        setShowNotification(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showNotification, setShowNotification]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    
    setShowNotification(false);

    if (notif.type === 'message' || notif.type === 'mention') {
      const roomType = notif.metadata?.roomType;
      const refId = notif.referenceId;

      if (roomType === 'group' || roomType === 'channel') {
        const groupObj = (groupChats || []).find(g => g._id === refId || g.channels?.some(c => c._id === refId));
        if (groupObj) {
          if (roomType === 'channel') {
            const channelObj = groupObj.channels?.find(c => c._id === refId);
            if (channelObj) {
              setSelectedChannel(channelObj);
            } else {
              setSelectedGroup(groupObj);
            }
          } else {
            setSelectedGroup(groupObj);
          }
        }
      } else {
        if (notif.sender) {
          setSelectedUser(notif.sender);
        }
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'mention': return <LuAtSign className="text-amber-400 text-sm" />;
      case 'group_invite': return <LuUserPlus className="text-cyan-400 text-sm" />;
      case 'group_join_request': return <LuBell className="text-violet-400 text-sm" />;
      case 'system': return <LuShield className="text-emerald-400 text-sm" />;
      default: return <LuMail className="text-text-secondary text-sm" />;
    }
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <div className="menu_bg p-4 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <LuBell size={18} />
                </span>
                <div className="text-left">
                  <h2 className="text-base font-black text-text-primary tracking-wide">Notifications Center</h2>
                  <p className="text-xs text-text-muted">Activity, mentions, and community invites.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-text-primary border border-border transition"
                aria-label="Close notification center"
              >
                <LuX className="text-base" />
              </button>
            </div>

            {/* Filter Tabs & Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center p-3.5 px-5 border-b border-border/70 text-xs bg-bg-primary/40">
              <div className="flex p-0.5 bg-bg-primary border border-border rounded-xl">
                {['all', 'unread'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3.5 py-1 font-bold rounded-lg capitalize transition text-xs ${
                      filter === tab
                      ? "bg-surface text-primary shadow-sm border border-border/50"
                      : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-3 text-text-muted">
                  <button 
                    onClick={markAllAsRead}
                    className="hover:text-primary transition flex items-center gap-1 font-bold text-xs"
                  >
                    <LuCheckCheck size={14} /> Mark all read
                  </button>
                  <button 
                    onClick={clearAll}
                    className="hover:text-rose-400 transition flex items-center gap-1 font-bold text-xs"
                  >
                    <LuTrash2 size={14} /> Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const sender = notification?.sender;
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-center justify-between gap-3 p-3 w-full rounded-2xl border transition hover:shadow-md cursor-pointer ${
                        !notification.isRead 
                        ? 'bg-primary/10 border-primary/25 shadow-sm' 
                        : 'bg-surface border-border/50 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <Avatar
                          src={sender?.profilePic?.url}
                          name={sender?.username || "System"}
                          size={36}
                        />
                        <div className="flex flex-col text-left overflow-hidden min-w-0">
                          <span className={`text-xs ${!notification.isRead ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                            {notification.content}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium mt-0.5">
                            {new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center text-text-muted select-none">
                  <LuBell size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-semibold">No notifications available.</p>
                </div>
              )}
            </div>
          </motion.div>  
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(NotificationMenuScreen);