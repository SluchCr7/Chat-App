'use client';

import React, { useContext, useEffect, useState } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { FaUser, FaUsers, FaPlus, FaSearch, FaChevronRight } from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Logo from './Logo';

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
            if (user.status === "away") statusColor = "bg-warning";
            else if (user.status === "busy") statusColor = "bg-error";
            else statusColor = "bg-success status-glow-online";
        }

        return (
            <button
                key={`user-${user._id}`}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 mb-1.5 flex items-center justify-between rounded-xl border transition-all duration-300 ${
                    isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary-light font-semibold shadow-sm" 
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                        <Image 
                            src={user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            width={40}
                            height={40}
                            alt="avatar"
                            className="rounded-full object-cover border border-border"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar ${statusColor}`}></div>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className={`text-sm leading-tight ${isSelected ? "text-primary-light" : "text-text-primary"}`}>{user.username}</span>
                        <span className="text-[11px] text-text-muted font-medium">@{(user.profileName || '').replace('@', '')}</span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[10px] text-primary animate-pulse" />}
            </button>
        );
    };

    const renderGroupItem = (group) => {
        const isSelected = selectedGroup && selectedGroup._id === group._id;
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
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Image 
                            src={group?.avatar?.url || "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png"}
                            width={40}
                            height={40}
                            alt="avatar"
                            className="rounded-full object-cover border border-border"
                        />
                        <div className="w-3.5 h-3.5 rounded-full absolute bottom-0 right-0 border-2 border-bg-sidebar bg-accent flex items-center justify-center">
                            <FaUsers className="text-[8px] text-text-inverse" />
                        </div>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className={`text-sm leading-tight ${isSelected ? "text-primary-light" : "text-text-primary"}`}>{group.name}</span>
                        <span className="text-[11px] text-text-muted font-medium">{group?.membersCount || group?.members?.length || 0} members</span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[10px] text-primary animate-pulse" />}
            </button>
        );
    };

    return (
        <aside className="w-full fixed md:w-[28%] min-h-[75vh] md:min-h-[90vh] bg-bg-sidebar border-r border-border flex flex-col overflow-hidden transition-all duration-300 md:sticky md:top-0 md:self-start">
            {/* Sidebar header */}
            <div className="p-5 border-b border-border space-y-4">
                <div className="flex items-center justify-between gap-3">
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

                {/* DMs Section */}
                {(activeTab === 'all' || activeTab === 'direct') && (
                    <div className="mb-6">
                        <div className="px-2 mb-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Direct Messages</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{filteredUsers.length}</span>
                        </div>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(renderUserItem)
                        ) : (
                            <p className="text-xs text-text-muted px-2 py-2 font-medium">No contacts found in your list. Use the search field above to find users by profile name.</p>
                        )}
                    </div>
                )}

                {/* Groups Section */}
                {(activeTab === 'all' || activeTab === 'groups') && (
                    <div>
                        <div className="px-2 mb-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Groups & Communities</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary font-bold">{filteredGroups.length}</span>
                        </div>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(renderGroupItem)
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