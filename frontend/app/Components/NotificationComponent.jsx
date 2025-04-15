'use client'
import React, { useContext } from 'react';
import { IoMdClose } from "react-icons/io";
import { NotifyContext } from '../Context/NotifyContext';
import Image from 'next/image';
import { MessageContext } from '../Context/MessageContext';
const NotificationComponent = ({ showMenu, setShowMenu , showNotification , setShowNotification }) => {
  const { notifications } = useContext(NotifyContext)
  const {selectedUser} = useContext(MessageContext)
    return (
    <div
      className={`bg-white shadow-lg w-80 rounded-xl absolute top-10 right-4 z-50 transition-opacity duration-300 ${
        showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className='flex flex-col w-full'>
        <div className="flex items-center justify-between w-full p-4 border-b">
          <span className='font-semibold text-gray-600 text-sm'>Notifications</span>
          <IoMdClose
            onClick={() => setShowMenu(false)}
            className='text-xl text-gray-600 cursor-pointer hover:text-gray-900'
          />
        </div>

        <div className='text-sm text-gray-500'>  
            {
                notifications.length > 0 ?
                <div className="flex flex-col">
                  {
                    notifications.map((notification) => {
                      return (
                        <div key={notification._id} className="flex items-center gap-2 p-3 hover:bg-gray-100 transition-all duration-700">
                          <Image src={notification?.sender?.profilePic?.url} alt="avatar" width={30} height={30} className="rounded-full" />
                          <span className="text-gray-600">{notification?.username} Send you a message</span>
                        </div>
                      )
                    }).slice(0, 6)
                  }
                  <span
                    className={`${notifications.length > 1 ? 'block' : 'hidden'} text-xs text-gray-400 text-center py-2 cursor-pointer`}
                    onClick={() => { setShowMenu(false); setShowNotification(true) }}
                  >
                    View All
                  </span>
                </div>
                :
                <p>No new notifications.</p>
            }
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
