'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { 
    FaEdit, FaTrashAlt, FaStar, FaThumbtack, FaRegSmile, FaCheck, 
    FaCheckDouble, FaFileDownload, FaShare, FaTimes, FaReply 
} from "react-icons/fa";
import { MessageContext } from '../Context/MessageContext';

const SenderMessage = ({ message, user }) => {
  const { 
      EditMessage, DeleteMessage, SendReaction, TogglePin, 
      ToggleStar, RetryMessage, contacts, groupChats, handleForwardMessage,
      setReplyMessage
  } = useContext(MessageContext);

  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(message.text);

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
    <div className="flex justify-end mb-6 relative group transition-all duration-300">
      {/* Options Hover Overlay */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 hidden group-hover:flex items-center gap-1 bg-surface border border-border p-1.5 rounded-xl shadow-lg z-10 transition-all duration-300 animate-fade-in">
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
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-xs text-text-secondary hover:text-emerald-500 hover:bg-surface-hover rounded-lg transition"
          title="Edit"
        >
          <FaEdit />
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
        <button 
          onClick={() => DeleteMessage(message._id)}
          className="p-2 text-xs text-text-secondary hover:text-rose-500 hover:bg-surface-hover rounded-lg transition"
          title="Delete"
        >
          <FaTrashAlt />
        </button>
      </div>

      {/* Emoji Reaction Drawer */}
      {showReactions && (
        <div className="absolute top-[-42px] left-4 bg-surface border border-border p-1.5 rounded-xl shadow-xl flex gap-2.5 z-20 animate-fade-in">
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

      {/* Content wrapper */}
      <div className="flex max-w-[70%] gap-3 items-end">
        <div className="flex flex-col items-end text-right">
          {/* Pinned label indicators */}
          {message.isPinned && (
            <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-1 mb-1 mr-1">
              <FaThumbtack className="text-[8px]" /> Pinned Message
            </span>
          )}

          {/* Starred indicator */}
          {isStarred && (
            <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 mb-1 mr-1">
              <FaStar className="text-[8px]" /> Starred
            </span>
          )}

          {/* Reply Reference Preview Bubble */}
          {message.replyTo && (
            <div className="bg-surface border-r-2 border-primary border border-border px-3 py-1.5 rounded-t-xl text-[11px] text-text-secondary mb-0.5 text-right w-full">
              <span className="text-[9px] font-extrabold text-primary block mb-0.5 uppercase tracking-wider">Replying to</span>
              <p className="italic truncate font-medium">{message.replyTo.text || "media attachment"}</p>
            </div>
          )}

          {/* Main message bubble content */}
          <div className={`bg-primary text-text-inverse px-4 py-3 rounded-2xl rounded-br-none shadow-md text-left transition-all duration-300 ${message.status === 'sending' ? 'opacity-75 animate-pulse' : message.status === 'failed' ? 'border border-rose-500 bg-rose-500/10 text-rose-200' : ''}`}>
            {/* If contains Photo attachments */}
            {Array.isArray(message.Photos) && message.Photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 justify-end">
                {message.Photos.map((img, index) => (
                  <a href={img.url} target="_blank" rel="noreferrer" key={index} className="block relative rounded-lg overflow-hidden border border-white/10 group bg-black/10">
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
                        className="rounded-lg border border-white/10 max-w-full max-h-48 object-contain bg-black/10"
                      />
                    );
                  }
                  if (file.fileType === "audio" || file.fileType === "voice") {
                    return (
                      <audio 
                        key={idx} 
                        src={file.url} 
                        controls 
                        className="w-64 max-w-full bg-black/5 rounded-lg"
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
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-black/10 border border-white/10 text-text-inverse hover:bg-black/20 transition-all duration-300"
                      >
                        <FaFileDownload className="text-text-inverse text-lg" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold truncate max-w-[150px]">{file.name || "Document"}</span>
                          <span className="text-[9px] text-white/60 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Editable or Standard message body text */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="bg-black/20 border border-white/20 rounded-lg p-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-white/40"
                />
                <button type="submit" className="text-[10px] bg-white text-black font-extrabold px-2 py-1 rounded-lg">Save</button>
              </form>
            ) : (
              <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{message.text}</p>
            )}
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
          <div className="flex items-center gap-1.5 mt-1.5 justify-end">
            {message.isEdited && <span className="text-[9px] text-text-muted font-bold uppercase">Edited</span>}
            <span className="text-[10px] text-text-muted font-bold">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.status === 'sending' ? (
              <span className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" title="Sending..." />
            ) : message.status === 'failed' ? (
              <button 
                onClick={() => RetryMessage(message)} 
                className="text-[10px] text-rose-500 font-extrabold hover:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500 animate-pulse transition"
                title="Tap to resend"
              >
                Retry
              </button>
            ) : message.isRead ? (
              <FaCheckDouble className="text-[10px] text-sky-400" title="Seen" />
            ) : (
              <FaCheck className="text-[10px] text-text-muted" title="Delivered" />
            )}
          </div>
        </div>

        {/* User avatar */}
        <div className="w-8.5 h-8.5">
          <Image
            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
            alt="Sender"
            width={34}
            height={34}
            className="rounded-full object-cover border border-border"
          />
        </div>
      </div>

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

export default SenderMessage;
