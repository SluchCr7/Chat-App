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
    const [showMenu , setShowMenu] = useState(false)
    const [showNotification , setShowNotification] = useState(false)
    return (
        <>
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
        </>
    )
}

export default LayoutComponent