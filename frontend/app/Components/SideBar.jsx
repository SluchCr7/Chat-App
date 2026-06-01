'use client';

import React, { useContext, useState } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { 
    FaUser, FaUsers, FaPlus, FaSearch, FaChevronDown, FaChevronUp, 
    FaThumbtack, FaArchive, FaVolumeMute, FaVolumeUp, FaStar, 
    FaUserPlus, FaCheck, FaTimes, FaExternalLinkAlt, FaTimesCircle
} from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Logo from './Logo';

const SideBar = () => {
    const { 
        directChats,
        groupChats,
        archivedChats,
        requests,
        isSidebarLoading,
        selectedUser, 
        selectedGroup,
        selectedChannel,
        setSelectedUser,
        setSelectedGroup,
        setSelectedChannel,
        CreateGroup,
        searchQuery,
        setSearchQuery,
        searchSuggestions,
        isSearching,
        handleAddContact,
        handleTogglePin,
        handleToggleArchive,
        handleToggleMute,
        handleToggleFavorite,
        handleRespondInvite,
        handleSearchGroups,
        handleJoinGroup,
        groupSearchResults,
        isGroupSearching
    } = useContext(MessageContext);

    const { authUser, onlineUsers } = useContext(AuthContext);
    
    // Sidebar section collapsible states
    const [collapsedDM, setCollapsedDM] = useState(false);
    const [collapsedGroup, setCollapsedGroup] = useState(false);
    const [collapsedArchive, setCollapsedArchive] = useState(true); // default collapsed
    const [collapsedRequests, setCollapsedRequests] = useState(false);

    // Modal / Search Dialogue states
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupPrivate, setNewGroupPrivate] = useState(false);

    // Global Group Discovery search dialog
    const [showGroupSearch, setShowGroupSearch] = useState(false);
    const [groupSearchQuery, setGroupSearchQuery] = useState("");
    const [selectedGroupPreview, setSelectedGroupPreview] = useState(null);

    if (isSidebarLoading) return <SideBarSkeleton />;

    const handleCreateGroupSubmit = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        await CreateGroup(newGroupName, newGroupDesc, newGroupPrivate);
        setNewGroupName('');
        setNewGroupDesc('');
        setNewGroupPrivate(false);
        setShowGroupModal(false);
    };

    const triggerGroupDiscovery = (e) => {
        const val = e.target.value;
        setGroupSearchQuery(val);
        handleSearchGroups(val);
    };

    const handleOpenGroupPreview = (grp) => {
        setSelectedGroupPreview(grp);
    };

    // Sort function: pinned first, then by lastActivity DESC
    const sortChats = (chats) => {
        return [...chats].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        });
    };

    const renderDirectItem = (chat) => {
        const user = chat.recipient;
        const isSelected = selectedUser && selectedUser._id === user._id;
        const isOnline = onlineUsers.includes(user._id) || user.isOnline;
        
        let statusColor = "bg-text-disabled";
        if (isOnline) {
            if (user.status === "away") statusColor = "bg-warning";
            else if (user.status === "busy") statusColor = "bg-error";
            else statusColor = "bg-success status-glow-online";
        }

        return (
            <div 
                key={`direct-${chat._id}`}
                className={`w-full p-2 mb-1 flex items-center justify-between rounded-xl border transition-all duration-300 group ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <button
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                >
                    <div className="relative flex items-center flex-shrink-0">
                        <Image 
                            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="rounded-full object-cover border border-border"
                        />
                        <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar ${statusColor}`}></div>
                    </div>
                    <div className="flex flex-col overflow-hidden leading-tight">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-sm truncate ${isSelected ? "text-primary-light font-bold" : "text-text-primary font-medium"}`}>{user.username}</span>
                            {chat.isFavorite && <FaStar className="text-[10px] text-amber-500 fill-amber-500 flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] text-text-muted truncate">
                            {chat.draft ? <span className="text-rose-400 font-semibold">Draft: {chat.draft}</span> : chat.lastMessage?.text || "No messages yet"}
                        </span>
                    </div>
                </button>

                {/* Inline Quick Action Icons displayed on hover */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-1 pl-2">
                    <button 
                        onClick={() => handleTogglePin(chat._id, "direct")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isPinned ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isPinned ? "Unpin Chat" : "Pin Chat"}
                    >
                        <FaThumbtack className={chat.isPinned ? "rotate-45" : ""} />
                    </button>
                    <button 
                        onClick={() => handleToggleMute(chat._id, "direct")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isMuted ? "text-rose-500" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isMuted ? "Unmute Notifications" : "Mute Notifications"}
                    >
                        {chat.isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                    <button 
                        onClick={() => handleToggleArchive(chat._id, "direct")}
                        className="p-1 rounded hover:bg-surface text-[10px] text-text-muted hover:text-text-secondary"
                        title="Archive Chat"
                    >
                        <FaArchive />
                    </button>
                    <button 
                        onClick={() => handleToggleFavorite(chat._id, "direct")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isFavorite ? "text-amber-500" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isFavorite ? "Remove Favorite" : "Favorite Chat"}
                    >
                        <FaStar />
                    </button>
                </div>

                {/* Unread Counter Badge */}
                {chat.unreadCount > 0 && !isSelected && (
                    <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-text-inverse bg-primary rounded-full flex-shrink-0 animate-pulse ml-2">
                        {chat.unreadCount}
                    </span>
                )}
            </div>
        );
    };

    const renderGroupItem = (chat) => {
        const isSelected = selectedGroup && selectedGroup._id === chat._id;
        
        return (
            <div 
                key={`group-${chat._id}`}
                className={`w-full p-2 mb-1 flex items-center justify-between rounded-xl border transition-all duration-300 group ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <button
                    onClick={() => setSelectedGroup(chat)}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                >
                    <div className="relative flex-shrink-0">
                        <Image 
                            src={chat?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="rounded-full object-cover border border-border"
                        />
                        <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-accent flex items-center justify-center">
                            <FaUsers className="text-[8px] text-text-inverse" />
                        </div>
                    </div>
                    <div className="flex flex-col overflow-hidden leading-tight">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-sm truncate ${isSelected ? "text-primary-light font-bold" : "text-text-primary font-medium"}`}>{chat.name}</span>
                            {chat.isFavorite && <FaStar className="text-[10px] text-amber-500 fill-amber-500 flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] text-text-muted truncate">
                            {chat.draft ? <span className="text-rose-400 font-semibold">Draft: {chat.draft}</span> : chat.lastMessage ? `${chat.lastMessage.sender?.username}: ${chat.lastMessage.text}` : `${chat.membersCount} members`}
                        </span>
                    </div>
                </button>

                {/* Inline Quick Action Icons displayed on hover */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-1 pl-2">
                    <button 
                        onClick={() => handleTogglePin(chat._id, "group")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isPinned ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isPinned ? "Unpin Community" : "Pin Community"}
                    >
                        <FaThumbtack className={chat.isPinned ? "rotate-45" : ""} />
                    </button>
                    <button 
                        onClick={() => handleToggleMute(chat._id, "group")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isMuted ? "text-rose-500" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isMuted ? "Mute Notifications" : "Mute Notifications"}
                    >
                        {chat.isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                    <button 
                        onClick={() => handleToggleArchive(chat._id, "group")}
                        className="p-1 rounded hover:bg-surface text-[10px] text-text-muted hover:text-text-secondary"
                        title="Archive Community"
                    >
                        <FaArchive />
                    </button>
                    <button 
                        onClick={() => handleToggleFavorite(chat._id, "group")}
                        className={`p-1 rounded hover:bg-surface text-[10px] ${chat.isFavorite ? "text-amber-500" : "text-text-muted hover:text-text-secondary"}`}
                        title={chat.isFavorite ? "Remove Favorite" : "Favorite Community"}
                    >
                        <FaStar />
                    </button>
                </div>

                {/* Unread Counter Badge */}
                {chat.unreadCount > 0 && !isSelected && (
                    <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-text-inverse bg-primary rounded-full flex-shrink-0 animate-pulse ml-2">
                        {chat.unreadCount}
                    </span>
                )}
            </div>
        );
    };

    const renderArchivedItem = (chat) => {
        if (chat.type === "group") {
            return (
                <div key={`archived-group-${chat._id}`} className="w-full p-2 mb-1 flex items-center justify-between rounded-xl hover:bg-surface-hover text-text-secondary">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Image src={chat?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"} width={34} height={34} alt="avatar" className="rounded-full object-cover" />
                        <div className="flex flex-col overflow-hidden leading-tight">
                            <span className="text-sm font-medium text-text-primary truncate">{chat.name}</span>
                            <span className="text-[10px] text-text-muted">Archived Group</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleArchive(chat._id, "group")}
                        className="text-xs p-1 text-primary hover:text-primary-hover font-semibold"
                        title="Unarchive"
                    >
                        Restore
                    </button>
                </div>
            );
        } else {
            const user = chat.recipient;
            return (
                <div key={`archived-direct-${chat._id}`} className="w-full p-2 mb-1 flex items-center justify-between rounded-xl hover:bg-surface-hover text-text-secondary">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Image src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} width={34} height={34} alt="avatar" className="rounded-full object-cover" />
                        <div className="flex flex-col overflow-hidden leading-tight">
                            <span className="text-sm font-medium text-text-primary truncate">{user.username}</span>
                            <span className="text-[10px] text-text-muted">Archived DM</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleArchive(chat._id, "direct")}
                        className="text-xs p-1 text-primary hover:text-primary-hover font-semibold"
                        title="Unarchive"
                    >
                        Restore
                    </button>
                </div>
            );
        }
    };

    return (
        <aside className="w-full md:w-[28%] min-h-[90vh] bg-bg-sidebar border-r border-border flex flex-col overflow-hidden transition-all duration-300">
            {/* Sidebar header */}
            <div className="p-5 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo compact />
                        {totalUnread > 0 && (
                            <span className="bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.25)] animate-pulse tracking-wide">
                                Messages ({totalUnread})
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowGroupSearch(true)}
                            className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:text-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center"
                            title="Discover Groups"
                        >
                            <FaSearch className="text-xs" />
                        </button>
                        <button 
                            onClick={() => setShowGroupModal(true)}
                            className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:text-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center"
                            title="Create Community"
                        >
                            <FaPlus className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Global Contact Search Input */}
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input 
                        type="text"
                        placeholder="Search profileName (username)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-bg-primary border border-border focus:border-primary rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-all duration-300 outline-none"
                    />
                </div>

                {/* Global Search suggestions display dropdown */}
                {searchQuery && (
                    <div className="absolute left-4 right-4 bg-black border border-border rounded-2xl shadow-2xl p-3 z-50 animate-slide-in space-y-2 mt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">
                            <span>User Search Suggestions</span>
                            {isSearching && <span className="loading loading-spinner loading-xs text-primary"></span>}
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-2 scrollbar-thin">
                            {searchSuggestions.length > 0 ? (
                                searchSuggestions.map(user => {
                                    const isOnline = onlineUsers.includes(user._id) || user.isOnline;
                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-2 rounded-xl bg-surface/30 border border-border/50 hover:bg-surface-hover transition duration-200">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="relative flex-shrink-0">
                                                    <Image src={user.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} width={32} height={32} alt="avatar" className="rounded-full object-cover border border-border" />
                                                    <div className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border border-bg-sidebar ${isOnline ? "bg-success" : "bg-text-disabled"}`}></div>
                                                </div>
                                                <div className="flex flex-col text-left min-w-0">
                                                    <span className="text-xs font-semibold text-text-primary truncate">{user.username}</span>
                                                    <span className="text-[10px] text-text-muted">@{user.profileName}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddContact(user._id)}
                                                className="p-1.5 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary text-primary hover:text-text-inverse transition duration-300 flex items-center justify-center"
                                                title="Add to Contacts"
                                            >
                                                <FaUserPlus className="text-xs" />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-text-muted text-center py-2 font-medium">No profileName matched.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Collapsible Lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                
                {/* 1. DIRECT MESSAGES */}
                <div>
                    <button 
                        onClick={() => setCollapsedDM(!collapsedDM)}
                        className="w-full px-2 py-1.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-text-secondary transition duration-200"
                    >
                        <span>Direct Messages ({directChats.length})</span>
                        {collapsedDM ? <FaChevronDown className="text-[8px]" /> : <FaChevronUp className="text-[8px]" />}
                    </button>
                    {!collapsedDM && (
                        <div className="mt-1 space-y-0.5">
                            {directChats.length > 0 ? (
                                sortChats(directChats).map(renderDirectItem)
                            ) : (
                                <p className="text-xs text-text-muted px-2 py-2 font-medium">No direct chats started. Search profileName to add contacts!</p>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. GROUPS & COMMUNITIES */}
                <div>
                    <button 
                        onClick={() => setCollapsedGroup(!collapsedGroup)}
                        className="w-full px-2 py-1.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-text-secondary transition duration-200"
                    >
                        <span>Groups & Communities ({groupChats.length})</span>
                        {collapsedGroup ? <FaChevronDown className="text-[8px]" /> : <FaChevronUp className="text-[8px]" />}
                    </button>
                    {!collapsedGroup && (
                        <div className="mt-1 space-y-0.5">
                            {groupChats.length > 0 ? (
                                sortChats(groupChats).map(renderGroupItem)
                            ) : (
                                <p className="text-xs text-text-muted px-2 py-2 font-medium">No communities joined. Search groups in the discovery list!</p>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. REQUESTS */}
                {((requests.invites || []).length > 0 || (requests.joinRequests || []).length > 0) && (
                    <div>
                        <button 
                            onClick={() => setCollapsedRequests(!collapsedRequests)}
                            className="w-full px-2 py-1.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-primary hover:text-primary-hover transition duration-200"
                        >
                            <span>Requests & Invites ({(requests.invites || []).length + (requests.joinRequests || []).length})</span>
                            {collapsedRequests ? <FaChevronDown className="text-[8px]" /> : <FaChevronUp className="text-[8px]" />}
                        </button>
                        {!collapsedRequests && (
                            <div className="mt-1 space-y-2">
                                {/* Group Invites */}
                                {requests.invites.map(invite => (
                                    <div key={invite._id} className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <Image src={invite.group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"} width={30} height={30} alt="avatar" className="rounded-full object-cover" />
                                            <div className="flex flex-col text-left leading-tight overflow-hidden">
                                                <span className="text-xs font-semibold text-text-primary truncate">{invite.group?.name}</span>
                                                <span className="text-[10px] text-text-muted">Invited by @{invite.inviter?.profileName}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleRespondInvite(invite._id, "accept")}
                                                className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-primary text-text-inverse hover:bg-primary-hover transition flex items-center justify-center gap-1"
                                            >
                                                <FaCheck className="text-[8px]" /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleRespondInvite(invite._id, "reject")}
                                                className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-surface border border-border text-rose-500 hover:bg-surface-hover transition flex items-center justify-center gap-1"
                                            >
                                                <FaTimes className="text-[8px]" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. ARCHIVED */}
                <div>
                    <button 
                        onClick={() => setCollapsedArchive(!collapsedArchive)}
                        className="w-full px-2 py-1.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-text-secondary transition duration-200"
                    >
                        <span>Archived ({archivedChats.length})</span>
                        {collapsedArchive ? <FaChevronDown className="text-[8px]" /> : <FaChevronUp className="text-[8px]" />}
                    </button>
                    {!collapsedArchive && (
                        <div className="mt-1 space-y-0.5">
                            {archivedChats.length > 0 ? (
                                sortChats(archivedChats).map(renderArchivedItem)
                            ) : (
                                <p className="text-xs text-text-muted px-2 py-2 font-medium">No archived chats.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Global Group Search Discovery Dialog */}
            {showGroupSearch && (
                <div className="menu_bg z-50">
                    <div className="bg-black border border-border p-7 rounded-[24px] w-full max-w-lg shadow-2xl relative animate-slide-in flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <FaSearch className="text-primary" /> <span className="text-text-primary">Discover Groups & Channels</span>
                            </h3>
                            <button 
                                onClick={() => { setShowGroupSearch(false); setGroupSearchResults([]); setGroupSearchQuery(""); setSelectedGroupPreview(null); }}
                                className="text-text-muted hover:text-text-primary transition"
                            >
                                <FaTimesCircle className="text-xl" />
                            </button>
                        </div>
                        
                        <div className="relative w-full mb-4">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                            <input 
                                type="text"
                                placeholder="Search public or private groups by name..."
                                value={groupSearchQuery}
                                onChange={triggerGroupDiscovery}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-bg-primary border border-border focus:border-primary rounded-xl text-text-primary outline-none transition"
                            />
                        </div>

                        {/* Double pane layout: Left lists groups, Right shows active Group Preview */}
                        <div className="flex-1 flex gap-4 overflow-hidden min-h-[40vh]">
                            {/* Groups List */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin">
                                {isGroupSearching ? (
                                    <div className="flex items-center justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>
                                ) : groupSearchResults.length > 0 ? (
                                    groupSearchResults.map(grp => (
                                        <button 
                                            key={grp._id}
                                            onClick={() => handleOpenGroupPreview(grp)}
                                            className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all duration-300 text-left ${
                                                selectedGroupPreview && selectedGroupPreview._id === grp._id
                                                ? "bg-primary/10 border-primary/20"
                                                : "border-border bg-surface/30 hover:bg-surface-hover"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Image src={grp.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"} width={36} height={36} alt="avatar" className="rounded-full object-cover" />
                                                <div className="flex flex-col overflow-hidden leading-tight">
                                                    <span className="text-xs font-semibold text-text-primary truncate">{grp.name}</span>
                                                    <span className="text-[10px] text-text-muted">{grp.membersCount} members</span>
                                                </div>
                                            </div>
                                            <FaExternalLinkAlt className="text-[10px] text-primary" />
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-text-muted text-center py-10 font-medium">Type a query to discover communities</p>
                                )}
                            </div>

                            {/* Group Preview Pane */}
                            {selectedGroupPreview && (
                                <div className="w-[45%] border-l border-border pl-4 flex flex-col justify-between animate-fade-in">
                                    <div className="space-y-4 text-center">
                                        <div className="flex justify-center">
                                            <Image src={selectedGroupPreview.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"} width={70} height={70} alt="avatar" className="rounded-full object-cover border border-border shadow-md" />
                                        </div>
                                        <div className="leading-tight">
                                            <h4 className="text-sm font-bold text-text-primary">{selectedGroupPreview.name}</h4>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-semibold uppercase tracking-wider">{selectedGroupPreview.isPrivate ? "Private" : "Public"}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary max-h-24 overflow-y-auto scrollbar-thin text-left">{selectedGroupPreview.description || "No description provided."}</p>
                                        <div className="text-[11px] text-text-muted text-left border-t border-border pt-2 space-y-1">
                                            <div><strong>Members count:</strong> {selectedGroupPreview.membersCount}</div>
                                            <div><strong>Created by:</strong> @{selectedGroupPreview.creator?.profileName}</div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        {selectedGroupPreview.isJoined ? (
                                            <button className="w-full py-2.5 text-xs font-bold rounded-xl bg-surface border border-border text-success cursor-default flex items-center justify-center gap-1.5">
                                                <FaCheck /> Joined
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { handleJoinGroup(selectedGroupPreview.inviteLink); setShowGroupSearch(false); }}
                                                className="w-full py-2.5 text-xs font-bold rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition duration-300"
                                            >
                                                {selectedGroupPreview.isPrivate ? "Request Access" : "Join Community"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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