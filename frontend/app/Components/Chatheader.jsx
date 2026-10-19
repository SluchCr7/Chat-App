'use client';

import React, { useContext, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Avatar from './Avatar';
import { 
  FaPhone, FaVideo, FaInfoCircle, FaLink, FaPlus, FaArrowLeft, 
  FaHashtag, FaUsers, FaLock, FaGlobe, FaTimes 
} from "react-icons/fa";
import { 
  LuPhone, LuVideo, LuInfo, LuLink, LuPlus, LuArrowLeft, 
  LuHash, LuUsers, LuCheck, LuLock, LuGlobe 
} from "react-icons/lu";
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

  const { onlineUsers = [], authUser } = useContext(AuthContext);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState('public');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const activeTarget = selectedChannel || selectedGroup || selectedUser;
  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const isChannel = !!selectedChannel;
  const currentGroup = selectedGroup || selectedChannel?.group;

  const groupRole = currentGroup?.members?.find(m => {
    const userId = m.user?._id ? m.user._id.toString() : m.user?.toString();
    return userId === authUser?._id?.toString();
  })?.role;
  const canCreateChannel = isGroup && ["owner", "admin", "moderator"].includes(groupRole);

  const isOnline = isDirect && (onlineUsers.includes(selectedUser._id) || selectedUser.isOnline);
  const userStatus = isDirect ? selectedUser.status || "offline" : "";

  // Copy Group Invite link
  const handleCopyInvite = () => {
    if (!selectedGroup && !selectedChannel) return;
    const inviteToken = selectedGroup?.inviteLink || selectedChannel?.group?.inviteLink || '';
    if (!inviteToken) {
      toast.info("No invite link available for this group.");
      return;
    }
    const groupLink = `${window.location.origin}/join/${inviteToken}`;
    
    navigator.clipboard.writeText(groupLink);
    setCopiedLink(true);
    toast.success("Community invite link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
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
  };

  return (
    <header className="w-full h-15 min-h-[58px] flex-shrink-0 px-4 border-b border-border bg-surface/90 backdrop-blur-md flex items-center justify-between shadow-sm transition-colors duration-200 z-30 select-none">
      {/* Target details */}
      <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
        <button
          onClick={handleBack}
          className="md:hidden p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center flex-shrink-0"
          title="Back to conversation list"
          aria-label="Back to conversations"
        >
          <LuArrowLeft className="text-sm" />
        </button>

        <div className="relative flex items-center flex-shrink-0">
          <Avatar
            src={isDirect ? selectedUser.profilePic?.url : activeTarget?.avatar?.url}
            name={isDirect ? selectedUser.username : activeTarget?.name}
            size={40}
            isOnline={isOnline}
            status={userStatus}
            showStatus={isDirect}
            isGroup={!isDirect}
          />
        </div>

        <div className="flex flex-col items-start min-w-0 text-left">
          <h2 className="font-bold text-sm text-text-primary flex items-center gap-1.5 leading-tight w-full truncate">
            <span className="truncate">{isDirect ? selectedUser.username : activeTarget.name}</span>
            {isChannel && (
              <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-primary/10 text-primary border border-primary/20 flex-shrink-0 flex items-center gap-1">
                <LuHash size={10} /> {selectedChannel.name}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium mt-0.5 truncate w-full">
            {isDirect ? (
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-text-disabled'}`} />
                {isOnline ? `Active now • ${userStatus}` : "Offline"}
              </span>
            ) : isChannel ? (
              <span>{selectedChannel.description || "Active community channel"}</span>
            ) : selectedGroup ? (
              <span className="flex items-center gap-1.5">
                {selectedGroup.isPrivate ? <LuLock size={10} /> : <LuGlobe size={10} />}
                {selectedGroup.membersCount || selectedGroup.members?.length || 0} members
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {isGroup && canCreateChannel && (
          <button 
            onClick={() => setShowChannelModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-primary hover:border-primary/30 font-bold text-xs transition flex items-center gap-1.5"
            title="Create New Channel"
          >
            <LuPlus className="text-xs" />
            <span className="hidden sm:inline">Add Channel</span>
          </button>
        )}

        {(isGroup || isChannel) && (
          <button 
            onClick={handleCopyInvite}
            className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-primary transition flex items-center justify-center"
            title="Copy Group Invite Link"
            aria-label="Copy Invite Link"
          >
            {copiedLink ? <LuCheck className="text-xs text-emerald-400" /> : <LuLink className="text-xs" />}
          </button>
        )}

        <button 
          className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center opacity-70 cursor-not-allowed"
          title="Voice Calling (Coming in next release)"
          aria-label="Voice Calling"
          disabled
        >
          <LuPhone className="text-xs" />
        </button>

        <button 
          className="p-2 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition flex items-center justify-center opacity-70 cursor-not-allowed"
          title="Video Calling (Coming in next release)"
          aria-label="Video Calling"
          disabled
        >
          <LuVideo className="text-xs" />
        </button>
        
        <button 
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className={`p-2 rounded-xl border transition flex items-center justify-center ${
            showRightSidebar 
            ? "bg-primary/10 border-primary/30 text-primary" 
            : "bg-bg-primary border-border text-text-secondary hover:text-primary hover:bg-surface-hover"
          }`}
          title="Conversation Details & Members"
          aria-label="Conversation Details"
        >
          <LuInfo className="text-xs" />
        </button>
      </div>

      {/* Channel Creation Modal */}
      {showChannelModal && (
        <div className="menu_bg">
          <div className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h3 className="text-base font-black text-text-primary flex items-center gap-2">
                <LuPlus className="text-primary" /> Create Channel
              </h3>
              <button 
                onClick={() => setShowChannelModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Channel Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. general, announcements, design"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea 
                  placeholder="What is the topic of this channel?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none h-20 resize-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Channel Permission
                </label>
                <select 
                  value={newChannelType} 
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none transition"
                >
                  <option value="public">Public (All community members can view & send)</option>
                  <option value="private">Private (Invite only)</option>
                  <option value="announcement">Announcement (Only admins can send messages)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-surface hover:bg-surface-hover border border-border text-text-secondary transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition shadow-sm"
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

export default React.memo(Chatheader);