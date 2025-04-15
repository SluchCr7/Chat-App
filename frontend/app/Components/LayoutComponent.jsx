"use client"
import NavBar from "./NavBar";
import AuthContextProvider from "../Context/AuthContext";
import MessageContextProvider from "../Context/MessageContext";
import ThemeContextProvider from "../Context/ThemeContext";
import { useEffect, useState } from "react";
import { LuMessageSquare } from "react-icons/lu";
import NotifyContextProvider from "../Context/NotifyContext";
import NotificationMenuScreen from "./NotificationMenuScreen";

const LayoutComponent = ({ children }) => {
    const [loading, setLoading] = useState(false);
    // useEffect(() => {
    //     setTimeout(() => {
    //         setLoading(false);
    //     }, 5000);
    // }, []);
    const [showMenu , setShowMenu] = useState(false)
    const [showNotification , setShowNotification] = useState(false)
    return (
        <>
        {
        loading
            ?
                <div className="w-full justify-center min-h-screen flex items-center bg-gray-100">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Animated border circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin"></div>

                    {/* Icon container (not animated) */}
                    <div className="relative z-10">
                    <span>
                        <LuMessageSquare className="text-5xl text-primary" />
                    </span>
                    </div>
                </div>
                </div>


            :
            <div className={`flex flex-col min-h-screen bg-bg text-text`}>
                <AuthContextProvider>
                    <MessageContextProvider>    
                        <NotifyContextProvider>                                        
                            <ThemeContextProvider>
                                <NavBar showNotification={showNotification} setShowNotification={setShowNotification} showMenu={showMenu} setShowMenu={setShowMenu} />
                                <NotificationMenuScreen showNotification={showNotification} setShowNotification={setShowNotification} />
                                {children}
                            </ThemeContextProvider>
                        </NotifyContextProvider>
                    </MessageContextProvider>
                </AuthContextProvider>
            </div>
        }
        </>
    )
}

export default LayoutComponent