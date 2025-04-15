'use client'
import Image from "next/image";
import Loader from "./Components/Loader";
import { useRouter } from "next/navigation";
import { useState , useEffect, useContext } from "react";
import SideBar from "./Components/SideBar";
import NoChatSelected from "./Components/NoChatSelected";
import ChatContainer from "./Components/ChatContainer";
import { AuthContext } from "./Context/AuthContext";
import { MessageContext } from "./Context/MessageContext";
import HomePage from "./Components/Homepage";
import { ThemeContext } from "./Context/ThemeContext";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {isLogining , isSigningUp , authUser , onlineUsers} = useContext(AuthContext);
  const { selectedUser } = useContext(MessageContext)
  const {theme} = useContext(ThemeContext)

  return (
    <div className={`min-h-[80%] w-full bg-bg text-text`}>
      {
        authUser ?          
          <div className="flex items-start pt-5 px-4">
            <div className="flex overflow-hidden rounded-lg w-full">
              <SideBar />
              {selectedUser ? <ChatContainer /> : <NoChatSelected /> }
              {/* <NoChatSelected /> */}
            </div>
          </div>
          :
          <HomePage/>
      }
    </div>
  );
}