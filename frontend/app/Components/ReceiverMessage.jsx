'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { FaStar, FaThumbtack, FaRegSmile, FaFileDownload, FaShare, FaTimes, FaReply } from "react-icons/fa";
import { MessageContext } from '../Context/MessageContext';
import VoiceMessage from './VoiceMessage';

const ReceiverMessage = ({ message, user }) => {
  const { SendReaction, TogglePin, ToggleStar, contacts, groupChats, handleForwardMessage, setReplyMessage } = useContext(MessageContext);
  const [showReactions, setShowReactions] = useState(false);

  // Forwarding State
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]); // Array of { id, type }

  const handleReactionSelect = async (emoji) => {
    await SendReaction(message._id, emoji);
    setShowReactions(false);
  };

  const toggleTargetSelection = (id, type) => {
    setSelectedTargets(prev => {
        const exists = prev.some(t => t.id === id);
        if (exists) {
            return prev.filter(t => t.id !== id);
        } else {
            return [...prev, { id, type }];
        }
    });
  };

  const handleSendForward = async () => {
    if (selectedTargets.length === 0) return;
    await handleForwardMessage(message._id, selectedTargets);
    setSelectedTargets([]);
    setShowForwardModal(false);
  };

  const isStarred = message.starredBy?.length > 0;
  
  // Safe extraction of sender details
  const senderName = message.sender?.username || user?.username || "Friend";
  const senderPic = message.sender?.profilePic?.url || user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <div className="flex justify-start mb-6 relative group transition-all duration-300">
      {/* Content wrapper */}
      <div className="flex max-w-[70%] gap-3 items-end">
        {/* User avatar */}
        <div className="w-8.5 h-8.5">
          <Image
            src={senderPic}
            alt="Receiver"
            width={34}
            height={34}
            className="rounded-full object-cover border border-border"
          />
        </div>

        <div className="flex flex-col items-start text-left">
          {/* Sender Username above message bubble */}
          <span className="text-[11px] font-bold text-text-muted mb-1 ml-1 tracking-wide">
            {senderName}
          </span>

          {/* Pinned label indicators */}
          {message.isPinned && (
            <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-1 mb-1 ml-1">
              <FaThumbtack className="text-[8px]" /> Pinned Message
            </span>
          )}

          {/* Starred indicator */}
          {isStarred && (
            <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 mb-1 ml-1">
              <FaStar className="text-[8px]" /> Starred
            </span>
          )}

          {/* Reply Reference Preview Bubble */}
          {message.replyTo && (
            <div className="bg-surface border-l-2 border-primary border border-border px-3 py-1.5 rounded-t-xl text-[11px] text-text-secondary mb-0.5 text-left w-full">
              <span className="text-[9px] font-extrabold text-primary block mb-0.5 uppercase tracking-wider">Replying to</span>
              <p className="italic truncate font-medium">{message.replyTo.text || "media attachment"}</p>
            </div>
          )}

          {/* Main message bubble content */}
          <div className="bg-surface border border-border text-text-primary px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
            {/* If contains Photo attachments */}
            {Array.isArray(message.Photos) && message.Photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 justify-start">
                {message.Photos.map((img, index) => (
                  <a href={img.url} target="_blank" rel="noreferrer" key={index} className="block relative rounded-lg overflow-hidden border border-border bg-bg-primary/50 group">
                    <Image
                      src={img.url}
                      alt="attachment"
                      width={220}
                      height={160}
                      className="object-cover hover:scale-105 transition duration-300 max-h-40"
                    />
                  </a>
                ))}
              </div>
            )}

            {/* If contains Audio message schema */}
            {message.audio && message.audio.url && (
              <div className="mb-2 w-full text-left">
                <VoiceMessage 
                  audioUrl={message.audio.url} 
                  duration={message.audio.duration}
                  isSender={false}
                />
              </div>
            )}

            {/* Rich generic attachments */}
            {Array.isArray(message.attachments) && message.attachments.length > 0 && (
              <div className="space-y-3 mb-2 w-full text-left">
                {message.attachments.map((file, idx) => {
                  if (file.fileType === "video") {
                    return (
                      <video 
                        key={idx} 
                        src={file.url} 
                        controls 
                        className="rounded-lg border border-border max-w-full max-h-48 object-contain bg-bg-primary"
                      />
                    );
                  }
                  if (file.fileType === "audio" || file.fileType === "voice") {
                    return (
                      <VoiceMessage 
                        key={idx} 
                        audioUrl={file.url} 
                        duration={file.duration}
                        isSender={false}
                      />
                    );
                  }
                  if (file.fileType === "document") {
                    return (
                      <a 
                        key={idx} 
                        href={file.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-primary/60 border border-border hover:bg-bg-primary transition-all duration-300"
                      >
                        <FaFileDownload className="text-primary text-lg" />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold truncate max-w-[150px] text-text-primary">{file.name || "Document"}</span>
                          <span className="text-[9px] text-text-muted font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {message.text ? (
              <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{message.text}</p>
            ) : null}
          </div>

          {/* Reactions Row */}
          {Array.isArray(message.reactions) && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1 bg-surface border border-border px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              {message.reactions.map((r, i) => (
                <span key={i} title={r.user?.username}>{r.emoji}</span>
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center gap-1.5 mt-1.5 justify-start">
            <span className="text-[10px] text-text-muted font-bold">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.isEdited && <span className="text-[9px] text-text-muted font-bold uppercase">Edited</span>}
          </div>
        </div>
      </div>

      {/* Options Hover Overlay */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 hidden group-hover:flex items-center gap-1 bg-surface border border-border p-1.5 rounded-xl shadow-lg z-10 transition-all duration-300 animate-fade-in">
        <button 
          onClick={() => setShowReactions(!showReactions)}
          className="p-2 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="React"
        >
          <FaRegSmile />
        </button>
        <button 
          onClick={() => ToggleStar(message._id)}
          className={`p-2 text-xs hover:bg-surface-hover rounded-lg transition ${isStarred ? "text-amber-500" : "text-text-secondary hover:text-amber-500"}`}
          title="Star"
        >
          <FaStar />
        </button>
        <button 
          onClick={() => TogglePin(message._id)}
          className={`p-2 text-xs hover:bg-surface-hover rounded-lg transition ${message.isPinned ? "text-cyan-400" : "text-text-secondary hover:text-cyan-400"}`}
          title="Pin"
        >
          <FaThumbtack />
        </button>
        <button 
          onClick={() => setReplyMessage(message)}
          className="p-2 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="Reply"
        >
          <FaReply />
        </button>
        <button 
          onClick={() => setShowForwardModal(true)}
          className="p-2 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="Forward Message"
        >
          <FaShare />
        </button>
      </div>

      {/* Emoji Reaction Drawer */}
      {showReactions && (
        <div className="absolute top-[-42px] right-4 bg-surface border border-border p-1.5 rounded-xl shadow-xl flex gap-2.5 z-20 animate-fade-in">
          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
            <button 
              key={emoji}
              onClick={() => handleReactionSelect(emoji)}
              className="text-lg hover:scale-125 transition-transform duration-200"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Forward Dialog Modal */}
      {showForwardModal && (
        <div className="menu_bg z-50">
          <div className="bg-black border border-border p-6 rounded-[24px] w-full max-w-sm shadow-2xl relative animate-slide-in flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <FaShare className="text-primary" /> Forward Message
              </h3>
              <button 
                onClick={() => { setShowForwardModal(false); setSelectedTargets([]); }}
                className="text-text-muted hover:text-text-primary transition"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {/* Direct Contacts List */}
              <div>
                <span className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest block mb-2 px-1">Contacts</span>
                {contacts.length > 0 ? (
                  contacts.map(c => {
                    const isSelected = selectedTargets.some(t => t.id === c._id);
                    return (
                      <button 
                        key={c._id}
                        onClick={() => toggleTargetSelection(c._id, "direct")}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between mb-1.5 text-left transition duration-200 ${
                            isSelected 
                            ? "bg-primary/10 border-primary/20" 
                            : "border-border bg-surface/30 hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Image src={c.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} width={28} height={28} alt="avatar" className="rounded-full object-cover" />
                          <span className="text-xs font-semibold text-text-primary truncate">{c.username}</span>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-xs checkbox-primary border-border bg-bg-primary" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-text-muted px-1 font-medium">No contacts available.</p>
                )}
              </div>

              {/* Group Communities List */}
              <div className="mt-4">
                <span className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest block mb-2 px-1">Communities</span>
                {groupChats.length > 0 ? (
                  groupChats.map(g => {
                    const isSelected = selectedTargets.some(t => t.id === g._id);
                    return (
                      <button 
                        key={g._id}
                        onClick={() => toggleTargetSelection(g._id, "group")}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between mb-1.5 text-left transition duration-200 ${
                            isSelected 
                            ? "bg-primary/10 border-primary/20" 
                            : "border-border bg-surface/30 hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Image src={g.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"} width={28} height={28} alt="avatar" className="rounded-full object-cover" />
                          <span className="text-xs font-semibold text-text-primary truncate">{g.name}</span>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-xs checkbox-primary border-border bg-bg-primary" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-text-muted px-1 font-medium">No communities joined.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-3">
              <button 
                onClick={handleSendForward}
                disabled={selectedTargets.length === 0}
                className="w-full py-2.5 text-xs font-extrabold text-text-inverse bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                Forward Message ({selectedTargets.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverMessage;
