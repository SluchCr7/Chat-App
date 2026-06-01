'use client';

import { createContext, useEffect, useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../lib/axios";
import axios from "axios";
import swal from "sweetalert";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socketStatus, setSocketStatus] = useState("disconnected");
    const [allUsers , setAllUsers] = useState([])
    const login = async (email, password) => {
        setIsLoggingIn(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/login`, { email, password });
            setAuthUser(res.data);
            localStorage.setItem("userAuth", JSON.stringify(res.data));
            localStorage.setItem("userToken", res.data.token);
            connectSocket(res.data);
            toast.success("Login successful");
            window.location.href = "/";
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const register = async (email, password, username) => {
        setIsSigningUp(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/register`, { email, password, username });
            toast.success("Registered successfully");
            setIsSigningUp(false);
            window.location.href = "/Pages/Login";
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally {
            setIsSigningUp(false);
        }
    };

    const logout = () => {
        swal({
            title: "Are you sure?",
            text: "You are going to log out from your account!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willLogout) => {
            if (willLogout) {
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/logout`,
                        {},
                        {
                            headers: {
                                authorization: `Bearer ${authUser?.token}`,
                            },
                        }
                    );
                    setAuthUser(null);
                    localStorage.removeItem("userAuth");
                    localStorage.removeItem("userToken");
                    disconnectSocket();
                    toast.success("Logged out successfully");
                    window.location.href = "/Pages/Login";
                } catch (err) {
                    toast.error("Logout failed");
                    console.error(err);
                }
            }
        });
    };

    const updateProfilePhoto = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/upload`,
                formData,
                {
                    headers: {
                        authorization: `Bearer ${authUser?.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            localStorage.setItem("userAuth", JSON.stringify({ ...authUser, profilePic: res.data }));
            setAuthUser({...authUser, profilePic: res.data});
            toast.success("Profile photo updated");
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };

    const connectSocket = (authUser) => {
        if (!authUser || socket?.connected) return;

        setSocketStatus("connecting");
        const token = localStorage.getItem("userToken") || authUser.token;

        const Newsocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
            auth: {
                token
            },
            query: {
                userId: authUser._id,
            },
        });

        Newsocket.on("connect", () => {
            console.log("Socket connected successfully");
            setSocketStatus("connected");
        });

        Newsocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            setSocketStatus("disconnected");
        });

        Newsocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setSocketStatus("disconnected");
        });

        Newsocket.on("reconnect_attempt", () => {
            setSocketStatus("connecting");
        });

        Newsocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        setSocket(Newsocket);
    };


    const disconnectSocket = () => {
        if (socket?.connected) socket.disconnect();
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("userAuth");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setAuthUser(parsedUser);
            connectSocket(parsedUser);
        }
    }, []);

    const handleUpdateProfile = async (username, profileName, description, status = null, socialLinks = null) => {
        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/profile/${authUser._id}`, 
                { username, profileName, description, status, socialLinks }, 
                {
                    headers: {
                        authorization: `Bearer ${authUser?.token}`,
                    },
                }
            );
            const updatedUser = { ...res.data, token: authUser.token };
            localStorage.setItem("userAuth", JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Profile update failed");
        }
    };

    const updatePassword = async (password) => {
        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth/profile/${authUser._id}`, 
                { password },
                {
                    headers: {
                        authorization: `Bearer ${authUser?.token}`,
                    },
                }
            );
            const updatedUser = { ...res.data, token: authUser.token };
            localStorage.setItem("userAuth", JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
            toast.success("Password updated successfully");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Password update failed");
        }
    };

    const updatePresenceStatus = (status) => {
        if (socket) {
            socket.emit("updateCustomStatus", { status });
            const updatedUser = { ...authUser, status };
            localStorage.setItem("userAuth", JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
        }
    };

    useEffect(() => {
        if (authUser) {
            axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/auth`).then((res) => {
                setAllUsers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }, [authUser]);
    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Slide}
                className="custom-toast-container"
                toastClassName="custom-toast"
            />
            <AuthContext.Provider
                value={{
                    authUser,
                    setAuthUser,
                    isLoggingIn,
                    setIsLoggingIn,
                    isSigningUp,
                    setIsSigningUp,
                    login,
                    register,
                    logout,
                    updateProfilePhoto,
                    onlineUsers,
                    updatePassword,
                    handleUpdateProfile,
                    allUsers,
                    socket,
                    socketStatus,
                    updatePresenceStatus
                }}
            >
                {children}
            </AuthContext.Provider>
        </>
    );
};

export default AuthContextProvider;
