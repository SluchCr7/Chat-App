'use client';

import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaImage, FaPaperclip, FaSmile, FaMicrophone } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';

const ChatInput = () => {
  const { selectedUser, selectedGroup, selectedChannel, AddNewMessage } = useContext(MessageContext);
  const { socket, authUser } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // --- Real-time Typing Handlers ---
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (!socket) return;

    const targetId = selectedUser?._id || selectedGroup?._id || selectedChannel?._id;
    const type = selectedUser ? "direct" : selectedGroup ? "group" : "channel";

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingStart", { targetId, type, senderName: authUser?.username });
    }

    // Debounce stop typing event
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Enforce 10MB limit
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    // Emit stop typing immediately
    if (socket) {
      const targetId = selectedUser?._id || selectedGroup?._id || selectedChannel?._id;
      const type = selectedUser ? "direct" : selectedGroup ? "group" : "channel";
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }

    // Call Context wrapper
    await AddNewMessage(message, attachments);
    
    // Clear local inputs
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-surface flex flex-col space-y-3 relative transition-all duration-300">
      {/* File Previews Panel */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-bg-primary border border-border rounded-xl max-h-32 overflow-y-auto">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div key={index} className="relative flex items-center gap-2.5 p-2 bg-surface rounded-lg border border-border pr-8">
                {isImage ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-10 h-10 object-cover rounded border border-border" 
                  />
                ) : (
                  <FaPaperclip className="text-primary text-sm" />
                )}
                <div className="flex flex-col max-w-[120px] text-left">
                  <span className="text-[10px] font-bold text-text-primary truncate">{file.name}</span>
                  <span className="text-[8px] text-text-muted font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => handleRemoveAttachment(index)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose-500 transition-all duration-300"
                >
                  <IoMdClose size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input controls row */}
      <div className="flex items-center gap-3">
        {/* Attachment buttons */}
        <div className="flex items-center gap-1.5">
          <input 
            type="file"
            id="file-attachment"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="file-attachment"
            className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center"
            title="Attach Files"
          >
            <FaPaperclip className="text-sm" />
          </label>

          <input 
            type="file"
            id="image-attachment"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="image-attachment"
            className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center"
            title="Attach Images"
          >
            <FaImage className="text-sm" />
          </label>
        </div>

        {/* Text Input area */}
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-bg-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition duration-300"
          />
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 flex items-center justify-center">
            <FaSmile className="text-sm" />
          </button>
          <button className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 flex items-center justify-center">
            <FaMicrophone className="text-sm" />
          </button>
          <button 
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
              (message.trim() || attachments.length > 0)
              ? "bg-primary border-primary hover:bg-primary-hover text-text-inverse shadow-md cursor-pointer font-bold hover:scale-105 active:scale-95"
              : "bg-surface border-border text-text-disabled cursor-not-allowed"
            }`}
          >
            <IoIosSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
