'use client';

import { useContext } from "react";
import { AuthContext } from "./Context/AuthContext";
import { MessageContext } from "./Context/MessageContext";
import SideBar from "./Components/SideBar";
import NoChatSelected from "./Components/NoChatSelected";
import ChatContainer from "./Components/ChatContainer";
import RightSidebar from "./Components/RightSidebar";
import LoginPage from "./Pages/Login/page";
import Loader from "./Components/Loader";

export default function Home() {
  const { authUser, isAuthLoading } = useContext(AuthContext);
  const { selectedUser, selectedGroup, selectedChannel, showRightSidebar } = useContext(MessageContext);

  // If initial auth check is ongoing, render branded VYRO loader
  if (isAuthLoading) {
    return <Loader currentProgress={70} currentStep="Connecting to VYRO Network..." />;
  }

  // If NOT logged in: render the Login experience
  if (!authUser) {
    return <LoginPage />;
  }

  // If logged in: render the VYRO Workspace
  return (
    <div className="bg-bg-primary text-text-primary h-full w-full relative overflow-hidden flex flex-col">
      <div className="flex-1 w-full h-full overflow-hidden">
        <div className="flex flex-row items-stretch w-full h-full overflow-hidden bg-bg-primary relative">
          
          {/* Conversation Sidebar */}
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

          {/* Details / Members / Media Right Sidebar */}
          {(selectedUser || selectedGroup || selectedChannel) && showRightSidebar && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}