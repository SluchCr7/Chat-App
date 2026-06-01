'use client'

import Loader from "./Components/Loader";
import { useState, useEffect, useContext } from "react";
import SideBar from "./Components/SideBar";
import NoChatSelected from "./Components/NoChatSelected";
import ChatContainer from "./Components/ChatContainer";
import { AuthContext } from "./Context/AuthContext";
import { MessageContext } from "./Context/MessageContext";
import HomePage from "./Components/Homepage";
import RightSidebar from "./Components/RightSidebar";
import { AnimatePresence } from "framer-motion";

const steps = [
  "Establishing secure connection...",      // Step 0: 0% - 14%
  "Loading conversations...",               // Step 1: 15% - 31%
  "Synchronizing channels...",              // Step 2: 32% - 47%
  "Restoring workspace...",                 // Step 3: 48% - 64%
  "Initializing real-time services...",     // Step 4: 65% - 79%
  "Finalizing experience...",               // Step 5: 80% - 94%
  "Welcome back."                           // Step 6: 95% - 100%
];

export default function Home() {
  const { authUser } = useContext(AuthContext);
  const { selectedUser, selectedGroup, selectedChannel, showRightSidebar } = useContext(MessageContext);
  
  // Single Source of Truth for loading state
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Progressive loading timing loop (variable speeds to mimic a real connection sync)
  useEffect(() => {
    let timer;
    const startLoading = () => {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          
          let increment = 1;
          if (prev < 20) {
            // Speed up initially to establish handshakes
            increment = Math.floor(Math.random() * 3) + 2;
          } else if (prev < 50) {
            // Normal pacing for loading conversations & channels
            increment = Math.floor(Math.random() * 2) + 1;
          } else if (prev < 80) {
            // Slower connection pacing for synchronizing services & security check
            increment = Math.floor(Math.random() * 3) + 1;
          } else {
            // Precise increments for final loading steps
            increment = 1;
          }
          
          const next = prev + increment;
          return next > 100 ? 100 : next;
        });
      }, 30); // smooth tick intervals
    };

    startLoading();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Post-completion hold state before dismissing loader
  useEffect(() => {
    if (progress === 100) {
      const holdTimer = setTimeout(() => {
        setLoading(false);
      }, 900); // Elegant hold of "Welcome back" to let the user process the active state
      return () => clearTimeout(holdTimer);
    }
  }, [progress]);

  // Determine current step index based on progress thresholds
  const getStepIndex = (p) => {
    if (p < 15) return 0;
    if (p < 32) return 1;
    if (p < 48) return 2;
    if (p < 65) return 3;
    if (p < 80) return 4;
    if (p < 95) return 5;
    return 6;
  };

  const stepIndex = getStepIndex(progress);
  const currentStep = steps[stepIndex];

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen relative overflow-hidden">
      {/* Premium Loader Overlay with seamless exit animation */}
      <AnimatePresence mode="wait">
        {loading && (
          <Loader 
            currentProgress={progress}
            currentStep={currentStep}
            completionState={progress === 100}
          />
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className="bg-bg-primary text-text-primary min-h-screen">
        {authUser ? (
          <div className="flex flex-col lg:flex-row items-stretch pt-3 px-4 pb-6 w-full max-w-[1600px] mx-auto gap-4">
            <SideBar />
            {(selectedUser || selectedGroup || selectedChannel) ? <ChatContainer /> : <NoChatSelected />}
            {(selectedUser || selectedGroup || selectedChannel) && showRightSidebar && <RightSidebar />}
          </div>
        ) : (
          <HomePage />
        )}
      </div>
    </div>
  );
}