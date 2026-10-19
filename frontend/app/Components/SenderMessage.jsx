'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { 
  FaEdit, FaTrashAlt, FaStar, FaThumbtack, FaRegSmile, FaCheck, 
  FaCheckDouble, FaFileDownload, FaShare, FaTimes, FaReply 
} from "react-icons/fa";
import { 
  LuSmile, LuStar, LuPin, LuPencil, LuReply, LuForward, 
  LuTrash2, LuCheck, LuCheckCheck, LuDownload 
} from "react-icons/lu";
import { MessageContext } from '../Context/MessageContext';
import VoiceMessage from './VoiceMessage';
import Avatar from './Avatar';

const SenderMessage = ({ message, user }) => {
  const { 
    EditMessage, DeleteMessage, SendReaction, TogglePin, 
    ToggleStar, RetryMessage, contacts, groupChats, handleForwardMessage,
    setReplyMessage
  } = useContext(MessageContext);

  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(message.text || '');

  // Forwarding State
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]); // Array of { id, type }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editVal.trim()) return;
    await EditMessage(message._id, editVal);
    setIsEditing(false);
  };

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

  return (
    <div className="flex justify-end mb-3.5 relative group transition-colors duration-150">
      
      {/* Quick Action Floating Hover Bar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 hidden group-hover:flex items-center gap-0.5 bg-surface/95 backdrop-blur-md border border-border p-1 rounded-xl shadow-xl z-20">
        <button 
          onClick={() => setShowReactions(!showReactions)}
          className="p-1.5 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="Add Reaction"
          aria-label="Add Reaction"
        >
          <LuSmile className="text-sm" />
        </button>
        <button 
          onClick={() => ToggleStar(message._id)}
          className={`p-1.5 text-xs hover:bg-surface-hover rounded-lg transition ${isStarred ? "text-amber-400" : "text-text-secondary hover:text-amber-400"}`}
          title="Star Message"
          aria-label="Star Message"
        >
          <LuStar className="text-sm" />
        </button>
        <button 
          onClick={() => TogglePin(message._id)}
          className={`p-1.5 text-xs hover:bg-surface-hover rounded-lg transition ${message.isPinned ? "text-primary" : "text-text-secondary hover:text-primary"}`}
          title="Pin to top"
          aria-label="Pin Message"
        >
          <LuPin className="text-sm" />
        </button>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 text-xs text-text-secondary hover:text-emerald-400 hover:bg-surface-hover rounded-lg transition"
          title="Edit Message"
          aria-label="Edit Message"
        >
          <LuPencil className="text-sm" />
        </button>
        <button 
          onClick={() => setReplyMessage(message)}
          className="p-1.5 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="Reply"
          aria-label="Reply"
        >
          <LuReply className="text-sm" />
        </button>
        <button 
          onClick={() => setShowForwardModal(true)}
          className="p-1.5 text-xs text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          title="Forward"
          aria-label="Forward"
        >
          <LuForward className="text-sm" />
        </button>
        <button 
          onClick={() => DeleteMessage(message._id)}
          className="p-1.5 text-xs text-text-secondary hover:text-rose-400 hover:bg-surface-hover rounded-lg transition"
          title="Delete for Everyone"
          aria-label="Delete"
        >
          <LuTrash2 className="text-sm" />
        </button>
      </div>

      {/* Emoji Reactions Drawer */}
      {showReactions && (
        <div className="absolute top-[-38px] left-2 bg-surface/95 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-2xl flex gap-2 z-30">
          {["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🚀"].map(emoji => (
            <button 
              key={emoji}
              onClick={() => handleReactionSelect(emoji)}
              className="text-base hover:scale-130 transition duration-150 p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Content Layout */}
      <div className="flex max-w-[85%] sm:max-w-[75%] gap-2.5 items-end">
        <div className="flex flex-col items-end text-right min-w-0">
          
          {message.isPinned && (
            <span className="text-[9px] font-bold text-primary flex items-center gap-1 mb-1 mr-1">
              <LuPin className="text-[10px]" /> Pinned Message
            </span>
          )}

          {isStarred && (
            <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1 mb-1 mr-1">
              <LuStar className="text-[10px]" /> Starred
            </span>
          )}

          {/* Reply Quote Preview */}
          {message.replyTo && (
            <div className="bg-surface border-r-2 border-primary border border-border px-3 py-1.5 rounded-t-xl text-[11px] text-text-secondary mb-0.5 text-right w-full">
              <span className="text-[9px] font-black text-primary block mb-0.5 uppercase tracking-wider">Replying to</span>
              <p className="italic truncate font-medium">{message.replyTo.text || "media attachment"}</p>
            </div>
          )}

          {/* Message Bubble */}
          <div className={`msg-bubble-sent px-4 py-2.5 text-left transition ${
            message.status === 'sending' ? 'opacity-80 animate-pulse' : 
            message.status === 'failed' ? 'border border-rose-500 bg-rose-500/10 text-rose-200' : ''
          }`}>
            
            {/* Photos */}
            {Array.isArray(message.Photos) && message.Photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 justify-end">
                {message.Photos.map((img, index) => (
                  <a 
                    href={img.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    key={index} 
                    className="block relative rounded-xl overflow-hidden border border-white/10 group bg-black/10"
                  >
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

            {/* Voice Audio Message */}
            {message.audio && message.audio.url && (
              <div className="mb-2 w-full text-left">
                <VoiceMessage 
                  audioUrl={message.audio.url} 
                  duration={message.audio.duration}
                  isSender={true}
                />
              </div>
            )}

            {/* Attachments */}
            {Array.isArray(message.attachments) && message.attachments.length > 0 && (
              <div className="space-y-2 mb-2 w-full text-left">
                {message.attachments.map((file, idx) => {
                  if (file.fileType === "video") {
                    return (
                      <video 
                        key={idx} 
                        src={file.url} 
                        controls 
                        className="rounded-xl border border-white/10 max-w-full max-h-48 object-contain bg-black/10"
                      />
                    );
                  }
                  if (file.fileType === "audio" || file.fileType === "voice") {
                    return (
                      <VoiceMessage 
                        key={idx} 
                        audioUrl={file.url} 
                        duration={file.duration}
                        isSender={true}
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
                        className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/10 text-white hover:bg-black/30 transition"
                      >
                        <LuDownload className="text-white text-base" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold truncate max-w-[140px]">{file.name || "Document"}</span>
                          <span className="text-[9px] text-white/70 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Message Body text */}
            {message.text ? (
              isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    className="bg-black/25 border border-white/20 rounded-lg p-1 text-xs text-white outline-none focus:ring-1 focus:ring-white/40"
                    autoFocus
                  />
                  <button type="submit" className="text-[10px] bg-white text-black font-black px-2.5 py-1 rounded-lg">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] text-white/80 hover:text-white">Cancel</button>
                </form>
              ) : (
                <p className="text-xs font-medium whitespace-pre-wrap leading-relaxed break-words">{message.text}</p>
              )
            ) : null}
          </div>

          {/* Reactions */}
          {Array.isArray(message.reactions) && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1 bg-surface border border-border px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              {message.reactions.map((r, i) => (
                <span key={i} title={r.user?.username}>{r.emoji}</span>
              ))}
            </div>
          )}

          {/* Status Metadata & Timestamp */}
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            {message.isEdited && <span className="text-[9px] text-text-muted font-bold uppercase">Edited</span>}
            <span className="text-[9px] text-text-muted font-medium">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.status === 'sending' ? (
              <span className="w-2.5 h-2.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" title="Sending..." />
            ) : message.status === 'failed' ? (
              <button 
                onClick={() => RetryMessage(message)} 
                className="text-[9px] text-rose-400 font-bold hover:text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30 transition"
                title="Tap to resend"
              >
                Retry
              </button>
            ) : message.isRead ? (
              <LuCheckCheck className="text-xs text-sky-400" title="Read" />
            ) : (
              <LuCheck className="text-xs text-text-muted" title="Delivered" />
            )}
          </div>
        </div>

        {/* Sender Avatar */}
        <Avatar
          src={user?.profilePic?.url}
          name={user?.username || "You"}
          size={32}
          className="flex-shrink-0"
        />
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="menu_bg z-50">
          <div className="bg-surface border border-border p-5 rounded-3xl w-full max-w-sm shadow-2xl relative flex flex-col max-h-[70vh] text-left">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <h3 className="text-xs font-black text-text-primary flex items-center gap-2">
                <LuForward className="text-primary text-sm" /> Forward Message
              </h3>
              <button 
                onClick={() => { setShowForwardModal(false); setSelectedTargets([]); }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
              <div>
                <span className="text-[9px] uppercase font-black text-text-muted tracking-widest block mb-2 px-1">Contacts</span>
                {contacts.length > 0 ? (
                  contacts.map(c => {
                    const isSelected = selectedTargets.some(t => t.id === c._id);
                    return (
                      <button 
                        key={c._id}
                        onClick={() => toggleTargetSelection(c._id, "direct")}
                        className={`w-full p-2 rounded-xl border flex items-center justify-between mb-1 text-left transition ${
                          isSelected 
                            ? "bg-primary/10 border-primary/30" 
                            : "border-border bg-bg-primary/40 hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Avatar src={c.profilePic?.url} name={c.username} size={28} />
                          <span className="text-xs font-bold text-text-primary truncate">{c.username}</span>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-xs checkbox-primary border-border" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-text-muted px-1 font-medium">No contacts available.</p>
                )}
              </div>

              <div>
                <span className="text-[9px] uppercase font-black text-text-muted tracking-widest block mb-2 px-1">Channels & Communities</span>
                {groupChats.length > 0 ? (
                  groupChats.map(g => {
                    const isSelected = selectedTargets.some(t => t.id === g._id);
                    return (
                      <button 
                        key={g._id}
                        onClick={() => toggleTargetSelection(g._id, "group")}
                        className={`w-full p-2 rounded-xl border flex items-center justify-between mb-1 text-left transition ${
                          isSelected 
                            ? "bg-primary/10 border-primary/30" 
                            : "border-border bg-bg-primary/40 hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Avatar src={g.avatar?.url} name={g.name} size={28} isGroup={true} />
                          <span className="text-xs font-bold text-text-primary truncate">{g.name}</span>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-xs checkbox-primary border-border" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-text-muted px-1 font-medium">No communities joined.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border mt-2">
              <button 
                onClick={handleSendForward}
                disabled={selectedTargets.length === 0}
                className="w-full py-2.5 text-xs font-black text-text-inverse bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
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

export default React.memo(SenderMessage);
