'use client';

import React, { useContext, useState, useEffect } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Avatar from './Avatar';
import Image from 'next/image';
import { 
  FaTimes, FaFileAlt, FaImages, FaUsers, FaUserShield, FaHashtag 
} from "react-icons/fa";
import { 
  LuX, LuFileText, LuImage, LuUsers, LuShield, LuHash, 
  LuDownload, LuCheck, LuUserCheck, LuUserX 
} from "react-icons/lu";
import { toast } from 'react-toastify';
import axios from 'axios';

const RightSidebar = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
    messages = [],
    setSelectedChannel,
    setShowRightSidebar,
    fetchSidebarData,
    fetchGroupDetails,
    handleGroupRequestResponse,
    groupChannels = [],
    isGroupDetailsLoading
  } = useContext(MessageContext);

  const { authUser } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState(selectedGroup || selectedChannel ? 'members' : 'media');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowRightSidebar(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setShowRightSidebar]);

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const groupId = selectedGroup?._id || (typeof selectedChannel?.group === 'object' ? selectedChannel.group?._id : selectedChannel?.group);
  const group = selectedGroup || (typeof selectedChannel?.group === 'object' ? selectedChannel.group : null);

  // Shared media and files extraction
  const sharedMedia = (messages || []).filter(m => Array.isArray(m.Photos) && m.Photos.length > 0)
    .flatMap(m => m.Photos);

  const sharedFiles = (messages || []).filter(m => Array.isArray(m.attachments) && m.attachments.length > 0)
    .flatMap(m => m.attachments.filter(a => a.fileType === "document"));

  const getGroupRole = () => {
    if (!isGroup || !group) return null;
    const member = group.members?.find(m => m.user?._id?.toString() === authUser?._id?.toString() || m.user === authUser?._id);
    return member?.role || null;
  };

  const handlePromoteAdmin = async (targetUserId) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/role`, {
        targetUserId,
        newRole: "admin"
      }, { headers: { authorization: `Bearer ${token}` } });
      toast.success("Member promoted to Admin");
      await fetchGroupDetails(groupId);
      fetchSidebarData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to promote member");
    }
  };

  const handleKickMember = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to remove this member from the community?")) return;
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/kick`, {
        targetUserId
      }, { headers: { authorization: `Bearer ${token}` } });
      toast.success("Member removed successfully");
      await fetchGroupDetails(groupId);
      fetchSidebarData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:static md:h-full md:w-[300px] lg:w-[330px] md:flex-shrink-0 flex justify-end transition-all duration-200">
      {/* Backdrop for mobile view */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm md:hidden" 
        onClick={() => setShowRightSidebar(false)} 
        aria-hidden="true"
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-[320px] md:max-w-none bg-bg-sidebar border-l border-border shadow-2xl md:shadow-none overflow-hidden text-left">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-bg-sidebar/90 backdrop-blur-md flex items-center justify-between">
          <div>
            <h3 className="font-black text-xs text-text-primary uppercase tracking-widest">
              Conversation Details
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">
              {isDirect ? 'Direct conversation details' : 'Community settings & members'}
            </p>
          </div>
          <button 
            onClick={() => setShowRightSidebar(false)}
            className="p-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
            aria-label="Close sidebar"
          >
            <LuX className="text-sm" />
          </button>
        </div>

        {/* Target Identity Card */}
        <div className="p-5 flex flex-col items-center text-center border-b border-border space-y-3 bg-bg-sidebar/40">
          <Avatar
            src={isDirect ? selectedUser.profilePic?.url : group?.avatar?.url}
            name={isDirect ? selectedUser.username : group?.name}
            size={64}
            isGroup={!isDirect}
          />

          <div className="space-y-1 w-full">
            <h4 className="font-bold text-sm text-text-primary leading-tight truncate">
              {isDirect ? selectedUser.username : group?.name}
            </h4>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-[9px] font-bold text-text-primary border border-border uppercase tracking-wider">
                {isDirect ? `@${selectedUser.profileName ? selectedUser.profileName.replace('@', '') : 'user'}` : group?.isPrivate ? 'Private Space' : 'Open Space'}
              </span>
              {!isDirect && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[9px] font-bold text-text-primary border border-border uppercase tracking-wider">
                  {group?.membersCount || group?.members?.length || 0} members
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-medium mt-2 max-w-xs">
              {isDirect ? selectedUser.description || "No bio description added." : group?.description || "Welcome to this space. Use the tabs below to explore channels and media."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            <div className="rounded-xl bg-surface border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Channels</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{groupChannels.length || 0}</p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Photos</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{sharedMedia.length}</p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Docs</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{sharedFiles.length}</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs Navigation */}
        <div className="flex p-1.5 border-b border-border bg-bg-sidebar gap-1 overflow-x-auto">
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('members')}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
                activeSubTab === 'members' ? "bg-surface text-primary border border-border/80 shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Members
            </button>
          )}
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('channels')}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
                activeSubTab === 'channels' ? "bg-surface text-primary border border-border/80 shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Channels
            </button>
          )}
          {isGroup && (group && ["owner", "admin"].includes(getGroupRole())) && (
            <button 
              onClick={() => setActiveSubTab('requests')}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
                activeSubTab === 'requests' ? "bg-surface text-primary border border-border/80 shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Requests
            </button>
          )}
          <button 
            onClick={() => setActiveSubTab('media')}
            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'media' ? "bg-surface text-primary border border-border/80 shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Photos
          </button>
          <button 
            onClick={() => setActiveSubTab('files')}
            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'files' ? "bg-surface text-primary border border-border/80 shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Files
          </button>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          
          {/* Members list */}
          {isGroup && activeSubTab === 'members' && group && (
            <div className="space-y-1.5">
              {group.members?.map((member, i) => {
                const u = member.user;
                const role = member.role;
                const isSelf = u._id?.toString() === authUser?._id?.toString();
                const myRole = getGroupRole();
                const canManage = (myRole === "owner" || myRole === "admin") && !isSelf && role !== "owner";

                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar src={u?.profilePic?.url} name={u?.username} size={28} />
                      <div className="flex flex-col text-left truncate">
                        <span className="text-xs font-bold text-text-primary truncate">{u?.username}</span>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                          {role === "owner" ? "👑 Owner" : role === "admin" ? "🛡️ Admin" : "Member"}
                        </span>
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex gap-1 flex-shrink-0">
                        {role !== "admin" && (
                          <button 
                            onClick={() => handlePromoteAdmin(u._id)}
                            className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                            title="Promote to Admin"
                          >
                            Admin
                          </button>
                        )}
                        <button 
                          onClick={() => handleKickMember(u._id)}
                          className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition"
                          title="Remove from Community"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Channels list */}
          {isGroup && activeSubTab === 'channels' && (
            <div className="space-y-1.5">
              {isGroupDetailsLoading ? (
                <p className="text-xs text-text-muted text-center py-4 font-medium">Loading channels...</p>
              ) : groupChannels.length > 0 ? (
                groupChannels.map((channel) => {
                  const isSelectedChannel = selectedChannel && selectedChannel._id === channel._id;

                  return (
                    <button
                      key={channel._id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left p-2.5 rounded-xl border transition ${
                        isSelectedChannel ? "bg-primary/10 border-primary/30 text-primary shadow-sm" : "bg-surface border-border hover:bg-surface-hover"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-text-primary flex items-center gap-1">
                            <LuHash size={12} className="text-primary" /> {channel.name}
                          </p>
                          <p className="text-[10px] text-text-muted truncate mt-0.5">{channel.description || "Community channel"}</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-surface border border-border text-text-secondary">
                          {channel.type}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-medium">No channels created yet.</p>
              )}
            </div>
          )}

          {/* Requests list */}
          {isGroup && activeSubTab === 'requests' && (
            <div className="space-y-2">
              {group?.joinRequests && group.joinRequests.length > 0 ? (
                group.joinRequests.map((requestUser) => (
                  <div key={requestUser._id} className="p-2.5 rounded-xl bg-surface border border-border flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={requestUser.profilePic?.url} name={requestUser.username} size={32} />
                      <div className="flex-1 text-left truncate">
                        <p className="text-xs font-bold text-text-primary truncate">{requestUser.username}</p>
                        <p className="text-[9px] text-text-muted truncate">@{requestUser.profileName}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'approve')}
                        className="flex-1 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'reject')}
                        className="flex-1 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary text-[10px] font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-medium">No pending join requests.</p>
              )}
            </div>
          )}

          {/* Media gallery */}
          {activeSubTab === 'media' && (
            sharedMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((photo, i) => (
                  <a 
                    href={photo.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    key={i} 
                    className="aspect-square rounded-xl overflow-hidden border border-border bg-bg-primary hover:scale-105 transition flex items-center justify-center group"
                  >
                    <Image src={photo.url} alt="shared media" width={180} height={180} unoptimized className="object-cover w-full h-full" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4 font-medium">No shared photos in this conversation.</p>
            )
          )}

          {/* Files gallery */}
          {activeSubTab === 'files' && (
            sharedFiles.length > 0 ? (
              <div className="space-y-1.5">
                {sharedFiles.map((file, i) => (
                  <a 
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition"
                  >
                    <LuFileText className="text-primary text-base flex-shrink-0" />
                    <div className="flex flex-col text-left truncate flex-1">
                      <span className="text-xs font-bold text-text-primary truncate">{file.name}</span>
                      <span className="text-[9px] text-text-muted font-medium mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4 font-medium">No shared documents in this conversation.</p>
            )
          )}

        </div>
      </div>
    </div>
  );
};

export default React.memo(RightSidebar);
