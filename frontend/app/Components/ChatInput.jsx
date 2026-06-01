'use client';

import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaImage, FaPaperclip, FaSmile, FaMicrophone, FaReply } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';

const ChatInput = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel, 
    AddNewMessage,
    directChats,
    groupChats,
    handleSaveDraft,
    replyMessage,
    setReplyMessage
  } = useContext(MessageContext);
  
  const { socket, authUser } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const draftSaveTimeoutRef = useRef(null);

  const targetId = selectedUser?._id || selectedGroup?._id || selectedChannel?._id;
  const type = selectedUser ? "direct" : selectedGroup ? "group" : "channel";

  // --- 1. Populate drafts on selection change ---
  useEffect(() => {
    setMessage('');
    setReplyMessage(null); // Clear reply when chat changes

    if (!targetId) return;

    if (type === "group") {
      const activeGrp = groupChats.find(g => g._id === targetId);
      if (activeGrp?.draft) setMessage(activeGrp.draft);
    } else {
      const activeDM = directChats.find(c => c.recipient?._id === targetId || c._id === targetId);
      if (activeDM?.draft) setMessage(activeDM.draft);
    }
  }, [selectedUser, selectedGroup, selectedChannel, directChats, groupChats, setReplyMessage, targetId, type]);

  // --- 2. Save draft automatically with debounce ---
  const triggerDraftSave = (text) => {
    if (!targetId) return;

    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);

    draftSaveTimeoutRef.current = setTimeout(async () => {
      let chatId = targetId;
      if (type === "direct") {
        const activeDM = directChats.find(c => c.recipient?._id === targetId);
        if (activeDM) chatId = activeDM._id;
        else return; // If conversation is not created yet, no draft is saved on server
      }
      await handleSaveDraft(chatId, type, text);
    }, 1000); // 1-second debounce
  };

  // --- 3. Real-time Typing Handlers ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    triggerDraftSave(val);
    
    if (!socket || !targetId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingStart", { targetId, type, senderName: authUser?.username });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
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

    // Clear typing indicator immediately
    if (socket && targetId) {
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }

    // Call Context wrapper
    const replyToId = replyMessage ? replyMessage._id : null;
    await AddNewMessage(message, attachments, replyToId);
    
    // Clear draft on server
    if (targetId) {
      let chatId = targetId;
      if (type === "direct") {
        const activeDM = directChats.find(c => c.recipient?._id === targetId);
        if (activeDM) chatId = activeDM._id;
      }
      handleSaveDraft(chatId, type, "");
    }

    // Clear local inputs
    setMessage('');
    setAttachments([]);
    setReplyMessage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-surface flex flex-col space-y-3 relative transition-all duration-300">
      
      {/* Reply Reference Preview Bar */}
      {replyMessage && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl animate-slide-in">
          <div className="flex items-center gap-2 text-left overflow-hidden">
            <FaReply className="text-primary text-xs flex-shrink-0" />
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Replying to @{replyMessage.sender?.username || "Friend"}</span>
              <p className="text-xs text-text-secondary truncate italic font-medium">{replyMessage.text || "Media attachment"}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyMessage(null)}
            className="p-1 rounded-full text-text-muted hover:text-rose-500 hover:bg-surface-hover transition-all duration-300"
            title="Cancel Reply"
          >
            <IoMdClose size={16} />
          </button>
        </div>
      )}

      {/* File Previews Panel */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-bg-primary border border-border rounded-xl max-h-32 overflow-y-auto">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div key={index} className="relative flex items-center gap-2.5 p-2 bg-surface rounded-lg border border-border pr-8 animate-fade-in">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Attachment buttons */}
        <div className="flex items-center gap-1.5 font-bold">
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
        <div className="flex-1 relative font-bold">
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
