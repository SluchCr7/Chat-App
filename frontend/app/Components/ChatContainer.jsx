'use client';
import React, { use, useContext, useEffect, useRef } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import ChatInput from './ChatInput';
import Chatheader from './Chatheader';
import MessageSkeleton from '../Skeletons/MessageSkeleton';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import { format, isToday, isYesterday } from 'date-fns';

const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useContext(MessageContext);
  const { authUser } = useContext(AuthContext);
  // const MessageEndRef = useRef(null)

  if (isMessagesLoading) return <MessageSkeleton />;

  // --- Grouping Messages by Day ---
  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt);
      const dayKey = date.toDateString(); // Example: "Mon Apr 08 2025"

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(message);
      return groups;
    }, {});
  };

  // --- Get display text for the day ---
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

  // useEffect(() => {
  //   if (MessageEndRef.current && messages) {
  //     MessageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages]);

  return (
    <div className="flex flex-col h-full w-full shadow-lg rounded-lg overflow-hidden">
      <Chatheader />

      <div className="flex-1 w-full overflow-y-auto min-h-[50vh] p-4 space-y-4">
        {sortedDates.map((dateKey) => (
          <div key={dateKey} >
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <div className="text-text px-4 py-1 rounded-full text-sm font-medium shadow">
                {getDisplayDate(dateKey)}
              </div>
            </div>

            {/* Messages for the Day */}
            {groupedMessages[dateKey].map((msg, index) =>
              msg.sender?._id === authUser?._id ? (
                <SenderMessage key={msg._id || index} message={msg} user={authUser} />
              ) : (
                <ReceiverMessage  key={msg._id || index} message={msg} user={selectedUser} />
              )
            )}
          </div>
        ))}
      </div>

      <ChatInput />
    </div>
  );
};

export default ChatContainer;
