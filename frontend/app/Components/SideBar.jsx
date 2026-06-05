'use client';

import React, { useContext, useEffect, useState } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { FaUser, FaUsers, FaPlus, FaSearch, FaChevronRight, FaVolumeMute, FaThumbtack } from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Logo from './Logo';
import Link from 'next/link';

const formatLastActivityTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if it is today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if it is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }
    
    // Check if it is within 7 days
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older dates
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const SideBar = () => {
    const { 
        isSidebarLoading,
        directChats,
        contacts, 
        groupChats, 
        selectedUser, 
        selectedGroup, 
        selectedChannel,
        setSelectedUser,
        setSelectedGroup,
        setSelectedChannel,
        totalUnread,
        requests,
        searchQuery,
        setSearchQuery,
        searchSuggestions,
        isSearching,
        groupSearchResults,
        isGroupSearching,
        handleSearchGroups,
        handleAddContact,
        handleJoinGroup,
        handleRespondInvite,
        handleGroupRequestResponse,
        CreateGroup,
        typingUsers
    } = useContext(MessageContext);

    const { authUser, onlineUsers } = useContext(AuthContext);
    
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups'
    const [showGroupDiscovery, setShowGroupDiscovery] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupPrivate, setNewGroupPrivate] = useState(false);
    const [showContacts, setShowContacts] = useState(false);

    // Expand contacts list automatically if directChats is empty
    useEffect(() => {
        if (!isSidebarLoading && directChats?.length === 0) {
            setShowContacts(true);
        }
    }, [isSidebarLoading, directChats?.length]);

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

    // Filter & Sort Logic for Direct Chats (Conversations)
    const filteredDirectChats = (directChats || []).filter(chat => {
        const user = chat.recipient;
        if (!user) return false;
        return (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
               (user.profileName && user.profileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
               (chat.lastMessage?.text && chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const sortedDirectChats = [...filteredDirectChats].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
    });

    // Filter & Sort Logic for Groups
    const filteredGroups = (groupChats || []).filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.lastMessage?.text && g.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const sortedGroups = [...filteredGroups].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
    });

    // Filter contacts who do not have an active chat conversation yet
    const directChatUserIds = (directChats || []).map(c => c.recipient?._id);
    const contactsWithoutChats = (contacts || []).filter(c => !directChatUserIds.includes(c._id));

    const filteredContactsWithoutChats = contactsWithoutChats.filter(user => 
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.profileName && user.profileName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const suggestionContacts = searchSuggestions;

    const activeGroupRequests = requests?.joinRequests || [];
    const incomingGroupInvites = requests?.invites || [];

    const renderDirectChatItem = (chat) => {
        const user = chat.recipient;
        if (!user) return null;
        
        const isSelected = selectedUser && selectedUser._id === user._id && !selectedGroup && !selectedChannel;
        const isOnline = onlineUsers.includes(user._id) || user.isOnline;
        
        let statusColor = "bg-text-disabled";
        if (isOnline) {
            if (user.status === "away") statusColor = "bg-warning";
            else if (user.status === "busy") statusColor = "bg-error";
            else statusColor = "bg-success status-glow-online";
        }

        const isTyping = typingUsers[user._id]?.isTyping;

        const renderLastMessageContent = () => {
            if (isTyping) {
                return <span className="text-success font-semibold animate-pulse">typing...</span>;
            }
            
            if (chat.draft) {
                return (
                    <span className="text-rose-400 font-semibold truncate block">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 mr-1">Draft</span>
                        <span className="text-text-secondary font-medium">{chat.draft}</span>
                    </span>
                );
            }
            
            if (!chat.lastMessage) {
                return <span className="text-text-muted truncate italic">No messages yet</span>;
            }
            
            const isSentByMe = chat.lastMessage.sender === authUser?._id || chat.lastMessage.sender?._id === authUser?._id;
            const senderPrefix = isSentByMe ? "You: " : "";
            
            let messageContent = chat.lastMessage.text || "";
            if (chat.lastMessage.messageType === "image" || (chat.lastMessage.Photos && chat.lastMessage.Photos.length > 0)) {
                messageContent = "📷 Photo";
            } else if (chat.lastMessage.messageType === "audio" || chat.lastMessage.audio) {
                messageContent = "🎤 Voice note";
            } else if (chat.lastMessage.attachments && chat.lastMessage.attachments.length > 0) {
                messageContent = "📁 File";
            }
            
            return (
                <span className={`truncate block max-w-full ${chat.unreadCount > 0 ? "text-text-primary font-semibold" : "text-text-muted"}`}>
                    {senderPrefix}{messageContent}
                </span>
            );
        };

        return (
            <button
                key={`chat-${chat._id}`}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 mb-1.5 flex items-center justify-between rounded-xl border transition-all duration-300 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex-shrink-0 flex items-center">
                        <Image 
                            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            width={40}
                            height={40}
                            alt="avatar"
                            className="rounded-full object-cover border border-border w-10 h-10"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar ${statusColor}`}></div>
                    </div>
                    <div className="flex flex-col items-start text-left overflow-hidden flex-1 leading-tight">
                        <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-semibold truncate ${isSelected ? "text-primary-light" : "text-text-primary"}`}>
                                {user.username}
                            </span>
                            {chat.lastActivity && (
                                <span className="text-[10px] text-text-muted flex-shrink-0 ml-1">
                                    {formatLastActivityTime(chat.lastActivity)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-0.5 text-xs text-text-secondary overflow-hidden">
                            <div className="overflow-hidden flex-1 pr-2">
                                {renderLastMessageContent()}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {chat.isMuted && <FaVolumeMute className="text-[10px] text-text-muted" />}
                                {chat.isPinned && <FaThumbtack className="text-[10px] text-primary" />}
                                {chat.unreadCount > 0 && (
                                    <span className="bg-primary text-text-inverse text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.25)] animate-pulse">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    const renderContactItem = (user) => {
        const isSelected = selectedUser && selectedUser._id === user._id && !selectedGroup && !selectedChannel;
        const isOnline = onlineUsers.includes(user._id) || user.isOnline;
        
        let statusColor = "bg-text-disabled";
        if (isOnline) {
            if (user.status === "away") statusColor = "bg-warning";
            else if (user.status === "busy") statusColor = "bg-error";
            else statusColor = "bg-success status-glow-online";
        }

        return (
            <button
                key={`contact-${user._id}`}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 mb-1 flex items-center justify-between rounded-xl border transition-all duration-300 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex-shrink-0 flex items-center">
                        <Image 
                            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            width={36}
                            height={36}
                            alt="avatar"
                            className="rounded-full object-cover border border-border w-9 h-9"
                        />
                        <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar ${statusColor}`}></div>
                    </div>
                    <div className="flex flex-col items-start text-left overflow-hidden flex-1">
                        <span className={`text-sm font-semibold truncate ${isSelected ? "text-primary-light" : "text-text-primary"}`}>{user.username}</span>
                        <span className="text-[11px] text-text-muted font-medium truncate">@{(user.profileName || '').replace('@', '')}</span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[10px] text-primary animate-pulse" />}
            </button>
        );
    };

    const renderGroupItem = (group) => {
        const isSelected = selectedGroup && selectedGroup._id === group._id;
        const typingInfo = typingUsers[group._id];
        const isTyping = typingInfo?.isTyping;

        const renderGroupLastMessageContent = () => {
            if (isTyping) {
                return <span className="text-success font-semibold animate-pulse">{typingInfo.senderName} is typing...</span>;
            }
            
            if (group.draft) {
                return (
                    <span className="text-rose-400 font-semibold truncate block">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 mr-1">Draft</span>
                        <span className="text-text-secondary font-medium">{group.draft}</span>
                    </span>
                );
            }
            
            if (!group.lastMessage) {
                return <span className="text-text-muted truncate italic">No messages yet</span>;
            }
            
            const isSentByMe = group.lastMessage.sender === authUser?._id || group.lastMessage.sender?._id === authUser?._id;
            const senderName = isSentByMe ? "You" : (group.lastMessage.sender?.username || "Someone");
            const senderPrefix = `${senderName}: `;
            
            let messageContent = group.lastMessage.text || "";
            if (group.lastMessage.messageType === "image" || (group.lastMessage.Photos && group.lastMessage.Photos.length > 0)) {
                messageContent = "📷 Photo";
            } else if (group.lastMessage.messageType === "audio" || group.lastMessage.audio) {
                messageContent = "🎤 Voice note";
            } else if (group.lastMessage.attachments && group.lastMessage.attachments.length > 0) {
                messageContent = "📁 File";
            }
            
            return (
                <span className={`truncate block max-w-full ${group.unreadCount > 0 ? "text-text-primary font-semibold" : "text-text-muted"}`}>
                    {senderPrefix}{messageContent}
                </span>
            );
        };

        return (
            <button
                key={`group-${group._id}`}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-3 mb-1.5 flex items-center justify-between rounded-xl border transition-all duration-300 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex-shrink-0">
                        <Image 
                            src={group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"}
                            width={40}
                            height={40}
                            alt="avatar"
                            className="rounded-full object-cover border border-border w-10 h-10"
                        />
                        <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-accent flex items-center justify-center">
                            <FaUsers className="text-[8px] text-text-inverse" />
                        </div>
                    </div>
                    <div className="flex flex-col items-start text-left overflow-hidden flex-1 leading-tight">
                        <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-semibold truncate ${isSelected ? "text-primary-light" : "text-text-primary"}`}>
                                {group.name}
                            </span>
                            {group.lastActivity && (
                                <span className="text-[10px] text-text-muted flex-shrink-0 ml-1">
                                    {formatLastActivityTime(group.lastActivity)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-0.5 text-xs text-text-secondary overflow-hidden">
                            <div className="overflow-hidden flex-1 pr-2">
                                {renderGroupLastMessageContent()}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {group.isMuted && <FaVolumeMute className="text-[10px] text-text-muted" />}
                                {group.isPinned && <FaThumbtack className="text-[10px] text-primary" />}
                                {group.unreadCount > 0 && (
                                    <span className="bg-primary text-text-inverse text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.25)] animate-pulse">
                                        {group.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <aside className="w-full h-full bg-bg-sidebar flex flex-col overflow-hidden transition-all duration-300">
            {/* Sidebar header */}
            <div className="p-5 border-b border-border space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {authUser ? (
                            <Link href="/Pages/Profile" className="relative group transition-all duration-300 flex items-center" title="View Profile">
                                <div className="relative">
                                    <Image 
                                        src={authUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                        width={36}
                                        height={36}
                                        alt="My Profile"
                                        className="rounded-full object-cover border border-border hover:ring-2 hover:ring-primary/50 transition duration-300 w-9 h-9"
                                        unoptimized
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border border-bg-sidebar bg-success status-glow-online"></div>
                                </div>
                            </Link>
                        ) : (
                            <Logo compact />
                        )}
                        {totalUnread > 0 && (
                            <span className="bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.25)] animate-pulse tracking-wide">
                                ({totalUnread})
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowGroupDiscovery(prev => !prev)}
                            className="px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-primary hover:text-primary-hover shadow-sm transition-all duration-300 text-xs font-semibold"
                        >
                            {showGroupDiscovery ? 'Hide discovery' : 'Discover Groups'}
                        </button>
                        <button 
                            onClick={() => setShowGroupModal(true)}
                            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:text-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center"
                            title="Create Group"
                        >
                            <FaPlus className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input 
                        type="text"
                        placeholder="Search contacts, profile names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-bg-primary border border-border focus:border-primary rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-all duration-300 outline-none"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-bg-primary/60 border border-border rounded-xl">
                    {['all', 'direct', 'groups'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-300 ${
                                activeTab === tab
                                ? "bg-surface text-text-primary shadow-sm"
                                : "text-text-muted hover:text-text-secondary"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {searchQuery.trim() !== '' && (
                    <div className="bg-bg-primary border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Search Suggestions</span>
                            {isSearching && <span className="text-[10px] text-text-secondary">Searching...</span>}
                        </div>
                        {suggestionContacts.length > 0 ? (
                            suggestionContacts.map((suggestion) => (
                                <div key={suggestion._id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-b-0">
                                    <div className="text-left">
                                        <p className="text-sm text-text-primary font-semibold">{suggestion.username}</p>
                                        <p className="text-[11px] text-text-muted">@{(suggestion.profileName || '').replace(/^@/, '')}</p>
                                    </div>
                                    {contacts.some(contact => contact._id === suggestion._id) ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(suggestion)}
                                            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-text-primary text-[11px] font-semibold transition-all duration-300"
                                        >
                                            Chat
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleAddContact(suggestion._id)}
                                            className="px-3 py-1.5 rounded-xl bg-primary text-text-inverse text-[11px] font-semibold transition-all duration-300"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-[11px] text-text-muted">No nearby profile-name matches yet. Try another keyword.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Chats Scroller */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {showGroupDiscovery && (
                    <div className="mb-6 p-4 bg-bg-primary border border-border rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary">Discover Groups</h3>
                                <p className="text-[11px] text-text-muted">Search public and private communities. Join open groups or request access to private ones.</p>
                            </div>
                            {isGroupSearching && <span className="text-[10px] text-primary font-semibold">Searching…</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="Search groups by name or description..."
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm bg-bg-primary border border-border rounded-xl focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                        />
                        {groupSearchQuery.trim() !== '' && (
                            <div className="space-y-3">
                                {isGroupSearching ? (
                                    <p className="text-[11px] text-text-muted">Searching public groups...</p>
                                ) : groupSearchResults.length > 0 ? (
                                    groupSearchResults.map(group => (
                                        <div key={group._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface">
                                            <div>
                                                <p className="text-sm font-semibold text-text-primary">{group.name}</p>
                                                <p className="text-[11px] text-text-muted">{group.description || 'No description provided'}</p>
                                                <p className="text-[10px] text-text-secondary mt-1">{group.membersCount} members • {group.isPrivate ? 'Private' : 'Open'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleJoinGroup(group.inviteLink)}
                                                disabled={group.isJoined || group.isPending}
                                                className={`px-3 py-2 rounded-xl text-text-inverse text-xs font-semibold ${group.isJoined || group.isPending ? 'bg-text-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
                                            >
                                                {group.isJoined ? 'Joined' : group.isPending ? 'Requested' : group.isPrivate ? 'Request access' : 'Join'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[11px] text-text-muted">No groups found matching your search.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isSidebarLoading ? (
                    <SideBarSkeleton activeTab={activeTab} />
                ) : (
                    <>
                        {/* DMs Section */}
                        {(activeTab === 'all' || activeTab === 'direct') && (
                            <div className="mb-6">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Direct Messages</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{sortedDirectChats.length}</span>
                                </div>
                                {sortedDirectChats.length > 0 ? (
                                    sortedDirectChats.map(renderDirectChatItem)
                                ) : (
                                    <p className="text-xs text-text-muted px-2 py-2 font-medium">No active chats. Choose a contact below or search above to start messaging!</p>
                                )}
                            </div>
                        )}

                        {/* Collapsible Contacts Section */}
                        {(activeTab === 'all' || activeTab === 'direct') && (
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowContacts(prev => !prev)}
                                    className="w-full px-2 mb-2 flex items-center justify-between text-left hover:text-text-primary transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">My Contacts</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">
                                            {filteredContactsWithoutChats.length}
                                        </span>
                                    </div>
                                    <FaChevronRight className={`text-[10px] text-text-muted transition-transform duration-300 ${showContacts ? "rotate-90" : ""}`} />
                                </button>
                                {showContacts && (
                                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                        {filteredContactsWithoutChats.length > 0 ? (
                                            filteredContactsWithoutChats.map(renderContactItem)
                                        ) : (
                                            <p className="text-xs text-text-muted px-2 py-2 font-medium">No other contacts found. Use the search field above to find users by profile name.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Groups Section */}
                        {(activeTab === 'all' || activeTab === 'groups') && (
                            <div>
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Groups & Communities</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{sortedGroups.length}</span>
                                </div>
                                {sortedGroups.length > 0 ? (
                                    sortedGroups.map(renderGroupItem)
                                ) : (
                                    <p className="text-xs text-text-muted px-2 py-2 font-medium">No groups joined yet — try discovering a new community above.</p>
                                )}
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'direct') && activeGroupRequests.length > 0 && (
                            <div className="mb-6">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Pending Group Requests</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{activeGroupRequests.length}</span>
                                </div>
                                {activeGroupRequests.map((req) => (
                                    <div key={req._id} className="mb-2 p-3 rounded-xl border border-border bg-surface flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-text-primary">{req.group.name}</p>
                                                <p className="text-[11px] text-text-muted">Request from {req.user.username} (@{(req.user.profileName || '').replace(/^@/, '')})</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'approve')}
                                                className="flex-1 px-3 py-2 rounded-xl bg-success text-white text-xs font-semibold"
                                            >Approve</button>
                                            <button
                                                type="button"
                                                onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'reject')}
                                                className="flex-1 px-3 py-2 rounded-xl bg-error text-white text-xs font-semibold"
                                            >Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'direct') && incomingGroupInvites.length > 0 && (
                            <div className="mb-6">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Incoming Group Invites</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{incomingGroupInvites.length}</span>
                                </div>
                                {incomingGroupInvites.map((invite) => (
                                    <div key={invite._id} className="mb-2 p-3 rounded-xl border border-border bg-surface flex flex-col gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{invite.group.name}</p>
                                            <p className="text-[11px] text-text-muted">Invited by {invite.inviter.username} (@{(invite.inviter.profileName || '').replace(/^@/, '')})</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRespondInvite(invite._id, 'accept')}
                                                className="flex-1 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                                            >Accept</button>
                                            <button
                                                type="button"
                                                onClick={() => handleRespondInvite(invite._id, 'reject')}
                                                className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-text-primary text-xs font-semibold"
                                            >Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Group Modal */}
            {showGroupModal && (
                <div className="menu_bg">
                    <div className="bg-black border border-border p-7 rounded-[24px] w-full max-w-md shadow-2xl relative animate-slide-in">
                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <FaUsers className="text-primary" /> <span className="text-text-primary">Create New Community</span>
                        </h3>
                        <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Group Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter community name"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full p-3 bg-bg-primary border border-border focus:border-primary rounded-xl text-sm text-text-primary outline-none transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                                <textarea 
                                    placeholder="Brief description of the group"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    className="w-full p-3 bg-bg-primary border border-border focus:border-primary rounded-xl text-sm text-text-primary outline-none h-20 resize-none transition"
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <span className="text-xs text-text-secondary font-semibold">Private Community</span>
                                <input 
                                    type="checkbox" 
                                    checked={newGroupPrivate}
                                    onChange={(e) => setNewGroupPrivate(e.target.checked)}
                                    className="checkbox checkbox-primary checkbox-sm border-border bg-bg-primary"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowGroupModal(false)}
                                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition-all duration-300"
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

export default SideBar;