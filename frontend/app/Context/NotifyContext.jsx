'use client';

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MessageContext } from "./MessageContext";
import { AuthContext } from "./AuthContext";

export const NotifyContext = createContext();

const NotifyContextProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { selectedUser } = useContext(MessageContext);
    const { authUser } = useContext(AuthContext);

    // Fetch notifications only when the auth user changes, not continuously!
    useEffect(() => { 
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("userToken");
                if (!token) return;

                const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/user`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        if (authUser) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [authUser]);

    // Send a new notification and append it locally
    const AddNotify = async (content) => {
        if (!selectedUser) return;
        try {
            const token = localStorage.getItem("userToken");
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/send/${selectedUser._id}`, 
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Append locally
            setNotifications(prev => [res.data, ...prev]);
        } catch (err) { 
            console.error("Error adding notification:", err);
        }
    };

    // Delete a notification and remove it locally
    const deleteNotify = async (id) => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/${id}`, 
                { headers: { authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Notification deleted");
            // Remove locally
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    return (
        <>

            <NotifyContext.Provider value={{
                notifications,
                setNotifications,
                AddNotify,
                deleteNotify
            }}>
                {children}
            </NotifyContext.Provider>
        </>
    );
};

export default NotifyContextProvider;