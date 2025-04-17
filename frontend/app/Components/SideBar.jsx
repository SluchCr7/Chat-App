'use client'
import React, { useContext, useEffect } from 'react'
import SideBarSkeleton from '../Skeletons/SideBarSkeleton';
import { FaUser } from "react-icons/fa";
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';

const SideBar = () => {
    const { isUserLoading, users, setSelectedUser } = useContext(MessageContext)
    const {authUser} = useContext(AuthContext)
    const {onlineUsers} = useContext(AuthContext)
    if (isUserLoading) return <SideBarSkeleton/>
    return (
    <div className='w-[20%] min-h-[100vh] border-r border-base-300 transition-all duration-200 flex flex-col items-center'>
        <div className='border-b border-base-300 w-full p-5 '>
            <div className='flex items-center gap-2'>
                <span><FaUser className='w-4 h-4' /></span>
                <span className='font-medium hidden lg:block'>Contacts</span>
            </div>
            {/* Todo : Online Users Filtier and Count */}
            <p className='hidden md:block'>
                {
                    onlineUsers.length > 0 && (
                        <span className='text-sm text-gray-400'>{onlineUsers.filter((user) => user !== authUser._id).length} Users Online Now</span>
                    )
                }
            </p>
        </div>
            <div className='overflow-y-auto w-full py-3'>
                {
                    users.map((user , index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100  transition-colors`}
                        >
                            <div className="flex items-center gap-3">
                                <div className='relative'>
                                    <Image 
                                        src={user?.profilePic?.url}
                                        width={40}
                                        height={40}
                                        alt="user"
                                        className="rounded-full"
                                    />
                                    {
                                        onlineUsers.includes(user._id) && (
                                            <div className='w-2 h-2 rounded-full bg-green-500 absolute bottom-0 right-1'></div>
                                        )
                                    }                                    
                                </div>
                                <div className='hidden md:flex items-start flex-col gap-0.5'>
                                    <span className='font-semibold text-base '>{user.username}</span>
                                    <span className='text-xs text-gray-400'>
                                        {
                                            onlineUsers.includes(user._id) ? 'Online' : 'Offline'
                                        }
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))
                }
        </div>
    </div>
  )
}

export default SideBar