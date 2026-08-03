'use client';

import React, { useContext, useEffect, useState } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { FaUser, FaUsers, FaPlus, FaSearch, FaChevronRight, FaCompass, FaCheck, FaTimes } from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Logo from './Logo';
import Link from 'next/link';

const SideBar = () => {
    const { 
        isSidebarLoading,
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
        CreateGroup
    } = useContext(MessageContext);

    const { authUser, onlineUsers } = useContext(AuthContext);
    
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

    // Filter Logic
    const filteredUsers = contacts.filter(user => 
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.profileName && user.profileName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredGroups = groupChats.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const suggestionContacts = searchSuggestions;
    const activeGroupRequests = requests?.joinRequests || [];
    const incomingGroupInvites = requests?.invites || [];

    const renderUserItem = (user) => {
        const isSelected = selectedUser && selectedUser._id === user._id;
        const isOnline = onlineUsers.includes(user._id) || user.isOnline;
        
        let statusColor = "bg-text-disabled";
        if (isOnline) {
            if (user.status === "away") statusColor = "bg-amber-500";
            else if (user.status === "busy") statusColor = "bg-rose-500";
            else statusColor = "bg-emerald-500 status-glow-online";
        }

        return (
            <button
                key={`user-${user._id}`}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 mb-1.5 flex items-center justify-between rounded-2xl border transition-all duration-200 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex items-center flex-shrink-0">
                        <Image 
                            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="rounded-full object-cover border border-border w-9.5 h-9.5"
                            unoptimized
                        />
                        <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar ${statusColor}`}></div>
                    </div>
                    <div className="flex flex-col items-start text-left truncate">
                        <span className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-primary" : "text-text-primary"}`}>
                            {user.username}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                            @{user.profileName ? user.profileName.replace('@', '') : 'user'}
                        </span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[9px] text-primary flex-shrink-0 ml-2" />}
            </button>
        );
    };

    const renderGroupItem = (group) => {
        const isSelected = selectedGroup && selectedGroup._id === group._id;
        return (
            <button
                key={`group-${group._id}`}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-3 mb-1.5 flex items-center justify-between rounded-2xl border transition-all duration-200 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex-shrink-0">
                        <Image 
                            src={group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="rounded-full object-cover border border-border w-9.5 h-9.5"
                            unoptimized
                        />
                        <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-accent flex items-center justify-center">
                            <FaUsers className="text-[8px] text-text-inverse" />
                        </div>
                    </div>
                    <div className="flex flex-col items-start text-left truncate">
                        <span className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-primary" : "text-text-primary"}`}>
                            {group.name}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium mt-0.5">
                            {group?.membersCount || group?.members?.length || 0} members
                        </span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[9px] text-primary flex-shrink-0 ml-2" />}
            </button>
        );
    };

    return (
        <aside className="w-full h-full bg-bg-sidebar flex flex-col overflow-hidden transition-all duration-300 border-r border-border">
            {/* Sidebar header */}
            <div className="p-4 border-b border-border space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {authUser ? (
                            <Link href="/Pages/Profile" className="relative group flex items-center" title="View Account Profile">
                                <div className="relative">
                                    <Image 
                                        src={authUser.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                        width={36}
                                        height={36}
                                        alt="My Profile"
                                        className="rounded-full object-cover border border-border hover:ring-2 hover:ring-primary/40 transition duration-300 w-9 h-9"
                                        unoptimized
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border border-bg-sidebar bg-emerald-500 status-glow-online"></div>
                                </div>
                            </Link>
                        ) : (
                            <Logo compact />
                        )}
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
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                                showGroupDiscovery 
                                    ? "bg-primary text-text-inverse border-primary" 
                                    : "bg-surface border-border hover:bg-surface-hover text-text-primary"
                            }`}
                        >
                            <FaCompass className="text-xs" />
                            <span className="hidden sm:inline">{showGroupDiscovery ? 'Hide' : 'Discover'}</span>
                        </button>
                        <button 
                            onClick={() => setShowGroupModal(true)}
                            className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:border-primary/30 transition-all duration-200 flex items-center justify-center"
                            title="Create Community Group"
                        >
                            <FaPlus className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                    <input 
                        type="text"
                        placeholder="Search contacts, DMs, groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-bg-primary border border-border focus:border-primary rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-all duration-200"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-bg-primary border border-border rounded-xl">
                    {['all', 'direct', 'groups'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg capitalize transition-all duration-200 ${
                                activeTab === tab
                                ? "bg-surface text-primary shadow-sm border border-border/50"
                                : "text-text-muted hover:text-text-secondary"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search suggestions autocomplete popup */}
                {searchQuery.trim() !== '' && (
                    <div className="bg-bg-primary border border-border rounded-2xl p-3 shadow-xl space-y-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Suggestions</span>
                            {isSearching && <span className="text-[10px] text-primary font-bold">Searching...</span>}
                        </div>
                        {suggestionContacts.length > 0 ? (
                            suggestionContacts.map((suggestion) => (
                                <div key={suggestion._id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-b-0">
                                    <div className="text-left truncate">
                                        <p className="text-xs text-text-primary font-bold truncate">{suggestion.username}</p>
                                        <p className="text-[10px] text-text-muted truncate">@{suggestion.profileName ? suggestion.profileName.replace(/^@/, '') : ''}</p>
                                    </div>
                                    {contacts.some(contact => contact._id === suggestion._id) ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(suggestion)}
                                            className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary text-[10px] font-bold transition"
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
                            <p className="text-[10px] text-text-muted font-medium">No matching user handles found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 wa-scroll">
                {showGroupDiscovery && (
                    <div className="mb-4 p-4 bg-bg-primary border border-border rounded-2xl space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-text-primary">Discover Public Communities</h3>
                                <p className="text-[10px] text-text-muted">Search public groups and request access to private channels.</p>
                            </div>
                            {isGroupSearching && <span className="text-[10px] text-primary font-bold">Searching…</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="Search by community name..."
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-xl focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                        />
                        {groupSearchQuery.trim() !== '' && (
                            <div className="space-y-2 mt-2">
                                {isGroupSearching ? (
                                    <p className="text-[10px] text-text-muted font-semibold">Searching public directory...</p>
                                ) : groupSearchResults.length > 0 ? (
                                    groupSearchResults.map(group => (
                                        <div key={group._id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border bg-surface">
                                            <div className="text-left truncate">
                                                <p className="text-xs font-bold text-text-primary truncate">{group.name}</p>
                                                <p className="text-[10px] text-text-muted truncate">{group.description || 'No description'}</p>
                                                <p className="text-[9px] text-text-secondary font-semibold mt-0.5">{group.membersCount} members • {group.isPrivate ? 'Private' : 'Open'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleJoinGroup(group.inviteLink)}
                                                disabled={group.isJoined || group.isPending}
                                                className={`px-3 py-1.5 rounded-xl text-text-inverse text-[10px] font-bold flex-shrink-0 ${group.isJoined || group.isPending ? 'bg-text-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
                                            >
                                                {group.isJoined ? 'Joined' : group.isPending ? 'Requested' : group.isPrivate ? 'Request' : 'Join'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-text-muted font-medium">No communities match search query.</p>
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
                            <div className="mb-4">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Direct Messages</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary font-bold">{filteredUsers.length}</span>
                                </div>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(renderUserItem)
                                ) : (
                                    <p className="text-[11px] text-text-muted px-2 py-2 font-medium">No direct contacts found.</p>
                                )}
                            </div>
                        )}

                        {/* Groups Section */}
                        {(activeTab === 'all' || activeTab === 'groups') && (
                            <div className="mb-4">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Communities</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary font-bold">{filteredGroups.length}</span>
                                </div>
                                {filteredGroups.length > 0 ? (
                                    filteredGroups.map(renderGroupItem)
                                ) : (
                                    <p className="text-[11px] text-text-muted px-2 py-2 font-medium">No community groups joined.</p>
                                )}
                            </div>
                        )}

                        {/* Group Requests */}
                        {(activeTab === 'all' || activeTab === 'direct') && activeGroupRequests.length > 0 && (
                            <div className="mb-4">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Join Requests</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary font-bold">{activeGroupRequests.length}</span>
                                </div>
                                {activeGroupRequests.map((req) => (
                                    <div key={req._id} className="mb-2 p-2.5 rounded-xl border border-border bg-surface flex flex-col gap-2">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-text-primary">{req.group.name}</p>
                                            <p className="text-[10px] text-text-muted">Request from {req.user.username}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'approve')}
                                                className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold"
                                            >Approve</button>
                                            <button
                                                type="button"
                                                onClick={() => handleGroupRequestResponse(req.group._id, req.user._id, 'reject')}
                                                className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold"
                                            >Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Incoming Group Invites */}
                        {(activeTab === 'all' || activeTab === 'direct') && incomingGroupInvites.length > 0 && (
                            <div className="mb-4">
                                <div className="px-2 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Group Invites</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary font-bold">{incomingGroupInvites.length}</span>
                                </div>
                                {incomingGroupInvites.map((invite) => (
                                    <div key={invite._id} className="mb-2 p-2.5 rounded-xl border border-border bg-surface flex flex-col gap-2">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-text-primary">{invite.group.name}</p>
                                            <p className="text-[10px] text-text-muted">Invited by {invite.inviter.username}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleRespondInvite(invite._id, 'accept')}
                                                className="flex-1 py-1.5 rounded-lg bg-primary text-text-inverse text-[10px] font-bold"
                                            >Accept</button>
                                            <button
                                                type="button"
                                                onClick={() => handleRespondInvite(invite._id, 'reject')}
                                                className="flex-1 py-1.5 rounded-lg bg-surface border border-border text-text-primary text-[10px] font-bold"
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
                    <div className="bg-bg-primary border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                <FaUsers className="text-primary" /> Create Community
                            </h3>
                            <button 
                                onClick={() => setShowGroupModal(false)}
                                className="text-text-muted hover:text-text-primary transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Group Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter community name"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full p-3 bg-surface border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Description</label>
                                <textarea 
                                    placeholder="Brief description of the group"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    className="w-full p-3 bg-surface border border-border focus:border-primary rounded-xl text-xs text-text-primary outline-none h-20 resize-none transition"
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-3">
                                <span className="text-xs text-text-secondary font-bold">Private Community</span>
                                <input 
                                    type="checkbox" 
                                    checked={newGroupPrivate}
                                    onChange={(e) => setNewGroupPrivate(e.target.checked)}
                                    className="checkbox checkbox-primary checkbox-sm border-border bg-surface"
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowGroupModal(false)}
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
        </aside>
    );
};

export default React.memo(SideBar);