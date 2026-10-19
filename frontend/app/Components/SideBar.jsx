'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { 
  FaUser, FaUsers, FaPlus, FaSearch, FaChevronRight, FaCompass, 
  FaCheck, FaTimes, FaThumbtack, FaVolumeMute, FaLock, FaGlobe
} from "react-icons/fa";
import { LuSearch, LuPlus, LuCompass, LuSparkles, LuCheck, LuX } from "react-icons/lu";
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Avatar from './Avatar';
import Logo from './Logo';
import Link from 'next/link';
import { format, isToday, isYesterday } from 'date-fns';

const formatChatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

const SideBar = () => {
  const { 
    isSidebarLoading,
    contacts = [], 
    directChats = [],
    groupChats = [], 
    selectedUser, 
    selectedGroup, 
    selectedChannel,
    setSelectedUser,
    setSelectedGroup,
    setSelectedChannel,
    totalUnread = 0,
    requests = { invites: [], joinRequests: [] },
    searchQuery = '',
    setSearchQuery,
    searchSuggestions = [],
    isSearching,
    groupSearchResults = [],
    isGroupSearching,
    handleSearchGroups,
    handleAddContact,
    handleJoinGroup,
    handleRespondInvite,
    handleGroupRequestResponse,
    CreateGroup
  } = useContext(MessageContext);

  const { authUser, onlineUsers = [] } = useContext(AuthContext);
  
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups'
  const [showGroupDiscovery, setShowGroupDiscovery] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (groupSearchQuery.trim() !== '') {
        handleSearchGroups(groupSearchQuery.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [groupSearchQuery, handleSearchGroups]);

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await CreateGroup(newGroupName, newGroupDesc, newGroupPrivate);
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupPrivate(false);
    setShowGroupModal(false);
  };

  // Build unified direct conversation list merging directChats + extra contacts
  const mergedDirectList = useMemo(() => {
    const items = [];
    const addedUserIds = new Set();

    // 1. Existing conversations
    (directChats || []).forEach(conv => {
      const recipient = conv.recipient;
      if (recipient && recipient._id) {
        addedUserIds.add(recipient._id.toString());
        items.push({
          conversationId: conv._id,
          user: recipient,
          lastMessage: conv.lastMessage,
          lastActivity: conv.lastActivity || conv.lastMessage?.createdAt,
          unreadCount: conv.unreadCount || 0,
          isPinned: conv.isPinned || false,
          isMuted: conv.isMuted || false,
          draft: conv.draft || '',
        });
      }
    });

    // 2. Extra contacts without an active conversation record
    (contacts || []).forEach(contact => {
      if (contact && contact._id && !addedUserIds.has(contact._id.toString())) {
        items.push({
          conversationId: null,
          user: contact,
          lastMessage: null,
          lastActivity: null,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          draft: '',
        });
      }
    });

    // Sort: Pinned first, then by most recent activity
    return items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const timeA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const timeB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return timeB - timeA;
    });
  }, [directChats, contacts]);

  // Filter Logic
  const filteredDirectItems = useMemo(() => {
    if (!searchQuery.trim()) return mergedDirectList;
    const q = searchQuery.toLowerCase();
    return mergedDirectList.filter(item => 
      (item.user.username && item.user.username.toLowerCase().includes(q)) ||
      (item.user.profileName && item.user.profileName.toLowerCase().includes(q)) ||
      (item.lastMessage?.text && item.lastMessage.text.toLowerCase().includes(q))
    );
  }, [mergedDirectList, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupChats || [];
    const q = searchQuery.toLowerCase();
    return (groupChats || []).filter(g => 
      g.name && g.name.toLowerCase().includes(q)
    );
  }, [groupChats, searchQuery]);

  const suggestionContacts = searchSuggestions || [];
  const activeGroupRequests = requests?.joinRequests || [];
  const incomingGroupInvites = requests?.invites || [];

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setSelectedChannel(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setSelectedChannel(null);
  };

  const getLastMessageSnippet = (msg) => {
    if (!msg) return null;
    if (msg.text) return msg.text;
    if (Array.isArray(msg.Photos) && msg.Photos.length > 0) return '📷 Photo';
    if (msg.voiceUrl || msg.audio) return '🎙️ Audio note';
    if (Array.isArray(msg.attachments) && msg.attachments.length > 0) return '📎 Attachment';
    return 'Media message';
  };

  return (
    <aside className="w-full h-full bg-bg-sidebar flex flex-col overflow-hidden transition-colors duration-200 border-r border-border select-none">
      
      {/* Sidebar Header */}
      <div className="p-3.5 sm:p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {authUser ? (
              <Link 
                href="/Pages/Profile" 
                className="relative group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full" 
                title="Account Settings"
                aria-label="Account Settings"
              >
                <Avatar 
                  src={authUser.profilePic?.url} 
                  name={authUser.username} 
                  size={36} 
                  isOnline={true} 
                  showStatus={true} 
                />
              </Link>
            ) : (
              <Logo compact size="sm" />
            )}

            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-wide text-text-primary">
                Messages
              </span>
              <span className="text-[10px] text-text-muted font-medium">
                {onlineUsers.length} online now
              </span>
            </div>

            {totalUnread > 0 && (
              <span className="bg-primary/15 border border-primary/30 text-primary text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">
                {totalUnread} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowGroupDiscovery(prev => !prev)}
              aria-label={showGroupDiscovery ? 'Hide Community Discovery' : 'Discover Public Communities'}
              title={showGroupDiscovery ? 'Hide Discovery' : 'Discover Communities'}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
                showGroupDiscovery 
                  ? "bg-primary text-text-inverse border-primary shadow-sm" 
                  : "bg-surface border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary"
              }`}
            >
              <LuCompass className="text-xs" />
              <span className="hidden sm:inline">{showGroupDiscovery ? 'Hide' : 'Explore'}</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowGroupModal(true)}
              aria-label="Create New Community"
              title="Create Community"
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-150 flex items-center justify-center"
            >
              <LuPlus className="text-xs" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
          <input 
            type="text"
            placeholder="Search conversations, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 text-xs bg-bg-primary border border-border focus:border-primary rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition duration-150"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs p-0.5"
              aria-label="Clear search"
            >
              <LuX />
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex p-0.5 bg-bg-primary border border-border rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct' },
            { id: 'groups', label: 'Channels' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-surface text-primary shadow-sm border border-border/60"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Autocomplete Suggestions Popup */}
        {searchQuery.trim() !== '' && (
          <div className="bg-surface border border-border rounded-2xl p-3 shadow-xl space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">User Directory</span>
              {isSearching && <span className="text-[10px] text-primary font-bold">Searching...</span>}
            </div>
            {suggestionContacts.length > 0 ? (
              suggestionContacts.map((suggestion) => (
                <div key={suggestion._id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-b-0">
                  <div className="flex items-center gap-2 truncate">
                    <Avatar src={suggestion.profilePic?.url} name={suggestion.username} size={28} />
                    <div className="text-left truncate">
                      <p className="text-xs text-text-primary font-bold truncate">{suggestion.username}</p>
                      <p className="text-[10px] text-text-muted truncate">@{suggestion.profileName ? suggestion.profileName.replace(/^@/, '') : ''}</p>
                    </div>
                  </div>
                  {contacts.some(contact => contact._id === suggestion._id) ? (
                    <button
                      type="button"
                      onClick={() => handleSelectUser(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border text-text-primary text-[10px] font-bold transition"
                    >
                      Chat
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddContact(suggestion._id)}
                      className="px-2.5 py-1 rounded-lg bg-primary text-text-inverse text-[10px] font-bold transition"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[10px] text-text-muted font-medium">No matching users found.</p>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1">
        
        {/* Discover Public Communities Panel */}
        {showGroupDiscovery && (
          <div className="mb-3 p-3 bg-bg-primary/80 border border-border rounded-2xl space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-primary">Discover Public Spaces</h3>
                <p className="text-[10px] text-text-muted">Explore open communities and join channels.</p>
              </div>
              {isGroupSearching && <span className="text-[10px] text-primary font-bold animate-pulse">Searching…</span>}
            </div>
            <input
              type="text"
              placeholder="Search communities..."
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-xl focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
            />
            {groupSearchQuery.trim() !== '' && (
              <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto">
                {isGroupSearching ? (
                  <p className="text-[10px] text-text-muted font-medium">Searching directory...</p>
                ) : groupSearchResults.length > 0 ? (
                  groupSearchResults.map(group => (
                    <div key={group._id} className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border bg-surface">
                      <div className="text-left truncate">
                        <p className="text-xs font-bold text-text-primary truncate">{group.name}</p>
                        <p className="text-[10px] text-text-muted truncate">{group.description || 'Public channel'}</p>
                        <p className="text-[9px] text-text-secondary font-medium mt-0.5">{group.membersCount} members • {group.isPrivate ? 'Private' : 'Open'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJoinGroup(group.inviteLink)}
                        disabled={group.isJoined || group.isPending}
                        className={`px-2.5 py-1.5 rounded-xl text-text-inverse text-[10px] font-bold flex-shrink-0 transition ${
                          group.isJoined || group.isPending 
                            ? 'bg-text-disabled cursor-not-allowed opacity-60' 
                            : 'bg-primary hover:bg-primary-hover shadow-sm'
                        }`}
                      >
                        {group.isJoined ? 'Joined' : group.isPending ? 'Pending' : group.isPrivate ? 'Request' : 'Join'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-text-muted font-medium">No communities match query.</p>
                )}
              </div>
            )}
          </div>
        )}

        {isSidebarLoading ? (
          <SideBarSkeleton activeTab={activeTab} />
        ) : (
          <>
            {/* Direct Messages List */}
            {(activeTab === 'all' || activeTab === 'direct') && (
              <div className="mb-3">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                    Direct Messages
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface border border-border text-text-muted font-semibold">
                    {filteredDirectItems.length}
                  </span>
                </div>

                {filteredDirectItems.length > 0 ? (
                  filteredDirectItems.map(({ conversationId, user, lastMessage, lastActivity, unreadCount, isPinned, isMuted }) => {
                    const isSelected = selectedUser && selectedUser._id === user._id;
                    const isUserOnline = onlineUsers.includes(user._id) || user.isOnline;
                    const snippet = getLastMessageSnippet(lastMessage);
                    const timeStr = formatChatTime(lastActivity);

                    return (
                      <button
                        key={`conv-${user._id}`}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full p-2.5 mb-1 flex items-center justify-between rounded-xl border transition-all duration-150 relative text-left group ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                            : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <Avatar
                            src={user.profilePic?.url}
                            name={user.username}
                            size={36}
                            isOnline={isUserOnline}
                            status={user.status || 'offline'}
                            showStatus={true}
                          />

                          <div className="flex flex-col items-start truncate min-w-0 flex-1">
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-xs font-bold truncate ${isSelected ? "text-primary" : "text-text-primary"}`}>
                                {user.username}
                              </span>
                              {timeStr && (
                                <span className="text-[9px] text-text-muted font-medium ml-1 flex-shrink-0">
                                  {timeStr}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between w-full mt-0.5">
                              <span className={`text-[11px] truncate ${unreadCount > 0 ? 'font-bold text-text-primary' : 'text-text-muted font-normal'}`}>
                                {snippet || `@${user.profileName ? user.profileName.replace('@', '') : 'contact'}`}
                              </span>

                              <div className="flex items-center gap-1 flex-shrink-0 ml-1.5">
                                {isPinned && (
                                  <FaThumbtack className="text-[9px] text-primary rotate-45" title="Pinned" />
                                )}
                                {isMuted && (
                                  <FaVolumeMute className="text-[9px] text-text-muted" title="Muted" />
                                )}
                                {unreadCount > 0 && (
                                  <span className="min-w-4 h-4 px-1 rounded-full bg-primary text-text-inverse text-[9px] font-black flex items-center justify-center shadow-sm">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-1 h-5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-text-muted px-2 py-3 text-center font-medium">
                    No conversations yet.
                  </p>
                )}
              </div>
            )}

            {/* Channels & Communities List */}
            {(activeTab === 'all' || activeTab === 'groups') && (
              <div className="mb-3">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                    Channels & Spaces
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface border border-border text-text-muted font-semibold">
                    {filteredGroups.length}
                  </span>
                </div>

                {filteredGroups.length > 0 ? (
                  filteredGroups.map(group => {
                    const isSelected = selectedGroup && selectedGroup._id === group._id;
                    const membersCount = group.membersCount || group.members?.length || 0;

                    return (
                      <button
                        key={`group-${group._id}`}
                        onClick={() => handleSelectGroup(group)}
                        className={`w-full p-2.5 mb-1 flex items-center justify-between rounded-xl border transition-all duration-150 relative text-left group ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                            : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <Avatar
                            src={group.avatar?.url}
                            name={group.name}
                            size={36}
                            isGroup={true}
                          />

                          <div className="flex flex-col items-start truncate min-w-0 flex-1">
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-xs font-bold truncate flex items-center gap-1.5 ${isSelected ? "text-primary" : "text-text-primary"}`}>
                                {group.isPrivate ? <FaLock className="text-[9px] text-text-muted" /> : <FaGlobe className="text-[9px] text-accent" />}
                                {group.name}
                              </span>
                            </div>

                            <div className="flex items-center justify-between w-full mt-0.5">
                              <span className="text-[10px] text-text-muted font-medium truncate">
                                {membersCount} {membersCount === 1 ? 'member' : 'members'}
                              </span>

                              {group.unreadCount > 0 && (
                                <span className="min-w-4 h-4 px-1 rounded-full bg-accent text-text-inverse text-[9px] font-black flex items-center justify-center shadow-sm">
                                  {group.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-1 h-5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-text-muted px-2 py-3 text-center font-medium">
                    No community channels joined.
                  </p>
                )}
              </div>
            )}

            {/* Pending Group Join Requests */}
            {activeGroupRequests.length > 0 && (
              <div className="mb-3 p-2 bg-surface/50 border border-border rounded-xl">
                <span className="text-[10px] uppercase font-black tracking-widest text-text-muted block mb-2 px-1">
                  Join Requests ({activeGroupRequests.length})
                </span>
                {activeGroupRequests.map((req) => (
                  <div key={req._id} className="p-2 mb-1.5 rounded-lg border border-border bg-surface flex flex-col gap-1.5">
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-primary">{req.group.name}</p>
                      <p className="text-[10px] text-text-muted">From @{req.user.username}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'approve')}
                        className="flex-1 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[10px] font-bold transition"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'reject')}
                        className="flex-1 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Incoming Group Invites */}
            {incomingGroupInvites.length > 0 && (
              <div className="mb-3 p-2 bg-surface/50 border border-border rounded-xl">
                <span className="text-[10px] uppercase font-black tracking-widest text-text-muted block mb-2 px-1">
                  Invitations ({incomingGroupInvites.length})
                </span>
                {incomingGroupInvites.map((invite) => (
                  <div key={invite._id} className="p-2 mb-1.5 rounded-lg border border-border bg-surface flex flex-col gap-1.5">
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-primary">{invite.group.name}</p>
                      <p className="text-[10px] text-text-muted">Invited by @{invite.inviter.username}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRespondInvite(invite._id, 'accept')}
                        className="flex-1 py-1 rounded-lg bg-primary text-text-inverse text-[10px] font-bold transition"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondInvite(invite._id, 'reject')}
                        className="flex-1 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-[10px] font-bold transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Community Group Modal */}
      {showGroupModal && (
        <div className="menu_bg">
          <div className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary flex items-center gap-2">
                <FaUsers className="text-primary" /> Create Community
              </h3>
              <button 
                onClick={() => setShowGroupModal(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition"
                aria-label="Close dialog"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Community Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Design Team, Engineering, Core Hub"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-xl text-xs text-text-primary focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea 
                  placeholder="What is this community about?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-xl text-xs text-text-primary focus:border-primary focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input 
                  type="checkbox"
                  id="groupPrivate"
                  checked={newGroupPrivate}
                  onChange={(e) => setNewGroupPrivate(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="groupPrivate" className="text-xs text-text-secondary font-medium cursor-pointer">
                  Private Community (requires invite or join request)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-xs font-bold text-text-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-text-inverse transition shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default React.memo(SideBar);