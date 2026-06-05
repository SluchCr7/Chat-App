'use client';

import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import { ThemeContext } from '../Context/ThemeContext';
import ChatInput from './ChatInput';
import Chatheader from './Chatheader';
import MessageSkeleton from '../Skeletons/MessageSkeleton';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import { format, isToday, isYesterday } from 'date-fns';
import { FaThumbtack, FaArrowDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const ChatContainer = () => {
  const { 
    messages, 
    isMessagesLoading, 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
    typingUsers,
    loadMoreMessages,
    hasMoreMessages,
    TogglePin
  } = useContext(MessageContext);
  
  const { authUser } = useContext(AuthContext);
  const { wallpaper } = useContext(ThemeContext);
  const MessageEndRef = useRef(null);
  const ScrollContainerRef = useRef(null);

  // Find the active pinned message (most recently updated one)
  const activePinnedMessage = (messages || [])
    .filter(m => m.isPinned)
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    .pop();

  const jumpToMessage = (msgId) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply a premium highlight pulse effect
      element.classList.add('bg-primary/10', 'ring-1', 'ring-primary/20', 'scale-[1.01]', 'shadow-md');
      setTimeout(() => {
        element.classList.remove('bg-primary/10', 'ring-1', 'ring-primary/20', 'scale-[1.01]', 'shadow-md');
      }, 1500);
    }
  };

  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

  // --- Scroll to Bottom Programmatically ---
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (ScrollContainerRef.current) {
      const { scrollHeight, clientHeight } = ScrollContainerRef.current;
      ScrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior
      });
    }
  }, []);

  // Set the first unread message ID when switching chat contexts
  useEffect(() => {
    if (messages && messages.length > 0 && authUser) {
      const firstUnread = messages.find(m => {
        const senderId = m.sender?._id || m.sender;
        return senderId !== authUser._id && !m.isRead;
      });
      if (firstUnread) {
        setFirstUnreadMessageId(firstUnread._id);
      } else {
        setFirstUnreadMessageId(null);
      }
    } else {
      setFirstUnreadMessageId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, selectedGroup, selectedChannel]);

  // Adjust scroll after content updates or pagination
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom('smooth');
    } else if (ScrollContainerRef.current && previousScrollHeight > 0) {
      const currentScrollHeight = ScrollContainerRef.current.scrollHeight;
      ScrollContainerRef.current.scrollTop = currentScrollHeight - previousScrollHeight;
      setPreviousScrollHeight(0);
    }
  }, [messages, typingUsers, shouldAutoScroll, previousScrollHeight, scrollToBottom]);

  // Reset scroll states on target swap
  useEffect(() => {
    setShouldAutoScroll(true);
    setPreviousScrollHeight(0);
  }, [selectedUser, selectedGroup, selectedChannel]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if user is near bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShouldAutoScroll(isAtBottom);

    // Infinite scroll trigger
    if (scrollTop === 0 && hasMoreMessages && !isMessagesLoading) {
      setPreviousScrollHeight(scrollHeight);
      loadMoreMessages();
    }
  };

  const getWallpaperStyle = () => {
    if (!wallpaper || wallpaper.type === 'none') return {};
    if (wallpaper.type === 'color') return { backgroundColor: wallpaper.value };
    if (wallpaper.type === 'pattern' || wallpaper.type === 'image') {
      return {
        backgroundImage: `url(${wallpaper.value})`,
        backgroundSize: wallpaper.type === 'pattern' ? 'auto' : 'cover',
        backgroundRepeat: wallpaper.type === 'pattern' ? 'repeat' : 'no-repeat',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  if (isMessagesLoading && messages.length === 0) return <MessageSkeleton />;

  // --- Grouping Messages by Day ---
  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt);
      const dayKey = date.toDateString();

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(message);
      return groups;
    }, {});
  };

  const getDisplayDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupedMessages = groupMessagesByDate(messages || []);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Determine typing users in active context
  const activeTyping = Object.entries(typingUsers)
    .filter(([userId, data]) => {
      if (!data.isTyping) return false;
      if (selectedUser && userId === selectedUser._id) return true;
      if (selectedGroup && data.targetId === selectedGroup._id && data.type === "group") return true;
      if (selectedChannel && data.targetId === selectedChannel._id && data.type === "channel") return true;
      return false;
    })
    .map(([_, data]) => data.senderName);

  return (
    <div className="flex-1 h-full bg-bg-primary flex flex-col overflow-hidden relative transition-all duration-300">
      <Chatheader />

      {/* WhatsApp-style Pinned Message Bar docked under header */}
      {activePinnedMessage && (
        <div 
          onClick={() => jumpToMessage(activePinnedMessage._id)}
          className="bg-surface/85 backdrop-blur-md border-b border-border px-5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-surface-hover/50 transition-all duration-300 z-20 group/pin relative shadow-sm"
        >
          {/* Accent indicator line */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 group-hover/pin:bg-cyan-300 transition duration-300" />
          
          <div className="flex items-center gap-3 overflow-hidden select-none">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover/pin:scale-105 transition duration-300">
              <FaThumbtack className="text-xs" />
            </div>
            
            <div className="flex flex-col text-left overflow-hidden leading-tight">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                Pinned Message
                <span className="text-[9px] text-text-muted font-bold lowercase">
                  by @{activePinnedMessage.sender?.username || "user"}
                </span>
              </span>
              <p className="text-xs text-text-secondary truncate font-semibold mt-0.5 max-w-[280px] sm:max-w-[450px] md:max-w-[600px] lg:max-w-[750px]">
                {activePinnedMessage.text || (activePinnedMessage.Photos?.length > 0 ? "📷 Photo attachment" : "🎤 Voice note")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                TogglePin(activePinnedMessage._id);
              }}
              className="p-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
              title="Unpin Message"
            >
              <IoMdClose size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area Container */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col">
        {wallpaper && wallpaper.type !== 'none' && (
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{ ...getWallpaperStyle(), opacity: wallpaper.opacity, zIndex: 0 }}
          />
        )}
        <div 
          ref={ScrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full overflow-y-auto p-5 space-y-6 wa-scroll bg-transparent z-10 relative"
        >
        {isMessagesLoading && (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        )}

        {sortedDates.length > 0 ? (
          sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-4">
              {/* Date Separator */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border"></div>
                </div>
                <span className="relative z-10 bg-bg-primary/95 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-text-secondary border border-border rounded-full shadow-sm tracking-wide">
                  {getDisplayDate(dateKey)}
                </span>
              </div>

              {/* Messages Mapping */}
              {groupedMessages[dateKey].map((msg, index) => {
                const isSender = (msg.sender?._id || msg.sender) === authUser?._id;
                const msgId = msg._id || `temp-${index}`;
                const showUnreadSeparator = msgId === firstUnreadMessageId;
                
                return (
                  <React.Fragment key={msgId}>
                    {showUnreadSeparator && (
                      <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-rose-500/30"></div>
                        <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mx-4 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          New Messages
                        </span>
                        <div className="flex-grow border-t border-rose-500/30"></div>
                      </div>
                    )}
                    <div 
                      id={`msg-${msgId}`} 
                      className="transition-all duration-500 rounded-2xl"
                    >
                      {isSender ? (
                        <SenderMessage message={msg} user={authUser} />
                      ) : (
                        <ReceiverMessage 
                          message={msg} 
                          user={msg.sender || selectedUser} 
                        />
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center flex-col text-center text-text-muted select-none">
            <p className="text-sm font-semibold tracking-wide bg-surface/40 px-6 py-3 border border-border rounded-full backdrop-blur-sm">No messages yet. Send a message to start the conversation.</p>
          </div>
        )}

        <div ref={MessageEndRef} />
      </div>
      </div>

      {/* Real-time typing indicators docked container */}
      {activeTyping.length > 0 && (
        <div className="px-5 py-2.5 border-t border-border bg-bg-primary/95 flex items-center gap-2.5 text-xs text-text-secondary select-none animate-fade-in z-20 flex-shrink-0">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="font-semibold text-[11px]">
            {activeTyping.join(", ")} {activeTyping.length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}

      {/* Floating Scroll-to-Bottom Button */}
      {!shouldAutoScroll && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            scrollToBottom('smooth');
          }}
          className="absolute bottom-20 right-6 z-40 p-3 rounded-full bg-primary hover:bg-primary-hover text-text-inverse shadow-xl border border-primary/20 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
          title="Scroll to bottom"
        >
          <FaArrowDown className="text-xs text-white" />
        </button>
      )}

      <ChatInput />
    </div>
  );
};

export default ChatContainer;
