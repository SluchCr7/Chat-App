'use client'
// components/ReceiverMessage.jsx
import Image from 'next/image';
import React from 'react';

const ReceiverMessage = ({ message, user }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-[80%] gap-2 items-end">
        {/* Receiver avatar */}
        <div className="w-10 h-10">
          <Image
            src={user?.profilePic?.url}
            alt="Receiver"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </div>

        {/* Message content */}
        <div className="flex flex-col items-start text-left">
          <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
            {/* If message contains photos */}
            {Array.isArray(message.Photos) && message.Photos.length > 0 && (
              <div
                className={`${
                  message.Photos.length > 2
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-2 w-full mb-2'
                    : 'flex flex-wrap gap-2 mb-2'
                }`}
              >
                {message.Photos.map((img, index) => (
                  <Image
                    key={index}
                    src={img.url}
                    alt={`image_message_${index}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            {/* Message text */}
            <p>{message.text}</p>
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReceiverMessage;
