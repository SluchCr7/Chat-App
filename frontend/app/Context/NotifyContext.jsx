'use client';

import axios from "axios";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { MessageContext } from "./MessageContext";
import { AuthContext } from "./AuthContext";

export const NotifyContext = createContext();

const NotifyContextProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { selectedUser, selectedGroup, selectedChannel } = useContext(MessageContext);
    const { authUser, socket } = useContext(AuthContext);

    // Audio assets URLs (Premium sound effects)
    const messageSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-700.wav"; // Subtle drip/pop sound
    const mentionSoundUrl = "https://assets.mixkit.co/active_storage/sfx/911/911-700.wav"; // Alert chime sound

    // Fetch notifications on load
    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/user`, {
                headers: { authorization: `Bearer ${token}` }
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, [authUser]);

    useEffect(() => {
        if (authUser) {
            fetchNotifications();
            // Request browser notification permissions
            if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "default") {
                    Notification.requestPermission();
                }
            }
        } else {
            setNotifications([]);
        }
    }, [authUser, fetchNotifications]);

    // Send a new notification and append it locally
    const AddNotify = async (content) => {
        if (!selectedUser) return;
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/send/${selectedUser._id}`, 
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(prev => [res.data, ...prev]);
        } catch (err) { 
            console.error("Error adding notification:", err);
        }
    };

    // Delete a notification
    const deleteNotify = async (id) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/${id}`, 
                { headers: { authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Notification deleted");
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    // Mark a notification as read
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/${id}/read`,
                {},
                { headers: { authorization: `Bearer ${token}` } }
            );
            setNotifications(prev => prev.map(n => n._id === id ? res.data : n));
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;
            await axios.put(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/read-all`,
                {},
                { headers: { authorization: `Bearer ${token}` } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
        }
    };

    // Clear all notifications
    const clearAll = async () => {
        try {
            const token = localStorage.getItem("userToken") || authUser?.token;
            if (!token) return;
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/clear-all`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            setNotifications([]);
            toast.success("All notifications cleared");
        } catch (err) {
            console.error("Error clearing notifications:", err);
        }
    };

    // --- Sockets Integration for In-App & Audio Notifications ---
    useEffect(() => {
        if (!socket) return;

        const handleNewMessageNotification = (msg) => {
            const isMyMessage = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;
            if (isMyMessage) return;

            // Check if it's for the currently active open conversation
            const isForActiveDirect = selectedUser && !selectedGroup && !selectedChannel && 
                (msg.sender?._id === selectedUser._id || msg.sender === selectedUser._id);
            const isForActiveGroup = selectedGroup && msg.group === selectedGroup._id;
            const isForActiveChannel = selectedChannel && msg.channel === selectedChannel._id;

            // If chat is open, do not play notification sound or show alerts
            if (isForActiveDirect || isForActiveGroup || isForActiveChannel) return;

            // Check for @mentions in text
            const hasMention = authUser && msg.text && msg.text.includes(`@${authUser.profileName}`);
            
            // Play sound alert
            try {
                const audio = new Audio(hasMention ? mentionSoundUrl : messageSoundUrl);
                audio.volume = 0.4;
                audio.play();
            } catch (err) {
                console.warn("Audio play failed:", err);
            }

            // In-app Toast alert
            if (hasMention) {
                toast.warning(`@Mention: ${msg.sender?.username} mentioned you in a message!`);
            } else {
                toast.info(`New message from ${msg.sender?.username || 'user'}: "${msg.text?.substring(0, 30)}..."`);
            }

            // Browser push notification
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                const title = hasMention ? `Mentioned by ${msg.sender?.username}` : `New message from ${msg.sender?.username}`;
                const options = {
                    body: msg.text || "Sent an attachment",
                    icon: msg.sender?.profilePic?.url || "/favicon.ico",
                    silent: true // customized audio plays separately
                };
                new Notification(title, options);
            }

            fetchNotifications();
        };

        const handleNewNotification = (notification) => {
            // Prepend new notification to the active list
            setNotifications(prev => {
                if (prev.some(n => n._id === notification._id)) return prev;
                return [notification, ...prev];
            });

            // Alerts for other types of notifications (messages are handled by handleNewMessageNotification above)
            if (notification.type === 'group_invite') {
                try {
                    const audio = new Audio(mentionSoundUrl);
                    audio.volume = 0.4;
                    audio.play();
                } catch (e) {}
                toast.info(`Group Invite: ${notification.content}`);
            } else if (notification.type === 'group_join_request') {
                try {
                    const audio = new Audio(mentionSoundUrl);
                    audio.volume = 0.4;
                    audio.play();
                } catch (e) {}
                toast.info(`Group Join Request: ${notification.content}`);
            } else if (notification.type === 'system') {
                try {
                    const audio = new Audio(messageSoundUrl);
                    audio.volume = 0.4;
                    audio.play();
                } catch (e) {}
                toast.success(notification.content);
            }
        };

        socket.on("newMessage", handleNewMessageNotification);
        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("newMessage", handleNewMessageNotification);
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, authUser, selectedUser, selectedGroup, selectedChannel, fetchNotifications]);

    return (
        <NotifyContext.Provider value={{
            notifications,
            setNotifications,
            AddNotify,
            deleteNotify,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
        </NotifyContext.Provider>
    );
};

export default NotifyContextProvider;