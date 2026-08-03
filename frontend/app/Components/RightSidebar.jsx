'use client';

import React, { useContext, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Image from 'next/image';
import { FaTimes, FaFileAlt, FaImages, FaUsers, FaUserShield, FaHashtag } from "react-icons/fa";
import { toast } from 'react-toastify';
import axios from 'axios';

const RightSidebar = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
    messages,
    setSelectedChannel,
    setShowRightSidebar,
    fetchSidebarData,
    fetchGroupDetails,
    handleGroupRequestResponse,
    groupChannels,
    isGroupDetailsLoading
  } = useContext(MessageContext);

  const { authUser } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState(selectedGroup || selectedChannel ? 'members' : 'media');

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const groupId = selectedGroup?._id || (typeof selectedChannel?.group === 'object' ? selectedChannel.group?._id : selectedChannel?.group);
  const group = selectedGroup || (typeof selectedChannel?.group === 'object' ? selectedChannel.group : null);

  // Shared media and files extraction
  const sharedMedia = messages.filter(m => Array.isArray(m.Photos) && m.Photos.length > 0)
    .flatMap(m => m.Photos);

  const sharedFiles = messages.filter(m => Array.isArray(m.attachments) && m.attachments.length > 0)
    .flatMap(m => m.attachments.filter(a => a.fileType === "document"));

  const getGroupRole = () => {
    if (!isGroup || !group) return null;
    const member = group.members?.find(m => m.user?._id?.toString() === authUser._id.toString() || m.user === authUser._id);
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
    if (!window.confirm("Are you sure you want to kick this member?")) return;
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/kick`, {
        targetUserId
      }, { headers: { authorization: `Bearer ${token}` } });
      toast.success("Member kicked successfully");
      await fetchGroupDetails(groupId);
      fetchSidebarData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to kick member");
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:static md:h-full md:w-[290px] lg:w-[320px] md:flex-shrink-0 flex justify-end transition-all duration-300">
      {/* Backdrop for mobile view */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setShowRightSidebar(false)} />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-[320px] md:max-w-none bg-bg-sidebar border-l border-border shadow-2xl md:shadow-none overflow-hidden text-left">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-bg-sidebar flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-widest">Details</h3>
            <p className="text-[10px] text-text-muted mt-0.5">{isDirect ? 'Direct conversation details' : 'Community settings & members'}</p>
          </div>
          <button 
            onClick={() => setShowRightSidebar(false)}
            className="p-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-rose-500 transition"
            aria-label="Close sidebar"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Target Info Header */}
        <div className="p-5 flex flex-col items-center text-center border-b border-border space-y-3 bg-bg-sidebar/50">
          <Image
            src={
              isDirect 
                ? selectedUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                : group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"
            }
            alt="avatar"
            width={72}
            height={72}
            className="w-18 h-18 rounded-full object-cover border border-border shadow-md"
            unoptimized
          />
          <div className="space-y-1 w-full">
            <h4 className="font-bold text-sm text-text-primary leading-tight truncate">{isDirect ? selectedUser.username : group?.name}</h4>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-[9px] font-extrabold text-text-primary border border-border uppercase tracking-wider">
                {isDirect ? `@${selectedUser.profileName}` : group?.isPrivate ? 'Private' : 'Open'}
              </span>
              {!isDirect && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[9px] font-extrabold text-text-primary border border-border uppercase tracking-wider">
                  {group?.membersCount || group?.members?.length || 0} members
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold mt-2">
              {isDirect ? selectedUser.description || "No bio description added." : group?.description || "Welcome to this community. Use the tabs below to view members, channels, and shared files."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            <div className="rounded-2xl bg-surface/90 border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Channels</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{groupChannels.length || 0}</p>
            </div>
            <div className="rounded-2xl bg-surface/90 border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Media</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{sharedMedia.length}</p>
            </div>
            <div className="rounded-2xl bg-surface/90 border border-border p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Files</p>
              <p className="text-xs font-black text-text-primary mt-0.5">{sharedFiles.length}</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs Navigation */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-bg-sidebar">
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('members')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition ${
                activeSubTab === 'members' ? "bg-surface text-primary border border-border shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Members
            </button>
          )}
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('channels')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition ${
                activeSubTab === 'channels' ? "bg-surface text-primary border border-border shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Channels
            </button>
          )}
          {isGroup && (group && ["owner", "admin"].includes(getGroupRole())) && (
            <button 
              onClick={() => setActiveSubTab('requests')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition ${
                activeSubTab === 'requests' ? "bg-surface text-primary border border-border shadow-sm" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Requests
            </button>
          )}
          <button 
            onClick={() => setActiveSubTab('media')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition ${
              activeSubTab === 'media' ? "bg-surface text-primary border border-border shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Media
          </button>
          <button 
            onClick={() => setActiveSubTab('files')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition ${
              activeSubTab === 'files' ? "bg-surface text-primary border border-border shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Files
          </button>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto p-3 wa-scroll">
          
          {/* Members list */}
          {isGroup && activeSubTab === 'members' && group && (
            <div className="space-y-1.5">
              {group.members?.map((member, i) => {
                const u = member.user;
                const role = member.role;
                const isSelf = u._id?.toString() === authUser._id.toString();
                const myRole = getGroupRole();
                const canManage = (myRole === "owner" || myRole === "admin") && !isSelf && role !== "owner";

                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Image
                        src={u.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                        alt="avatar"
                        width={28}
                        height={28}
                        unoptimized
                        className="w-7 h-7 rounded-full object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex flex-col text-left truncate">
                        <span className="text-xs font-bold text-text-primary truncate">{u.username}</span>
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">
                          {role === "owner" ? "👑 Owner" : role === "admin" ? "🛡️ Admin" : "👤 Member"}
                        </span>
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex gap-1 flex-shrink-0">
                        {role !== "admin" && (
                          <button 
                            onClick={() => handlePromoteAdmin(u._id)}
                            className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                            title="Promote Admin"
                          >
                            Admin
                          </button>
                        )}
                        <button 
                          onClick={() => handleKickMember(u._id)}
                          className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition"
                          title="Kick Member"
                        >
                          Kick
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
                <p className="text-xs text-text-muted text-center py-4 font-semibold">Loading channels...</p>
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
                            <FaHashtag size={10} className="text-primary" /> {channel.name}
                          </p>
                          <p className="text-[9px] text-text-muted truncate mt-0.5">{channel.description || "No description"}</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-surface border border-border text-text-secondary">
                          {channel.type}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-semibold">No channels created yet.</p>
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
                      <Image
                        src={requestUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                        alt={requestUser.username}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 text-left truncate">
                        <p className="text-xs font-bold text-text-primary truncate">{requestUser.username}</p>
                        <p className="text-[9px] text-text-muted truncate">@{requestUser.profileName}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'approve')}
                        className="flex-1 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold"
                      >Approve</button>
                      <button
                        onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'reject')}
                        className="flex-1 py-1 rounded-lg bg-surface border border-border text-text-primary text-[10px] font-bold"
                      >Reject</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-semibold">No pending join requests.</p>
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
                    className="aspect-square rounded-xl overflow-hidden border border-border bg-bg-primary hover:scale-105 transition flex items-center justify-center"
                  >
                    <Image src={photo.url} alt="media" width={180} height={180} unoptimized className="object-cover w-full h-full" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4 font-semibold">No shared media found.</p>
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
                    <FaFileAlt className="text-primary text-sm flex-shrink-0" />
                    <div className="flex flex-col text-left truncate flex-1">
                      <span className="text-xs font-bold text-text-primary truncate">{file.name}</span>
                      <span className="text-[9px] text-text-muted font-bold mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4 font-semibold">No shared files found.</p>
            )
          )}

        </div>
      </div>
    </div>
  );
};

export default React.memo(RightSidebar);
