import React from 'react'
import { LuMessageSquare } from "react-icons/lu";
const NoChatSelected = () => {
  return (
    <div className='w-[80%] flex-1 flex p-16 flex-col items-center justify-center bg-base-200/50'>
        <div className='max-w-md text-center flex items-center flex-col justify-center gap-3 w-full min-h-[40vh]'>
            <span className='text-white bg-black rounded-full p-3'><LuMessageSquare className='text-3xl' /></span>
            <h1 className='text-2xl font-bold'>Welcome to ChatYou!</h1>
            <p className='text-gray-400 text-sm'>Select a chat to start messaging from sidebar or search for a friend</p>
        </div>
    </div>
  )
}

export default NoChatSelected