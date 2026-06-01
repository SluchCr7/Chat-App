'use client';

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
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
    const fetchNotifications = async () => {
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
    };

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
    }, [authUser]);

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

        socket.on("newMessage", handleNewMessageNotification);

        return () => {
            socket.off("newMessage", handleNewMessageNotification);
        };
    }, [socket, authUser, selectedUser, selectedGroup, selectedChannel]);

    return (
        <NotifyContext.Provider value={{
            notifications,
            setNotifications,
            AddNotify,
            deleteNotify,
            fetchNotifications
        }}>
            {children}
        </NotifyContext.Provider>
    );
};

export default NotifyContextProvider;