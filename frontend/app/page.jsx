'use client';

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./Context/AuthContext";
import { MessageContext } from "./Context/MessageContext";
import SideBar from "./Components/SideBar";
import NoChatSelected from "./Components/NoChatSelected";
import ChatContainer from "./Components/ChatContainer";
import RightSidebar from "./Components/RightSidebar";
import LoginPage from "./Pages/Login/page";
import Loader from "./Components/Loader";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const { authUser, isAuthLoading } = useContext(AuthContext);
  const { selectedUser, selectedGroup, selectedChannel, showRightSidebar } = useContext(MessageContext);

  // If initial auth check is ongoing, show minimal initial loading state
  if (isAuthLoading) {
    return (
      <div className="h-screen w-full bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted font-bold tracking-widest uppercase">Initializing...</span>
        </div>
      </div>
    );
  }

  // If NOT logged in: immediately render the Login Homepage!
  if (!authUser) {
    return <LoginPage />;
  }

  // If logged in: immediately render the Chat Application Workspace!
  return (
    <div className="bg-bg-primary text-text-primary h-full w-full relative overflow-hidden flex flex-col">
      <div className="flex-1 w-full h-full overflow-hidden">
        <div className="flex flex-row items-stretch w-full h-full overflow-hidden bg-bg-primary relative">
          
          {/* Sidebar */}
          <div className={`w-full md:w-[320px] lg:w-[360px] h-full flex-shrink-0 border-r border-border flex-col ${
            (selectedUser || selectedGroup || selectedChannel) ? 'hidden md:flex' : 'flex'
          }`}>
            <SideBar />
          </div>
          
          {/* Main Chat Container / No Chat Selected Screen */}
          <div className={`flex-1 h-full min-w-0 flex-col ${
            (selectedUser || selectedGroup || selectedChannel) ? 'flex' : 'hidden md:flex'
          }`}>
            {(selectedUser || selectedGroup || selectedChannel) ? <ChatContainer /> : <NoChatSelected />}
          </div>

          {/* Optional Right Sidebar */}
          {(selectedUser || selectedGroup || selectedChannel) && showRightSidebar && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}