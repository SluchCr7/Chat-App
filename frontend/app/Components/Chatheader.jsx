'use client';

import React, { useContext, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Image from 'next/image';
import { FaPhone, FaVideo, FaInfoCircle, FaLink, FaPlus } from "react-icons/fa";
import { toast } from 'react-toastify';

const Chatheader = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
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

  // Determine presence
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

  return (
    <header className="w-full p-4 border-b border-border bg-surface flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shadow-sm transition-all duration-300">
      {/* Target details */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex items-center">
          <Image
            src={
              isDirect 
                ? selectedUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                : activeTarget?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"
            }
            alt="chat_avatar"
            width={42}
            height={42}
            className="rounded-full object-cover border border-border"
          />
          {isDirect && (
            <div className={`w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-surface ${
              isOnline 
                ? userStatus === "away" ? "bg-warning" : userStatus === "busy" ? "bg-error" : "bg-success status-glow-online"
                : "bg-text-disabled"
            }`}></div>
          )}
        </div>

        <div className="flex flex-col items-start">
          <h2 className="font-bold text-sm text-text-primary flex items-center gap-1.5 leading-tight">
            {isDirect ? selectedUser.username : activeTarget.name}
            {isChannel && <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-primary/10 text-primary border border-primary/20"># {selectedChannel.name}</span>}
          </h2>
          <span className="text-[11px] text-text-muted font-bold mt-0.5">
            {isDirect 
              ? (isOnline ? `Online (${userStatus})` : "Offline") 
              : isGroup 
                ? `${selectedGroup.members?.length || 0} members`
                : selectedChannel.description || "No description added"}
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap items-center gap-3.5 justify-end">
        {/* Channel dropdown button */}
        {isGroup && canCreateChannel && (
          <button 
            onClick={() => setShowChannelModal(true)}
            className="px-3 py-1.5 rounded-xl bg-bg-primary hover:bg-surface border border-border hover:border-border-hover text-primary hover:text-primary-hover font-bold text-xs transition duration-300 flex items-center gap-1.5"
          >
            <FaPlus className="text-[9px]" /> Channel
          </button>
        )}
        {isGroup && !canCreateChannel && (
          <button 
            disabled
            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-text-disabled font-bold text-xs transition duration-300 flex items-center gap-1.5"
            title="Only owners, admins, or moderators can create channels"
          >
            <FaPlus className="text-[9px]" /> Channel
          </button>
        )}

        {(isGroup || isChannel) && (
          <button 
            onClick={handleCopyInvite}
            className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-primary transition-all duration-300 flex items-center justify-center shadow-sm"
            title="Copy Invite Link"
          >
            <FaLink className="text-sm" />
          </button>
        )}

        <button className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-text-primary transition-all duration-300 flex items-center justify-center shadow-sm">
          <FaPhone className="text-sm" />
        </button>
        <button className="p-2.5 rounded-xl bg-bg-primary hover:bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-text-primary transition-all duration-300 flex items-center justify-center shadow-sm">
          <FaVideo className="text-sm" />
        </button>
        
        <button 
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-sm ${
            showRightSidebar 
            ? "bg-primary/10 border-primary/20 text-primary" 
            : "bg-bg-primary border-border text-text-secondary hover:text-primary hover:border-border-hover hover:bg-surface"
          }`}
          title="Details"
        >
          <FaInfoCircle className="text-sm" />
        </button>
      </div>

      {/* Channel Creation Modal */}
      {showChannelModal && (
        <div className="menu_bg">
          <div className="bg-modal-bg border border-border p-7 rounded-[24px] w-full max-w-md shadow-2xl relative animate-slide-in">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <FaPlus className="text-primary" /> Create New Channel
            </h3>
            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Channel Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. general, announcements"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full p-3 bg-bg-primary border border-border focus:border-primary rounded-xl text-sm text-text-primary outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                <textarea 
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full p-3 bg-bg-primary border border-border focus:border-primary rounded-xl text-sm text-text-primary outline-none h-20 resize-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Channel Type</label>
                <select 
                  value={newChannelType} 
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full p-3 bg-bg-primary border border-border focus:border-primary rounded-xl text-sm text-text-primary outline-none transition"
                >
                  <option value="public">Public (Everyone can join)</option>
                  <option value="private">Private (Invite only)</option>
                  <option value="announcement">Announcement (Admins only send messages)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition-all duration-300"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Chatheader;