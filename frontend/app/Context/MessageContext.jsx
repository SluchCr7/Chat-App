'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
    const { authUser, socket } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    
    const [groups, setGroups] = useState([]);
    const [isGroupsLoading, setIsGroupsLoading] = useState(true);
    const [starredMessages, setStarredMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: { senderName, isTyping } }
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    // --- 1. Fetch Users for Sidebar ---
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("userToken");
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/users`, {
                headers: { authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setIsUserLoading(false);
        }
    };

    // --- 2. Fetch Groups for Sidebar ---
    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("userToken");
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group`, {
                headers: { authorization: `Bearer ${token}` }
            });
            setGroups(res.data);
        } catch (err) {
            console.error("Error fetching groups:", err);
        } finally {
            setIsGroupsLoading(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            fetchUsers();
            fetchGroups();
        }
    }, [authUser]);

    // --- 3. Fetch Messages (Triggered only when selection changes!) ---
    useEffect(() => {
        const fetchConversationMessages = async () => {
            setIsMessagesLoading(true);
            try {
                const token = localStorage.getItem("userToken");
                if (!token) return;

                let url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/`;
                let params = {};

                if (selectedChannel) {
                    url += selectedChannel._id;
                    params.type = "channel";
                } else if (selectedGroup) {
                    url += selectedGroup._id;
                    params.type = "group";
                } else if (selectedUser) {
                    url += selectedUser._id;
                } else {
                    setMessages([]);
                    setIsMessagesLoading(false);
                    return;
                }

                const res = await axios.get(url, {
                    headers: { authorization: `Bearer ${token}` },
                    params
                });

                setMessages(res.data);

                // If opening a direct chat from someone else, trigger seen receipt
                if (selectedUser && res.data.length > 0) {
                    const unreadIds = res.data
                        .filter(m => m.sender?._id === selectedUser._id && !m.isRead)
                        .map(m => m._id);
                    if (unreadIds.length > 0 && socket) {
                        socket.emit("markAsSeen", { messageIds: unreadIds, senderId: selectedUser._id });
                    }
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                setIsMessagesLoading(false);
            }
        };

        fetchConversationMessages();
    }, [selectedUser, selectedGroup, selectedChannel, socket]);

    // --- 4. Room Subscription Management ---
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

    // --- 5. Event-Driven Socket.io Listeners ---
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            const isForActiveDirect = selectedUser && !selectedGroup && !selectedChannel && 
                (msg.sender?._id === selectedUser._id || msg.sender === selectedUser._id || msg.sender?._id === authUser._id);
            const isForActiveGroup = selectedGroup && msg.group === selectedGroup._id;
            const isForActiveChannel = selectedChannel && msg.channel === selectedChannel._id;

            if (isForActiveDirect || isForActiveGroup || isForActiveChannel) {
                setMessages((prev) => [...prev, msg]);

                // Emit seen receipt if received direct message
                if (selectedUser && msg.sender?._id === selectedUser._id) {
                    socket.emit("markAsSeen", { messageIds: [msg._id], senderId: selectedUser._id });
                }
            } else {
                // Background notification badge trigger
                toast.info(`New message from ${msg.sender?.username || 'user'}`);
            }
        };

        const handleMessageUpdated = (updatedMsg) => {
            setMessages((prev) => 
                prev.map((msg) => msg._id === updatedMsg._id ? updatedMsg : msg)
            );
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        const handleTypingStatus = ({ senderId, senderName, isTyping, type, targetId }) => {
            const isActiveContext = 
                (type === "direct" && selectedUser && selectedUser._id === senderId) ||
                (type === "group" && selectedGroup && selectedGroup._id === targetId) ||
                (type === "channel" && selectedChannel && selectedChannel._id === targetId);

            if (isActiveContext) {
                setTypingUsers((prev) => ({
                    ...prev,
                    [senderId]: { senderName, isTyping }
                }));
            }
        };

        const handleMessagesSeen = ({ seenBy, messageIds }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
                )
            );
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("typingStatus", handleTypingStatus);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("typingStatus", handleTypingStatus);
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [selectedUser, selectedGroup, selectedChannel, socket, authUser]);

    // --- 6. Send, Edit, Delete, Reactions API wrappers ---
    const AddNewMessage = async (messageText, images, replyToId = null) => {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const formData = new FormData();
        if (images && images.length > 0) {
            images.forEach((img) => formData.append('image', img));
        }
        formData.append('text', messageText || '');
        if (replyToId) formData.append('replyTo', replyToId);

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
        }

        try {
            const res = await axios.post(url + typeParam, formData, {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            // Res contains populated message object. Added to local messages array via socket 'newMessage' broadcast
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error(err.response?.data?.message || "Failed to send message");
        }
    };

    const EditMessage = async (messageId, newText) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/edit/${messageId}`, { text: newText }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Message edited");
        } catch (err) {
            console.error("Error editing message:", err);
        }
    };

    const DeleteMessage = async (messageId) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.delete(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/delete/${messageId}`, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Message deleted");
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    const SendReaction = async (messageId, emoji) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/react/${messageId}`, { emoji }, {
                headers: { authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error sending reaction:", err);
        }
    };

    const TogglePin = async (messageId) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/pin/${messageId}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Pin toggled");
        } catch (err) {
            console.error("Pin toggled error:", err);
        }
    };

    const ToggleStar = async (messageId) => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/star/${messageId}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success(res.data.starred ? "Starred message" : "Unstarred message");
        } catch (err) {
            console.error(err);
        }
    };

    // --- 7. Group CRUD & Settings wrapper ---
    const CreateGroup = async (name, description, isPrivate) => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group`, { name, description, isPrivate }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Group created successfully");
            fetchGroups();
            return res.data.group;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create group");
        }
    };

    const CreateChannel = async (groupId, name, description, type) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}/channels`, { name, description, type }, {
                headers: { authorization: `Bearer ${token}` }
            });
            toast.success("Channel created successfully");
            if (selectedGroup && selectedGroup._id === groupId) {
                // Refresh group details
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/group/${groupId}`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                setSelectedGroup(res.data.group);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create channel");
        }
    };

    const handleSelectChat = (type, target) => {
        setSelectedUser(null);
        setSelectedGroup(null);
        setSelectedChannel(null);
        
        if (type === "user") setSelectedUser(target);
        if (type === "group") setSelectedGroup(target);
        if (type === "channel") setSelectedChannel(target);
    };

    return (
        <MessageContext.Provider
            value={{
                users,
                isUserLoading,
                groups,
                isGroupsLoading,
                selectedUser,
                selectedGroup,
                selectedChannel,
                setSelectedUser: (u) => handleSelectChat("user", u),
                setSelectedGroup: (g) => handleSelectChat("group", g),
                setSelectedChannel: (c) => handleSelectChat("channel", c),
                messages,
                isMessagesLoading,
                AddNewMessage,
                EditMessage,
                DeleteMessage,
                SendReaction,
                TogglePin,
                ToggleStar,
                CreateGroup,
                CreateChannel,
                fetchGroups,
                typingUsers,
                setTypingUsers,
                showRightSidebar,
                setShowRightSidebar
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};

export default MessageContextProvider;