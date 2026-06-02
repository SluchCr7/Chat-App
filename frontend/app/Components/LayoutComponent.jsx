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

    // Enforce strict 100vh app page layout boundary when user is logged in
    const isAppLayout = authUser && (pathname === "/" || pathname?.startsWith("/Pages/"));

    if (isAppLayout) {
        return (
            <div className="h-screen bg-bg text-text flex flex-col overflow-hidden">
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
                <main className="flex-1 flex flex-col overflow-hidden bg-bg-primary">{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col">
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