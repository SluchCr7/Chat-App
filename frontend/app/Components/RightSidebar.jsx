'use client';

import React, { useContext, useState, useEffect } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Image from 'next/image';
import { FaTimes, FaFileAlt, FaImages, FaUsers, FaUserShield, FaStar } from "react-icons/fa";
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
    isGroupDetailsLoading,
    fetchStarredMessages,
    ToggleStar
  } = useContext(MessageContext);

  const { authUser } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState(selectedGroup || selectedChannel ? 'members' : 'media');
  const [starredMessages, setStarredMessages] = useState([]);
  const [isStarredLoading, setIsStarredLoading] = useState(false);

  const loadStarredMessages = async () => {
    setIsStarredLoading(true);
    const msgs = await fetchStarredMessages();
    setStarredMessages(msgs);
    setIsStarredLoading(false);
  };

  const handleUnstar = async (msgId) => {
    await ToggleStar(msgId);
    setStarredMessages(prev => prev.filter(m => m._id !== msgId));
  };

  useEffect(() => {
    if (activeSubTab === 'starred') {
      loadStarredMessages();
    }
  }, [activeSubTab, selectedUser, selectedGroup, selectedChannel]);

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const groupId = selectedGroup?._id || (typeof selectedChannel?.group === 'object' ? selectedChannel.group?._id : selectedChannel?.group);
  const group = selectedGroup || (typeof selectedChannel?.group === 'object' ? selectedChannel.group : null);

  // Extract shared media and files from the active messages list
  const sharedMedia = messages.filter(m => Array.isArray(m.Photos) && m.Photos.length > 0)
    .flatMap(m => m.Photos);

  const sharedFiles = messages.filter(m => Array.isArray(m.attachments) && m.attachments.length > 0)
    .flatMap(m => m.attachments.filter(a => a.fileType === "document"));

  // Check if current user is Owner/Admin in the group
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
    <div className="fixed inset-0 z-50 md:static md:h-full md:w-[300px] lg:w-[340px] md:flex-shrink-0 flex justify-end transition-all duration-300 animate-slide-in">
      {/* Backdrop overlay on mobile */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setShowRightSidebar(false)} />
      
      {/* Sidebar Content Panel */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-[320px] md:max-w-none bg-bg-sidebar border-l border-border shadow-2xl md:shadow-none overflow-hidden">
        {/* Title Header */}
        <div className="p-4 border-b border-border bg-bg-sidebar flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-text-primary uppercase tracking-widest">Workspace Details</h3>
            <p className="text-[10px] text-text-muted mt-1">{isDirect ? 'Direct message details' : 'Community summary and management'}</p>
          </div>
          <button 
            onClick={() => setShowRightSidebar(false)}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-rose-500 transition-all duration-300"
            aria-label="Close sidebar"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Target details */}
        <div className="p-5 flex flex-col items-center text-center border-b border-border space-y-4 bg-bg-sidebar/40">
          <Image
            src={
              isDirect 
                ? selectedUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                : group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"
            }
            alt="avatar"
            width={84}
            height={84}
            className="w-20 h-20 rounded-full object-cover border border-border shadow-lg"
          />
          <div className="space-y-2 w-full">
            <h4 className="font-bold text-base text-text-primary leading-snug truncate">{isDirect ? selectedUser.username : group?.name}</h4>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-surface px-3 py-1 text-[10px] font-semibold text-text-primary border border-border">
                {isDirect ? `@${selectedUser.profileName}` : group?.isPrivate ? 'Private community' : 'Open community'}
              </span>
              {!isDirect && (
                <span className="rounded-full bg-surface px-3 py-1 text-[10px] font-semibold text-text-primary border border-border">
                  {group?.membersCount || group?.members?.length || 0} members
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary max-w-[28rem] mx-auto leading-relaxed font-medium">
              {isDirect ? selectedUser.description || "No bio description added." : group?.description || "Welcome to this community. Use the tabs below to review members, channels, requests, media, and files."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="rounded-3xl bg-surface/90 border border-border p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Channels</p>
              <p className="text-sm font-bold text-text-primary mt-1">{groupChannels.length || 0}</p>
            </div>
            <div className="rounded-3xl bg-surface/90 border border-border p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Media</p>
              <p className="text-sm font-bold text-text-primary mt-1">{sharedMedia.length}</p>
            </div>
            <div className="rounded-3xl bg-surface/90 border border-border p-3 text-center sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Files</p>
              <p className="text-sm font-bold text-text-primary mt-1">{sharedFiles.length}</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs Navigation */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-border bg-bg-sidebar/60 sm:grid-cols-3">
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('members')}
              className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
                activeSubTab === 'members' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
              }`}
            >
              <span className="flex items-center justify-center gap-2"><FaUsers className="text-[11px]" /> Members</span>
            </button>
          )}
          {isGroup && (
            <button 
              onClick={() => setActiveSubTab('channels')}
              className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
                activeSubTab === 'channels' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
              }`}
            >
              <span className="flex items-center justify-center gap-2"><span className="text-[10px]">#</span> Channels</span>
            </button>
          )}
          {isGroup && (group && ["owner", "admin"].includes(getGroupRole())) && (
            <button 
              onClick={() => setActiveSubTab('requests')}
              className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
                activeSubTab === 'requests' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
              }`}
            >
              <span className="flex items-center justify-center gap-2"><FaUserShield className="text-[11px]" /> Requests</span>
            </button>
          )}
          <button 
            onClick={() => setActiveSubTab('media')}
            className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
              activeSubTab === 'media' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
            }`}
          >
            <span className="flex items-center justify-center gap-2"><FaImages className="text-[11px]" /> Media</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('files')}
            className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
              activeSubTab === 'files' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
            }`}
          >
            <span className="flex items-center justify-center gap-2"><FaFileAlt className="text-[11px]" /> Files</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('starred')}
            className={`py-2 text-xs font-semibold rounded-2xl transition-all duration-300 ${
              activeSubTab === 'starred' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary bg-bg-sidebar"
            }`}
          >
            <span className="flex items-center justify-center gap-2"><FaStar className="text-[11px]" /> Starred</span>
          </button>
        </div>

        {/* Lists contents */}
        <div className="flex-1 overflow-y-auto p-4 wa-scroll">
        
        {/* Group members list */}
        {isGroup && activeSubTab === 'members' && group && (
          <div className="space-y-2">
            {group.members?.map((member, i) => {
              const u = member.user;
              const role = member.role;
              const isSelf = u._id?.toString() === authUser._id.toString();
              const myRole = getGroupRole();
              const canManage = (myRole === "owner" || myRole === "admin") && !isSelf && role !== "owner";

              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover transition duration-300">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={u.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt="avatar"
                      width={30}
                      height={30}
                      unoptimized
                      className="w-7.5 h-7.5 rounded-full object-cover border border-border"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-text-primary leading-tight">{u.username}</span>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                        {role === "owner" ? "👑 Owner" : role === "admin" ? "🛡️ Admin" : "👤 Member"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action toggles */}
                  {canManage && (
                    <div className="flex gap-1.5">
                      {role !== "admin" && (
                        <button 
                          onClick={() => handlePromoteAdmin(u._id)}
                          className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300"
                          title="Make Admin"
                        >
                          Promote
                        </button>
                      )}
                      <button 
                        onClick={() => handleKickMember(u._id)}
                        className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all duration-300"
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

        {/* Group channels list */}
        {isGroup && activeSubTab === 'channels' && (
          <div className="space-y-2">
            {isGroupDetailsLoading ? (
              <p className="text-xs text-text-muted text-center py-6">Loading channels…</p>
            ) : groupChannels.length > 0 ? (
              groupChannels.map((channel) => {
                const isSelectedChannel = selectedChannel && selectedChannel._id === channel._id;
                const isPrivate = channel.type === "private";
                const isAnnouncement = channel.type === "announcement";

                return (
                  <button
                    key={channel._id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
                      isSelectedChannel ? "bg-primary/10 border-primary/20 text-primary shadow-sm" : "bg-surface border-border hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">#{channel.name}</p>
                        <p className="text-[10px] text-text-muted truncate">{channel.description || "No channel description"}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isAnnouncement ? "bg-warning/10 text-warning" : isPrivate ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
                        {channel.type}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-text-muted text-center py-6">No channels created yet. Open the group header to add one.</p>
            )}
          </div>
        )}

        {isGroup && activeSubTab === 'requests' && (
          <div className="space-y-3">
            {group?.joinRequests && group.joinRequests.length > 0 ? (
              group.joinRequests.map((requestUser) => (
                <div key={requestUser._id} className="p-3 rounded-xl bg-surface border border-border flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={requestUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt={requestUser.username}
                      width={44}
                      height={44}
                      unoptimized
                      className="w-11 h-11 rounded-full object-cover border border-border"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-text-primary">{requestUser.username}</p>
                      <p className="text-[10px] text-text-muted">@{(requestUser.profileName || '').replace(/^@/, '')}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">Pending</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'approve')}
                      className="flex-1 px-3 py-2 rounded-xl bg-success text-white text-[11px] font-semibold"
                    >Approve</button>
                    <button
                      onClick={() => handleGroupRequestResponse(group._id, requestUser._id, 'reject')}
                      className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-text-primary text-[11px] font-semibold"
                    >Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted text-center py-6">No pending requests right now. Group requests will appear here for admin review.</p>
            )}
          </div>
        )}

        {/* Media elements */}
        {activeSubTab === 'media' && (
          sharedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((photo, i) => (
                <a 
                  href={photo.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  key={i} 
                  className="aspect-square rounded-lg overflow-hidden border border-border bg-bg-primary hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <Image src={photo.url} alt="media" width={200} height={200} unoptimized className="object-cover w-full h-full" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-6 font-medium">No shared media found</p>
          )
        )}

        {/* Generic File lists */}
        {activeSubTab === 'files' && (
          sharedFiles.length > 0 ? (
            <div className="space-y-2">
              {sharedFiles.map((file, i) => (
                <a 
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover transition duration-300"
                >
                  <FaFileAlt className="text-primary text-base" />
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="text-xs font-semibold text-text-primary truncate max-w-[130px]">{file.name}</span>
                    <span className="text-[9px] text-text-muted font-bold mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-6 font-medium">No shared files found</p>
          )
        )}

        {/* Starred Messages list */}
        {activeSubTab === 'starred' && (
          <div className="space-y-3">
            {isStarredLoading ? (
              <p className="text-xs text-text-muted text-center py-6">Loading starred messages…</p>
            ) : starredMessages.length > 0 ? (
              starredMessages.map((msg) => {
                const isSentByMe = msg.sender?._id === authUser._id || msg.sender === authUser._id;
                const senderName = isSentByMe ? "You" : (msg.sender?.username || "Someone");
                
                return (
                  <div key={msg._id} className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col gap-2 relative group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={msg.sender?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                          alt="avatar"
                          width={24}
                          height={24}
                          unoptimized
                          className="w-6 h-6 rounded-full object-cover border border-border"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-semibold text-text-primary leading-tight">{senderName}</span>
                          <span className="text-[9px] text-text-muted mt-0.5">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnstar(msg._id)}
                        className="p-1 rounded-full text-warning hover:text-text-muted hover:bg-surface-hover transition-all duration-300"
                        title="Unstar message"
                      >
                        <FaStar className="text-xs" />
                      </button>
                    </div>

                    {/* Message Body */}
                    <div className="text-xs text-text-secondary leading-relaxed text-left pl-8 pr-2 break-words">
                      {msg.text && <p>{msg.text}</p>}
                      
                      {msg.Photos && msg.Photos.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          {msg.Photos.map((photo, index) => (
                            <a href={photo.url} target="_blank" rel="noreferrer" key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                              <Image src={photo.url} alt="photo" width={100} height={100} unoptimized className="object-cover w-full h-full" />
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {msg.audio && (
                        <div className="mt-2 p-2 rounded-xl bg-bg-primary/50 border border-border flex items-center gap-2 max-w-xs">
                          <span className="text-xs">🎤 Voice Note ({msg.audio.duration}s)</span>
                        </div>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((file, index) => (
                            <a href={file.url} target="_blank" rel="noreferrer" key={index} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-bg-primary/50 border border-border hover:bg-surface transition-colors truncate">
                              <span className="text-[10px] truncate">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-text-muted text-center py-6 font-medium">No starred messages in this chat yet.</p>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
  );
};

export default RightSidebar;
