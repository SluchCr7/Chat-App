'use client';

import React, { useContext, useState } from 'react';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Image from 'next/image';
import { FaTimes, FaFileAlt, FaImages, FaUsers, FaUserShield, FaTrashAlt } from "react-icons/fa";
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
    fetchGroups
  } = useContext(MessageContext);

  const { authUser } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState(selectedGroup || selectedChannel ? 'members' : 'media');

  if (!selectedUser && !selectedGroup && !selectedChannel) return null;

  const isDirect = !!selectedUser;
  const isGroup = !!selectedGroup || !!selectedChannel;
  const group = selectedGroup || selectedChannel?.group;

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
      await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${group._id}/role`, {
        targetUserId,
        newRole: "admin"
      }, { headers: { authorization: `Bearer ${token}` } });
      toast.success("Member promoted to Admin");
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to promote member");
    }
  };

  const handleKickMember = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to kick this member?")) return;
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${group._id}/kick`, {
        targetUserId
      }, { headers: { authorization: `Bearer ${token}` } });
      toast.success("Member kicked successfully");
      fetchGroups();
    } catch (err) {
      toast.error("Failed to kick member");
    }
  };

  return (
    <div className="w-full md:w-[24%] h-[90vh] bg-bg-sidebar border-l border-border flex flex-col overflow-hidden transition-all duration-300 animate-slide-in">
      {/* Title Header */}
      <div className="p-4 border-b border-border bg-bg-sidebar flex items-center justify-between">
        <h3 className="font-bold text-xs text-text-primary uppercase tracking-widest">Workspace Details</h3>
        <button 
          onClick={() => setShowRightSidebar(false)}
          className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-rose-500 transition-all duration-300"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>

      {/* Target details */}
      <div className="p-5 flex flex-col items-center text-center border-b border-border space-y-3.5 bg-bg-sidebar/40">
        <Image
          src={
            isDirect 
              ? selectedUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              : group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"
          }
          alt="avatar"
          width={72}
          height={72}
          className="rounded-full object-cover border border-border shadow-md"
        />
        <div>
          <h4 className="font-bold text-sm text-text-primary leading-snug">{isDirect ? selectedUser.username : group?.name}</h4>
          <span className="text-[11px] text-text-muted font-bold tracking-wider">
            {isDirect ? `@${selectedUser.profileName}` : `${group?.members?.length || 0} members`}
          </span>
        </div>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed font-medium">
          {isDirect ? selectedUser.description || "No bio description added." : group?.description || "Welcome to our group community!"}
        </p>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-border bg-bg-sidebar/60 p-1">
        {isGroup && (
          <button 
            onClick={() => setActiveSubTab('members')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeSubTab === 'members' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <FaUsers className="text-[10px]" /> Members
          </button>
        )}
        <button 
          onClick={() => setActiveSubTab('media')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
            activeSubTab === 'media' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <FaImages className="text-[10px]" /> Media ({sharedMedia.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('files')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
            activeSubTab === 'files' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <FaFileAlt className="text-[10px]" /> Files ({sharedFiles.length})
        </button>
      </div>

      {/* Lists contents */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        
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
                    <img 
                      src={u.profilePic?.url} 
                      alt="avatar" 
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
                  <img src={photo.url} alt="media" className="object-cover w-full h-full" />
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

      </div>
    </div>
  );
};

export default RightSidebar;
