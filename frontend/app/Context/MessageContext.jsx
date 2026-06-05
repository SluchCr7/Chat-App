'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
    const { authUser, socket } = useContext(AuthContext);

    // Sidebar lists
    const [directChats, setDirectChats] = useState([]);
    const directChatsRef = useRef([]);
    useEffect(() => {
        directChatsRef.current = directChats;
    }, [directChats]);
    const [groupChats, setGroupChats] = useState([]);
    const [archivedChats, setArchivedChats] = useState([]);
    const [requests, setRequests] = useState({ invites: [], joinRequests: [] });
    const [isSidebarLoading, setIsSidebarLoading] = useState(true);

    // Contacts list
    const [contacts, setContacts] = useState([]);

    // Selection state
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);

    // Message loading state
    const [messages, setMessages] = useState([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    // Typing presence
    const [typingUsers, setTypingUsers] = useState({}); // { userId: { senderName, isTyping } }
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    // Global search and suggestions
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Group global search results
    const [groupSearchResults, setGroupSearchResults] = useState([]);
    const [isGroupSearching, setIsGroupSearching] = useState(false);
    const [groupChannels, setGroupChannels] = useState([]);
    const [isGroupDetailsLoading, setIsGroupDetailsLoading] = useState(false);

    // Reply tracking state
    const [replyMessage, setReplyMessage] = useState(null);

    // Global unread counter
    const [totalUnread, setTotalUnread] = useState(0);

    // --- 1. Fetch Conversations, Groups, Requests & Contacts ---
    const fetchSidebarData = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations`, {
                headers: { authorization: `Bearer ${token}` }
            });

            setDirectChats(res.data.direct || []);
            setGroupChats(res.data.groups || []);
            setArchivedChats(res.data.archived || []);
            setRequests(res.data.requests || { invites: [], joinRequests: [] });

            // Compute global unread total
            const directUnread = (res.data.direct || []).reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
            const groupUnread = (res.data.groups || []).reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
            setTotalUnread(directUnread + groupUnread);
        } catch (err) {
            console.error("Error fetching sidebar data:", err);
        } finally {
            setIsSidebarLoading(false);
        }
    }, [authUser]);

    const fetchContacts = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/contacts`, {
                headers: { authorization: `Bearer ${token}` }
            });
            setContacts(res.data || []);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        }
    }, [authUser]);

    useEffect(() => {
        if (authUser) {
            fetchSidebarData();
            fetchContacts();
        }
    }, [authUser, fetchSidebarData, fetchContacts]);

    // --- 2. Global User search suggestions (debounced API lookup) ---
    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === "") {
            setSearchSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const token = localStorage.getItem("userToken") || authUser?.token;
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/contacts/search?q=${searchQuery}`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                setSearchSuggestions(res.data || []);
            } catch (err) {
                console.error("Suggestions error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // --- 3. Mark Chat as Read & Sync Counters ---
    const handleMarkChatAsRead = useCallback(async (currentMessages = []) => {
        const token = localStorage.getItem("userToken") || authUser?.token;
        if (!token) return;

        let url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/read/`;
        let params = {};

        if (selectedGroup) {
            url += selectedGroup._id;
            params.type = "group";
        } else if (selectedUser) {
            const activeDM = directChatsRef.current.find(c => c.recipient?._id === selectedUser._id);
            if (activeDM) {
                url += activeDM._id;
                params.type = "direct";
            } else {
                return;
            }
        } else {
            return;
        }

        try {
            await axios.post(url, {}, {
                headers: { authorization: `Bearer ${token}` },
                params
            });

            if (selectedGroup) {
                setGroupChats(prev => prev.map(g => g._id === selectedGroup._id ? { ...g, unreadCount: 0 } : g));
            } else if (selectedUser) {
                setDirectChats(prev => prev.map(d => d.recipient?._id === selectedUser._id ? { ...d, unreadCount: 0 } : d));
            }

            fetchSidebarData();

            if (selectedUser && currentMessages.length > 0 && socket) {
                const unreadIds = currentMessages
                    .filter(m => m.sender?._id === selectedUser._id && !m.isRead)
                    .map(m => m._id);
                if (unreadIds.length > 0) {
                    socket.emit("markAsSeen", { messageIds: unreadIds, senderId: selectedUser._id });
                }
            }
        } catch (err) {
            console.error("Mark as read error:", err);
        }
    }, [authUser, selectedGroup, selectedUser, fetchSidebarData, socket]);

    // --- 4. Fetch Messages with infinite scroll support ---
    const fetchConversationMessages = useCallback(async (page = 1, append = false) => {
        if (page === 1) setIsMessagesLoading(true);
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;

            let url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/`;
            let params = { page, limit: 30 };

            if (selectedChannel) {
                url += selectedChannel._id;
                params.type = "channel";
            } else if (selectedGroup) {
                url += selectedGroup._id;
                params.type = "group";
            } else if (selectedUser) {
                url += selectedUser._id;
                params.type = "direct";
            } else {
                setMessages([]);
                return;
            }

            const res = await axios.get(url, {
                headers: { authorization: `Bearer ${token}` },
                params
            });

            if (append) {
                setMessages(prev => [...res.data, ...prev]);
            } else {
                setMessages(res.data || []);
            }

            setHasMoreMessages(res.data.length === 30);
            setMessagesPage(page);

            if (page === 1) {
                handleMarkChatAsRead(res.data);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            if (page === 1) setIsMessagesLoading(false);
        }
    }, [authUser, selectedChannel, selectedGroup, selectedUser, handleMarkChatAsRead]);

    useEffect(() => {
        fetchConversationMessages(1, false);
    }, [selectedUser, selectedGroup, selectedChannel, fetchConversationMessages]);

    // Load next page of messages (Infinite Scroll)
    const loadMoreMessages = () => {
        if (!isMessagesLoading && hasMoreMessages) {
            fetchConversationMessages(messagesPage + 1, true);
        }
    };

    // --- 5. Add Contact (+ Button) ---
    const handleAddContact = async (contactId) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/contacts`, { contactId }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Contact added successfully");
            fetchContacts();
            fetchSidebarData();
            setSearchQuery(""); // Clear search
            return res.data.contact;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add contact");
        }
    };

    // --- 6. Group Invitations & Responses ---
    const handleInviteUser = async (groupId, inviteeId) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/invite`, { groupId, inviteeId }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Invitation sent successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to invite user");
        }
    };

    const handleRespondInvite = async (inviteId, action) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/invites/${inviteId}/respond`, { action }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(`Invitation ${action === "accept" ? "accepted" : "rejected"} successfully`);
            fetchSidebarData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to respond to invite");
        }
    };

    const handleGroupRequestResponse = async (groupId, userId, action) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/requests`, { action, userId }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(`Request ${action === "approve" ? "approved" : "rejected"} successfully`);
            fetchSidebarData();
            if (selectedGroup?._id === groupId || (selectedChannel?.group?._id === groupId || selectedChannel?.group === groupId)) {
                await fetchGroupDetails(groupId);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process join request");
        }
    };

    const fetchGroupDetails = async (groupId) => {
        try {
            setIsGroupDetailsLoading(true);
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return null;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}`, {
                headers: { authorization: `Bearer ${token}` }
            });

            setGroupChannels(res.data.channels || []);
            return res.data.group;
        } catch (err) {
            console.error("Fetch group details error:", err);
            return null;
        } finally {
            setIsGroupDetailsLoading(false);
        }
    };

    const handleSearchGroups = useCallback(async (groupName) => {
        if (!groupName || groupName.trim() === "") {
            setGroupSearchResults([]);
            return;
        }
        setIsGroupSearching(true);
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/search?q=${groupName}`, {
                headers: { authorization: `Bearer ${token}` }
            });
            setGroupSearchResults(res.data || []);
        } catch (err) {
            console.error("Group search error:", err);
        } finally {
            setIsGroupSearching(false);
        }
    }, [authUser]);

    const handleJoinGroup = async (inviteLink) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/invite/${inviteLink}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            if (res.data.status === "joined") {
                toast.success("Joined group successfully");
            } else {
                toast.success("Join request submitted successfully");
            }
            setGroupSearchResults(prev => prev.map(group => group.inviteLink === inviteLink ? {
                ...group,
                isPending: res.data.status === "pending",
                isJoined: res.data.status === "joined"
            } : group));
            fetchSidebarData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to join group");
        }
    };

    // --- 7. Pin, Archive, Mute, Favorite Chat Actions ---
    const handleTogglePin = async (id, type) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/pin/${id}?type=${type}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(res.data.pinned ? "Chat pinned" : "Chat unpinned");
            fetchSidebarData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleArchive = async (id, type) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/archive/${id}?type=${type}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(res.data.archived ? "Chat archived" : "Chat unarchived");
            fetchSidebarData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleMute = async (id, type) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/mute/${id}?type=${type}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(res.data.muted ? "Notifications muted" : "Notifications unmuted");
            fetchSidebarData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleFavorite = async (id, type) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/favorite/${id}?type=${type}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(res.data.favorite ? "Added to favorites" : "Removed from favorites");
            fetchSidebarData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveDraft = async (id, type, text) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/draft/${id}?type=${type}`, { text }, {
                headers: { authorization: `Bearer ${token}` }
            });
            // Update sidebar drafts locally
            if (type === "group") {
                setGroupChats(prev => prev.map(g => g._id === id ? { ...g, draft: text } : g));
            } else {
                setDirectChats(prev => prev.map(d => d._id === id ? { ...d, draft: text } : d));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- 8. Forward Messages ---
    const handleForwardMessage = async (messageId, targetIds) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/forward`, { messageId, targetIds }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Message forwarded successfully");
            fetchSidebarData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to forward message");
        }
    };

    // --- 9. Sockets Subscription Management ---
    useEffect(() => {
        if (!socket) return;

        let roomId = null;
        if (selectedChannel) {
            roomId = `channel_${selectedChannel._id}`;
        } else if (selectedGroup) {
            roomId = `group_${selectedGroup._id}`;
        }

        if (roomId) {
            socket.emit("joinRoom", { roomId });
        }

        return () => {
            if (roomId) {
                socket.emit("leaveRoom", { roomId });
            }
        };
    }, [selectedGroup, selectedChannel, socket]);

    // --- 10. Event-Driven Socket.IO Listeners ---
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            const isForActiveDirect = selectedUser && !selectedGroup && !selectedChannel && 
                (msg.sender?._id === selectedUser._id || msg.sender === selectedUser._id || msg.sender?._id === authUser._id);
            const isForActiveGroup = selectedGroup && msg.group === selectedGroup._id;
            const isForActiveChannel = selectedChannel && msg.channel === selectedChannel._id;

            if (isForActiveDirect || isForActiveGroup || isForActiveChannel) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === msg._id)) {
                        return prev;
                    }

                    // Optimistic update reconciliation
                    const isMyMessage = msg.sender?._id === authUser._id || msg.sender === authUser._id;
                    if (isMyMessage) {
                        const sendingIndex = prev.findIndex(m => m.status === 'sending' && m.text === msg.text);
                        if (sendingIndex !== -1) {
                            const reconciled = [...prev];
                            reconciled[sendingIndex] = { ...msg, status: 'sent' };
                            return reconciled;
                        }
                    }

                    return [...prev, { ...msg, status: 'sent' }];
                });

                // Clear unreads and emit read status instantly
                if (selectedUser && msg.sender?._id === selectedUser._id) {
                    socket.emit("markAsSeen", { messageIds: [msg._id], senderId: selectedUser._id });
                }
            }
            
            // Background alert & sidebar count increments / updates
            fetchSidebarData();
        };

        const handleMessageUpdated = (updatedMsg) => {
            setMessages((prev) => 
                prev.map((msg) => msg._id === updatedMsg._id ? updatedMsg : msg)
            );
            fetchSidebarData();
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            fetchSidebarData();
        };

        const handleTypingStatus = ({ senderId, senderName, isTyping, type, targetId }) => {
            const trackingKey = type === "direct" ? senderId : targetId;
            setTypingUsers((prev) => ({
                ...prev,
                [trackingKey]: { senderName, isTyping, type }
            }));
        };

        const handleMessagesSeen = ({ seenBy, messageIds }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
                )
            );
        };

        const handleConversationCreated = (conv) => {
            fetchSidebarData();
        };

        const handleConversationUpdated = (update) => {
            fetchSidebarData();
        };

        const handleInviteReceived = (invite) => {
            fetchSidebarData();
            toast.info(`Invited to group: ${invite.group?.name}`);
        };

        const handleGroupJoined = (grp) => {
            fetchSidebarData();
            toast.success(`Joined group: ${grp.name}`);
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("typingStatus", handleTypingStatus);
        socket.on("messagesSeen", handleMessagesSeen);
        socket.on("conversation:created", handleConversationCreated);
        socket.on("conversation:updated", handleConversationUpdated);
        socket.on("group:invite_received", handleInviteReceived);
        socket.on("group:joined", handleGroupJoined);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("typingStatus", handleTypingStatus);
            socket.off("messagesSeen", handleMessagesSeen);
            socket.off("conversation:created", handleConversationCreated);
            socket.off("conversation:updated", handleConversationUpdated);
            socket.off("group:invite_received", handleInviteReceived);
            socket.off("group:joined", handleGroupJoined);
        };
    }, [selectedUser, selectedGroup, selectedChannel, socket, authUser, directChats]);

    // --- 11. Core messaging APIs (Optimistic updates & Rollbacks) ---
    const AddNewMessage = async (messageText, images, replyToId = null, audio = null) => {
        const token = localStorage.getItem("userToken") || authUser?.token;
        if (!token) return;

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempMessage = {
            _id: tempId,
            sender: {
                _id: authUser._id,
                username: authUser.username,
                profilePic: authUser.profilePic,
                profileName: authUser.profileName
            },
            text: messageText || '',
            Photos: images && images.length > 0 ? images.map(img => ({ url: URL.createObjectURL(img) })) : [],
            attachments: [],
            messageType: audio ? 'audio' : (images && images.length > 0 ? 'image' : 'text'),
            audio: audio || undefined,
            isRead: false,
            status: 'sending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (replyToId) {
            const originalMsg = messages.find(m => m._id === replyToId);
            if (originalMsg) tempMessage.replyTo = originalMsg;
        }

        setMessages((prev) => [...prev, tempMessage]);

        const formData = new FormData();
        if (images && images.length > 0) {
            images.forEach((img) => formData.append('image', img));
        }
        formData.append('text', messageText || '');
        if (replyToId) formData.append('replyTo', replyToId);
        
        if (audio) {
            formData.append('messageType', 'audio');
            formData.append('audio', JSON.stringify(audio));
        } else if (images && images.length > 0) {
            formData.append('messageType', 'image');
        } else {
            formData.append('messageType', 'text');
        }

        let url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/send/`;
        let typeParam = "";

        if (selectedChannel) {
            url += selectedChannel._id;
            typeParam = "?type=channel";
        } else if (selectedGroup) {
            url += selectedGroup._id;
            typeParam = "?type=group";
        } else if (selectedUser) {
            url += selectedUser._id;
            typeParam = "?type=direct";
        }

        try {
            const res = await axios.post(url + typeParam, formData, {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            const savedMessage = { ...res.data, status: 'sent' };
            setMessages((prev) => 
                prev.map((msg) => msg._id === tempId ? savedMessage : msg)
            );
            fetchSidebarData();
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages((prev) => 
                prev.map((msg) => msg._id === tempId ? { ...msg, status: 'failed' } : msg)
            );
            toast.error(err.response?.data?.message || "Failed to send message. Tap the retry icon next to the message.");
        }
    };

    const EditMessage = async (messageId, newText) => {
        let previousText = "";
        setMessages((prev) => 
            prev.map((msg) => {
                if (msg._id === messageId) {
                    previousText = msg.text;
                    return { ...msg, text: newText, isEdited: true };
                }
                return msg;
            })
        );

        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/edit/${messageId}`, { text: newText }, {
                headers: { authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error editing message:", err);
            toast.error("Failed to edit message. Reverting.");
            setMessages((prev) => 
                prev.map((msg) => msg._id === messageId ? { ...msg, text: previousText } : msg)
            );
        }
    };

    const DeleteMessage = async (messageId) => {
        let deletedMsg = null;
        setMessages((prev) => {
            deletedMsg = prev.find(m => m._id === messageId);
            return prev.filter((msg) => msg._id !== messageId);
        });

        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.delete(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/delete/${messageId}`, {
                headers: { authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error deleting message:", err);
            toast.error("Failed to delete message. Restoring.");
            if (deletedMsg) {
                setMessages((prev) => 
                    [...prev, deletedMsg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                );
            }
        }
    };

    const SendReaction = async (messageId, emoji) => {
        let previousReactions = [];
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg._id === messageId) {
                    previousReactions = msg.reactions || [];
                    const hasReacted = previousReactions.some(r => r.user?._id === authUser?._id && r.emoji === emoji);
                    let newReactions = previousReactions.filter(r => r.user?._id !== authUser?._id);
                    if (!hasReacted && emoji) {
                        newReactions.push({ user: { _id: authUser._id, username: authUser.username, profilePic: authUser.profilePic }, emoji });
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            })
        );

        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/react/${messageId}`, { emoji }, {
                headers: { authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error sending reaction:", err);
            setMessages((prev) =>
                prev.map((msg) => msg._id === messageId ? { ...msg, reactions: previousReactions } : msg)
            );
        }
    };

    const RetryMessage = async (failedMessage) => {
        setMessages((prev) => 
            prev.map((msg) => msg._id === failedMessage._id ? { ...msg, status: 'sending' } : msg)
        );

        const token = localStorage.getItem("userToken") || authUser?.token;
        if (!token) return;

        let url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/send/`;
        let typeParam = "";

        if (selectedChannel) {
            url += selectedChannel._id;
            typeParam = "?type=channel";
        } else if (selectedGroup) {
            url += selectedGroup._id;
            typeParam = "?type=group";
        } else if (selectedUser) {
            url += selectedUser._id;
            typeParam = "?type=direct";
        }

        try {
            const formData = new FormData();
            formData.append('text', failedMessage.text || '');
            if (failedMessage.replyTo) {
                formData.append('replyTo', failedMessage.replyTo._id);
            }
            if (failedMessage.audio) {
                formData.append('messageType', 'audio');
                formData.append('audio', JSON.stringify(failedMessage.audio));
            } else if (failedMessage.Photos && failedMessage.Photos.length > 0) {
                formData.append('messageType', 'image');
            } else {
                formData.append('messageType', 'text');
            }
            
            const res = await axios.post(url + typeParam, formData, {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            const savedMessage = { ...res.data, status: 'sent' };
            setMessages((prev) => 
                prev.map((msg) => msg._id === failedMessage._id ? savedMessage : msg)
            );
        } catch (err) {
            console.error("Retry failed:", err);
            setMessages((prev) => 
                prev.map((msg) => msg._id === failedMessage._id ? { ...msg, status: 'failed' } : msg)
            );
            toast.error("Failed to resend message.");
        }
    };

    const TogglePin = async (messageId) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/pin/${messageId}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Pin toggled");
        } catch (err) {
            console.error(err);
        }
    };

    const ToggleStar = async (messageId) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/star/${messageId}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });

            // Update messages locally
            setMessages((prev) => 
                prev.map((msg) => {
                    if (msg._id === messageId) {
                        const isStarredNow = res.data.starred;
                        let starredBy = msg.starredBy || [];
                        if (isStarredNow) {
                            if (!starredBy.includes(authUser._id)) {
                                starredBy = [...starredBy, authUser._id];
                            }
                        } else {
                            starredBy = starredBy.filter(id => id.toString() !== authUser._id.toString());
                        }
                        return { ...msg, starredBy };
                    }
                    return msg;
                })
            );

            toast.success(res.data.starred ? "Starred message" : "Unstarred message");
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStarredMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return [];

            let type = "";
            let id = "";

            if (selectedChannel) {
                type = "channel";
                id = selectedChannel._id;
            } else if (selectedGroup) {
                type = "group";
                id = selectedGroup._id;
            } else if (selectedUser) {
                type = "direct";
                const activeDM = directChatsRef.current.find(c => c.recipient?._id === selectedUser._id);
                if (activeDM) id = activeDM._id;
                else return [];
            } else {
                return [];
            }

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/starred`, {
                headers: { authorization: `Bearer ${token}` },
                params: { type, id }
            });

            return res.data || [];
        } catch (err) {
            console.error("Error fetching starred messages:", err);
            return [];
        }
    }, [authUser, selectedUser, selectedGroup, selectedChannel]);

    // Create Group Community
    const CreateGroup = async (name, description, isPrivate) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group`, { name, description, isPrivate }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Group created successfully");
            fetchSidebarData();
            return res.data.group;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create group");
        }
    };

    const CreateChannel = async (groupId, name, description, type) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/channels`, { name, description, type }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Channel created successfully");
            if (selectedGroup && selectedGroup._id === groupId) {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                setSelectedGroup(res.data.group);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create channel");
        }
    };

    const handleSelectChat = async (type, target) => {
        setSelectedUser(null);
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupChannels([]);

        if (type === "user") {
            setSelectedUser(target);
            return;
        }

        if (type === "group") {
            const groupDetails = await fetchGroupDetails(target._id);
            if (groupDetails) {
                setSelectedGroup(groupDetails);
                // Sync fetched group details back to groupChats for sidebar consistency
                setGroupChats(prev => prev.map(g => g._id === groupDetails._id ? groupDetails : g));
            } else {
                setSelectedGroup(target);
            }
            return;
        }

        if (type === "channel") {
            let groupId = null;
            if (typeof target.group === "string") {
                groupId = target.group;
            } else if (target.group && target.group._id) {
                groupId = target.group._id;
            }

            if (groupId) {
                const groupDetails = await fetchGroupDetails(groupId);
                if (groupDetails) {
                    setSelectedGroup(groupDetails);
                    setSelectedChannel({ ...target, group: groupDetails });
                    // Sync fetched group details back to groupChats for sidebar consistency
                    setGroupChats(prev => prev.map(g => g._id === groupDetails._id ? groupDetails : g));
                    return;
                }
            }

            setSelectedChannel(target);
        }
    };

    return (
        <MessageContext.Provider
            value={{
                directChats,
                groupChats,
                archivedChats,
                requests,
                isSidebarLoading,
                contacts,
                selectedUser,
                selectedGroup,
                selectedChannel,
                setSelectedUser: (u) => handleSelectChat("user", u),
                setSelectedGroup: (g) => handleSelectChat("group", g),
                setSelectedChannel: (c) => handleSelectChat("channel", c),
                messages,
                isMessagesLoading,
                loadMoreMessages,
                hasMoreMessages,
                searchQuery,
                setSearchQuery,
                searchSuggestions,
                isSearching,
                groupSearchResults,
                isGroupSearching,
                handleSearchGroups,
                handleJoinGroup,
                handleAddContact,
                handleInviteUser,
                handleRespondInvite,
                handleTogglePin,
                handleToggleArchive,
                handleToggleMute,
                handleToggleFavorite,
                handleSaveDraft,
                handleForwardMessage,
                totalUnread,
                requests,
                handleGroupRequestResponse,
                AddNewMessage,
                EditMessage,
                DeleteMessage,
                SendReaction,
                RetryMessage,
                TogglePin,
                ToggleStar,
                fetchStarredMessages,
                CreateGroup,
                CreateChannel,
                groupChannels,
                isGroupDetailsLoading,
                fetchGroupDetails,
                typingUsers,
                setTypingUsers,
                showRightSidebar,
                setShowRightSidebar,
                fetchSidebarData,
                replyMessage,
                setReplyMessage
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};

export default MessageContextProvider;