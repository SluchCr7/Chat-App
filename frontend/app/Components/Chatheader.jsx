'use client';

import React, { useContext, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Image from 'next/image';
import { FaPhone, FaVideo, FaInfoCircle, FaLink, FaPlus, FaArrowLeft, FaHashtag } from "react-icons/fa";
import { toast } from 'react-toastify';

const Chatheader = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
    setSelectedUser,
    setSelectedGroup,
    setSelectedChannel,
    CreateChannel,
    showRightSidebar,
    setShowRightSidebar
  } = useContext(MessageContext);

  const { onlineUsers, authUser } = useContext(AuthContext);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState('public');

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const activeTarget = selectedChannel || selectedGroup || selectedUser;
  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const isChannel = !!selectedChannel;
  const currentGroup = selectedGroup || selectedChannel?.group;

  const groupRole = currentGroup?.members?.find(m => {
    const userId = m.user?._id ? m.user._id.toString() : m.user?.toString();
    return userId === authUser._id.toString();
  })?.role;
  const canCreateChannel = isGroup && ["owner", "admin", "moderator"].includes(groupRole);

  const isOnline = isDirect && (onlineUsers.includes(selectedUser._id) || selectedUser.isOnline);
  const userStatus = isDirect ? selectedUser.status || "offline" : "";

  // Copy Group Invite link
  const handleCopyInvite = () => {
    if (!selectedGroup && !selectedChannel) return;
    const groupLink = selectedGroup 
      ? `${window.location.origin}/join/${selectedGroup.inviteLink}`
      : `${window.location.origin}/join/${selectedChannel?.group?.inviteLink || ''}`;
    
    navigator.clipboard.writeText(groupLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleCreateChannelSubmit = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const groupId = selectedGroup ? selectedGroup._id : (selectedChannel.group?._id || selectedChannel.group);
    await CreateChannel(groupId, newChannelName, newChannelDesc, newChannelType);
    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelType('public');
    setShowChannelModal(false);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
    setSelectedChannel(null);
  };

  return (
    <header className="w-full h-15 min-h-[60px] flex-shrink-0 px-4 border-b border-border bg-surface flex items-center justify-between shadow-sm transition-all duration-300 z-30">
      {/* Target details */}
      <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
        <button
          onClick={handleBack}
          className="md:hidden p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center flex-shrink-0"
          title="Back to conversations list"
        >
          <FaArrowLeft className="text-xs" />
        </button>

        <div className="relative flex items-center flex-shrink-0">
          <Image
            src={
              isDirect 
                ? selectedUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                : activeTarget?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"
            }
            alt="chat_avatar"
            width={38}
            height={38}
            className="rounded-full object-cover border border-border w-9.5 h-9.5"
            unoptimized
          />
          {isDirect && (
            <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-surface ${
              isOnline 
                ? userStatus === "away" ? "bg-amber-500" : userStatus === "busy" ? "bg-rose-500" : "bg-emerald-500 status-glow-online"
                : "bg-text-disabled"
            }`}></div>
          )}
        </div>

        <div className="flex flex-col items-start min-w-0 text-left">
          <h2 className="font-bold text-sm text-text-primary flex items-center gap-1.5 leading-tight w-full truncate">
            <span className="truncate">{isDirect ? selectedUser.username : activeTarget.name}</span>
            {isChannel && (
              <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-primary/10 text-primary border border-primary/20 flex-shrink-0 flex items-center gap-1">
                <FaHashtag size={8} /> {selectedChannel.name}
              </span>
            )}
          </h2>
          <span className="text-[10px] text-text-muted font-bold mt-0.5 truncate w-full">
            {isDirect 
              ? (isOnline ? `Online (${userStatus})` : "Offline") 
              : isChannel 
                ? (selectedChannel.description || "No description added")
                : selectedGroup 
                  ? `${selectedGroup.membersCount || selectedGroup.members?.length || 0} members`
                  : ""}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {isGroup && canCreateChannel && (
          <button 
            onClick={() => setShowChannelModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-primary hover:border-primary/30 font-bold text-xs transition flex items-center gap-1"
          >
            <FaPlus className="text-[9px]" /> <span className="hidden sm:inline">Channel</span>
          </button>
        )}

        {(isGroup || isChannel) && (
          <button 
            onClick={handleCopyInvite}
            className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-primary transition flex items-center justify-center"
            title="Copy Invite Link"
          >
            <FaLink className="text-xs" />
          </button>
        )}

        <button className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center">
          <FaPhone className="text-xs" />
        </button>
        <button className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center">
          <FaVideo className="text-xs" />
        </button>
        
        <button 
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className={`p-2 rounded-xl border transition flex items-center justify-center ${
            showRightSidebar 
            ? "bg-primary/10 border-primary/30 text-primary" 
            : "bg-bg-primary border-border text-text-secondary hover:text-primary hover:bg-surface-hover"
          }`}
          title="Details"
        >
          <FaInfoCircle className="text-xs" />
        </button>
      </div>

      {/* Channel Creation Modal */}
      {showChannelModal && (
        <div className="menu_bg">
          <div className="bg-bg-primary border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <FaPlus className="text-primary" /> Create Channel
            </h3>
            <form onSubmit={handleCreateChannelSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Channel Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. general, announcements"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full p-3 bg-surface border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Description</label>
                <textarea 
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full p-3 bg-surface border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none h-20 resize-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Channel Type</label>
                <select 
                  value={newChannelType} 
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full p-3 bg-surface border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none transition"
                >
                  <option value="public">Public (Everyone can join)</option>
                  <option value="private">Private (Invite only)</option>
                  <option value="announcement">Announcement (Admins send messages)</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default React.memo(Chatheader);