'use client';

import React, { useContext, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { IoNotificationsOutline, IoMailOutline, IoAtOutline, IoPersonAddOutline, IoShieldCheckmarkOutline, IoCheckmarkDoneOutline, IoTrashOutline } from "react-icons/io5";
import { NotifyContext } from '../Context/NotifyContext';
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';

const NotificationComponent = ({ showMenu, setShowMenu, showNotification, setShowNotification }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useContext(NotifyContext) || { notifications: [] };
  const { setSelectedUser, setSelectedGroup, setSelectedChannel, groupChats } = useContext(MessageContext);
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
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    const classStr = "text-sm text-primary flex-shrink-0";
    switch(type) {
      case 'mention': return <IoAtOutline className={`${classStr} text-amber-500`} />;
      case 'group_invite': return <IoPersonAddOutline className={`${classStr} text-cyan-400`} />;
      case 'group_join_request': return <IoNotificationsOutline className={`${classStr} text-indigo-400`} />;
      case 'system': return <IoShieldCheckmarkOutline className={`${classStr} text-emerald-400`} />;
      default: return <IoMailOutline className={classStr} />;
    }
  };

  return (
    <div
      className={`glass-dropdown-card shadow-2xl w-80 sm:w-96 rounded-2xl absolute top-12 p-4 right-0 z-50 border border-border transition-all duration-300 ${
        showMenu ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="flex flex-col w-full text-left">
        {/* Header Block */}
        <div className="flex items-center justify-between pb-3 w-full border-b border-border">
          <span className="font-extrabold text-text-primary text-xs tracking-wider uppercase">Notifications</span>
          <button 
            onClick={() => setShowMenu(false)}
            className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition"
          >
            <IoMdClose className="text-base" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-border text-xs">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`font-extrabold pb-0.5 border-b-2 transition ${
                activeFilter === 'all' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('unread')}
              className={`font-extrabold pb-0.5 border-b-2 transition flex items-center gap-1 ${
                activeFilter === 'unread' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Unread
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-2.5 text-text-muted text-[11px]">
              <button 
                onClick={markAllAsRead}
                className="hover:text-primary transition flex items-center gap-1 font-bold"
                title="Mark all read"
              >
                <IoCheckmarkDoneOutline size={14} /> Read All
              </button>
              <button 
                onClick={clearAll}
                className="hover:text-rose-500 transition flex items-center gap-1 font-bold"
                title="Clear all"
              >
                <IoTrashOutline size={14} /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Notifications Scroller */}
        <div className="text-xs pt-2 max-h-[320px] overflow-y-auto wa-scroll">  
          {filteredNotifications.length > 0 ? (
            <div className="flex flex-col space-y-1">
              {filteredNotifications.map((notif) => {
                const senderPic = notif.sender?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                return (
                  <div 
                    key={notif._id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-surface-hover/80 border border-transparent hover:border-border cursor-pointer transition relative ${
                      !notif.isRead ? 'bg-primary/10 border-primary/20' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full absolute left-1 top-1/2 -translate-y-1/2" />
                    )}

                    <div className="relative flex-shrink-0 mt-0.5">
                      <Image 
                        src={senderPic} 
                        alt="avatar" 
                        width={28} 
                        height={28} 
                        className="rounded-full object-cover w-7 h-7 border border-border"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col text-left flex-1 min-w-0 leading-tight">
                      <span className={`text-xs ${!notif.isRead ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                        {notif.content}
                      </span>
                      <span className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-wide">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex-shrink-0 self-center">
                      {getNotificationIcon(notif.type)}
                    </div>
                  </div>
                );
              })}
              
              {filteredNotifications.length > 5 && (
                <button
                  className="text-xs text-primary font-bold text-center py-2 hover:text-primary-hover border-t border-border mt-1 transition"
                  onClick={() => { setShowMenu(false); setShowNotification(true) }}
                >
                  View All Notifications
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted">
              <IoNotificationsOutline size={28} className="opacity-20 mb-2" />
              <p className="text-xs font-semibold">No notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
