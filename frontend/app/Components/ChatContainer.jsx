'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import ChatInput from './ChatInput';
import Chatheader from './Chatheader';
import MessageSkeleton from '../Skeletons/MessageSkeleton';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import { format, isToday, isYesterday } from 'date-fns';
import { FaThumbtack } from "react-icons/fa";
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

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

  // --- Scroll to Bottom ---
  useEffect(() => {
    if (shouldAutoScroll && MessageEndRef.current) {
      MessageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (ScrollContainerRef.current && previousScrollHeight > 0) {
      // Adjust scroll position after loading previous page of messages to prevent jumping
      const currentScrollHeight = ScrollContainerRef.current.scrollHeight;
      ScrollContainerRef.current.scrollTop = currentScrollHeight - previousScrollHeight;
      setPreviousScrollHeight(0);
    }
  }, [messages, typingUsers, shouldAutoScroll, previousScrollHeight]);

  // Reset scroll state on chat target change
  useEffect(() => {
    setShouldAutoScroll(true);
    setPreviousScrollHeight(0);
  }, [selectedUser, selectedGroup, selectedChannel]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if user is scrolled near bottom to enable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShouldAutoScroll(isAtBottom);

    // Detect top of container scroll for infinite scroll
    if (scrollTop === 0 && hasMoreMessages && !isMessagesLoading) {
      setPreviousScrollHeight(scrollHeight);
      loadMoreMessages();
    }
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

  // Determine typing users in the active context
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
    <div className="flex-1 min-h-[70vh] md:min-h-[90vh] bg-bg-primary border border-border rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-300">
      <Chatheader />

      {/* Sleek WhatsApp-style Pinned Message Bar docked under header */}
      {activePinnedMessage && (
        <div 
          onClick={() => jumpToMessage(activePinnedMessage._id)}
          className="bg-surface/85 backdrop-blur-md border-b border-border px-5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-surface-hover/50 transition-all duration-300 z-20 group/pin relative shadow-sm"
        >
          {/* Accent indicator line on left */}
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
                e.stopPropagation(); // Prevent jumping to message
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

      {/* Messages Scroll Area */}
      <div 
        ref={ScrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-y-auto p-5 space-y-6 scrollbar-thin bg-bg-primary/50"
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
              <div className="flex justify-center my-6">
                <span className="bg-surface text-text-primary border border-border px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm tracking-wide">
                  {getDisplayDate(dateKey)}
                </span>
              </div>

              {/* Messages Mapping */}
              {groupedMessages[dateKey].map((msg, index) => {
                const isSender = (msg.sender?._id || msg.sender) === authUser?._id;
                const msgId = msg._id || `temp-${index}`;
                return (
                  <div 
                    key={msgId} 
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
                );
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center flex-col text-center text-text-muted">
            <p className="text-sm font-semibold tracking-wide">No messages yet. Send a message to start the conversation.</p>
          </div>
        )}

        {/* Real-time typing indicators container */}
        {activeTyping.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface/50 border border-border rounded-xl max-w-xs animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-225"></span>
            </div>
            <span className="text-xs text-text-secondary font-semibold">
              {activeTyping.join(", ")} {activeTyping.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}

        <div ref={MessageEndRef} />
      </div>

      <ChatInput />
    </div>
  );
};

export default ChatContainer;
