"use client"

import NavBar from "./NavBar";
import AuthContextProvider, { AuthContext } from "../Context/AuthContext";
import MessageContextProvider from "../Context/MessageContext";
import ThemeContextProvider from "../Context/ThemeContext";
import { useState, useContext } from "react";
import NotifyContextProvider from "../Context/NotifyContext";
import NotificationMenuScreen from "./NotificationMenuScreen";
import Logo from "./Logo";
import { usePathname } from "next/navigation";

const LayoutWrapper = ({ children, showNotification, setShowNotification, showMenu, setShowMenu }) => {
    const { authUser } = useContext(AuthContext);
    const pathname = usePathname();

    // Enforce strict 100vh app page layout boundary when user is logged in on app pages
    const isAppLayout = authUser && (pathname === "/" || pathname?.startsWith("/Pages/"));

    if (isAppLayout) {
        return (
            <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden select-none">
                <NavBar 
                    showNotification={showNotification} 
                    setShowNotification={setShowNotification} 
                    showMenu={showMenu} 
                    setShowMenu={setShowMenu} 
                />
                <NotificationMenuScreen 
                    showNotification={showNotification} 
                    setShowNotification={setShowNotification} 
                />
                <main className={`flex-1 flex flex-col bg-bg-primary ${pathname === "/" ? "overflow-hidden" : "overflow-y-auto"}`}>
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
            <NavBar 
                showNotification={showNotification} 
                setShowNotification={setShowNotification} 
                showMenu={showMenu} 
                setShowMenu={setShowMenu} 
            />
            <NotificationMenuScreen 
                showNotification={showNotification} 
                setShowNotification={setShowNotification} 
            />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-bg-footer/90 text-text-muted py-6 px-6 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center gap-3">
                        <Logo compact />
                        <div className="text-left">
                            <p className="text-sm font-extrabold text-text-primary">ChatYou Workspace</p>
                            <p className="text-xs text-text-muted">Enterprise messaging for modern teams & communities.</p>
                        </div>
                    </div>
                    <p className="text-xs text-text-muted font-medium">Designed with excellence — © {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
};

const LayoutComponent = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    return (
        <AuthContextProvider>
            <MessageContextProvider>    
                <NotifyContextProvider>                                        
                    <ThemeContextProvider>
                        <LayoutWrapper 
                            showNotification={showNotification} 
                            setShowNotification={setShowNotification} 
                            showMenu={showMenu} 
                            setShowMenu={setShowMenu}
                        >
                            {children}
                        </LayoutWrapper>
                    </ThemeContextProvider>
                </NotifyContextProvider>
            </MessageContextProvider>
        </AuthContextProvider>
    );
};

export default LayoutComponent;