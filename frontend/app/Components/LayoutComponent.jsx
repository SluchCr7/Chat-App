"use client"
import NavBar from "./NavBar";
import AuthContextProvider from "../Context/AuthContext";
import MessageContextProvider from "../Context/MessageContext";
import ThemeContextProvider from "../Context/ThemeContext";
import { useState } from "react";
import NotifyContextProvider from "../Context/NotifyContext";
import NotificationMenuScreen from "./NotificationMenuScreen";
import Logo from "./Logo";

const LayoutComponent = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col">
            <AuthContextProvider>
                <MessageContextProvider>    
                    <NotifyContextProvider>                                        
                        <ThemeContextProvider>
                            <NavBar showNotification={showNotification} setShowNotification={setShowNotification} showMenu={showMenu} setShowMenu={setShowMenu} />
                            <NotificationMenuScreen showNotification={showNotification} setShowNotification={setShowNotification} />
                            <main className="flex-1">{children}</main>
                            <footer className="border-t border-custom bg-bg/90 text-muted py-5 px-6">
                                <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="inline-flex items-center gap-3">
                                        <Logo compact />
                                        <div>
                                            <p className="text-sm font-semibold text-text-active">ChatYou</p>
                                            <p className="text-xs text-muted">Secure messaging for teams and communities.</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted">Designed for modern chat experiences — © {new Date().getFullYear()}</p>
                                </div>
                            </footer>
                        </ThemeContextProvider>
                    </NotifyContextProvider>
                </MessageContextProvider>
            </AuthContextProvider>
        </div>
    )
}

export default LayoutComponent