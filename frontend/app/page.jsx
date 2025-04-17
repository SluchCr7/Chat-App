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
import { LuMessageSquare } from "react-icons/lu";

export default function Home() {
  const router = useRouter();
  const {isLogining , isSigningUp , authUser , onlineUsers} = useContext(AuthContext);
  const { selectedUser } = useContext(MessageContext)
  const {theme} = useContext(ThemeContext)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      setTimeout(() => {
          setLoading(false);
      }, 3000);
  }, []);
  return (
    <div className={`min-h-[80%] w-full `}>
      {
        loading ? 
          <div className="absolute top-0 left-0 w-full">
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
          </div>
          :
          <div className="bg-bg text-text">
            {
              authUser ?          
                <div className="flex items-start pt-5 px-4">
                  <div className="flex overflow-hidden rounded-lg w-full">
                    <SideBar />
                    {selectedUser ? <ChatContainer /> : <NoChatSelected /> }
                    {/* <NoChatSe
                    lected /> */}
                  </div>
                </div>
                :
                <HomePage/>
            }
          </div>
      }
    </div>
  );
}