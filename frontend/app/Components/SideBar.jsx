'use client';

import React, { useContext, useState } from 'react';
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { FaUser, FaUsers, FaPlus, FaSearch, FaChevronRight } from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Logo from './Logo';

const SideBar = () => {
    const { 
        isUserLoading, 
        users, 
        groups, 
        isGroupsLoading,
        selectedUser, 
        selectedGroup, 
        selectedChannel,
        setSelectedUser,
        setSelectedGroup,
        setSelectedChannel,
        CreateGroup
    } = useContext(MessageContext);

    const { authUser, onlineUsers } = useContext(AuthContext);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups'
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupPrivate, setNewGroupPrivate] = useState(false);

    if (isUserLoading || isGroupsLoading) return <SideBarSkeleton />;

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
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.profileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <span className="text-[11px] text-text-muted font-medium">@{user.profileName.replace('@', '')}</span>
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
                        <span className="text-[11px] text-text-muted font-medium">{group.members?.length || 0} members</span>
                    </div>
                </div>
                {isSelected && <FaChevronRight className="text-[10px] text-primary animate-pulse" />}
            </button>
        );
    };

    return (
        <aside className="w-full md:w-[28%] min-h-[90vh] bg-bg-sidebar border-r border-border flex flex-col overflow-hidden transition-all duration-300">
            {/* Sidebar header */}
            <div className="p-5 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <Logo compact />
                    <button 
                        onClick={() => setShowGroupModal(true)}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary hover:text-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center"
                        title="Create Group"
                    >
                        <FaPlus className="text-xs" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input 
                        type="text"
                        placeholder="Search chats, groups..."
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
            </div>

            {/* Chats Scroller */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
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
                            <p className="text-xs text-text-muted px-2 py-2 font-medium">No contacts found</p>
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
                            <p className="text-xs text-text-muted px-2 py-2 font-medium">No groups joined yet</p>
                        )}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showGroupModal && (
                <div className="menu_bg">
                    <div className="bg-modal-bg border border-border p-7 rounded-[24px] w-full max-w-md shadow-2xl relative animate-slide-in">
                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <FaUsers className="text-primary" /> Create New Community
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