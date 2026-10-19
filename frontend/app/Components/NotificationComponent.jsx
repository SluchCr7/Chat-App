'use client';

import React, { useContext, useState } from 'react';
import { 
  IoMdClose 
} from "react-icons/io";
import { 
  LuBell, LuMail, LuAtSign, LuUserPlus, LuShield, 
  LuCheckCheck, LuTrash2, LuX 
} from "react-icons/lu";
import { NotifyContext } from '../Context/NotifyContext';
import Avatar from './Avatar';
import { MessageContext } from '../Context/MessageContext';

const NotificationComponent = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { notifications = [], markAsRead, markAllAsRead, clearAll } = useContext(NotifyContext) || { notifications: [] };
  const { setSelectedUser, setSelectedGroup, setSelectedChannel, groupChats = [] } = useContext(MessageContext);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    
    setShowMenu(false);

    if (notif.type === 'message' || notif.type === 'mention') {
      const roomType = notif.metadata?.roomType;
      const refId = notif.referenceId;

      if (roomType === 'group' || roomType === 'channel') {
        const groupObj = (groupChats || []).find(g => g._id === refId || g.channels?.some(c => c._id === refId));
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
    if (activeFilter === 'unread') return !n.isRead;
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
    <div
      className={`glass-panel shadow-2xl w-80 sm:w-96 rounded-2xl absolute top-12 p-4 right-0 z-50 border border-border transition-all duration-200 text-left ${
        showMenu ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
      }`}
    >
      <div className="flex flex-col w-full text-left">
        {/* Header Block */}
        <div className="flex items-center justify-between pb-3 w-full border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-black text-text-primary text-xs tracking-wider uppercase">Notifications</span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[9px] font-black">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowMenu(false)}
            className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition"
            aria-label="Close notifications"
          >
            <LuX className="text-base" />
          </button>
        </div>

        {/* Filter Tabs & Quick Actions */}
        <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-border text-xs">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`font-bold pb-0.5 border-b-2 transition text-[11px] ${
                activeFilter === 'all' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('unread')}
              className={`font-bold pb-0.5 border-b-2 transition flex items-center gap-1 text-[11px] ${
                activeFilter === 'unread' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Unread
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2.5 text-[10px] text-text-muted">
              <button 
                onClick={markAllAsRead}
                className="hover:text-primary transition flex items-center gap-1 font-bold"
                title="Mark all as read"
              >
                <LuCheckCheck className="text-xs" /> Mark read
              </button>
              <button 
                onClick={clearAll}
                className="hover:text-rose-400 transition flex items-center gap-1 font-bold"
                title="Clear all"
              >
                <LuTrash2 className="text-xs" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Notification Feed List */}
        <div className="max-h-72 overflow-y-auto pt-2 space-y-1.5 pr-0.5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const sender = notification?.sender;
              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-center justify-between gap-2.5 p-2.5 w-full rounded-xl border transition cursor-pointer text-left ${
                    !notification.isRead 
                      ? 'bg-primary/10 border-primary/20 shadow-sm' 
                      : 'bg-surface/50 border-border/50 hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <Avatar 
                      src={sender?.profilePic?.url} 
                      name={sender?.username || "System"} 
                      size={32} 
                    />
                    <div className="flex flex-col text-left overflow-hidden min-w-0">
                      <span className={`text-xs truncate ${!notification.isRead ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                        {notification.content}
                      </span>
                      <span className="text-[9px] text-text-muted font-medium mt-0.5">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center text-text-muted select-none">
              <LuBell className="text-2xl opacity-20 mb-1.5" />
              <p className="text-xs font-medium">All caught up! No notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NotificationComponent);
