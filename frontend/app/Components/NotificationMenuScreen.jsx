'use client'
import React, { useContext } from 'react'
import { NotifyContext } from '../Context/NotifyContext'
import { MessageContext } from '../Context/MessageContext'
import Image from 'next/image'
import { IoMdClose } from "react-icons/io";

const NotificationMenuScreen = ({showNotification , setShowNotification }) => {
  const { notifications } = useContext(NotifyContext)
  const {selectedUser , setSelectedUser} = useContext(MessageContext)
  return (
    <div className={`${showNotification ? "menu_bg" : ""}`}>
      <div className={`${showNotification ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-700 flex-col w-[80%] md:w-[500px] mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-xl`}>
          <div className="flex items-center w-full justify-between p-4">
            <span className="text-gray-600 font-semibold">All Notifications</span>
            <IoMdClose onClick={() => setShowNotification(false)} className="text-xl text-primary cursor-pointer hover:text-gray-900" />
          </div>
          {
            notifications.map((notification) => {
              return (
                <div
                  key={notification._id}
                  onClick={() => { setSelectedUser(notification.sender); setShowAll(false) }}
                  className="flex justify-between items-center gap-2 p-4 w-full hover:bg-gray-100 transition-all duration-700"
                >
                  <div className="flex items-center gap-2">
                    <Image src={notification?.sender?.profilePic?.url} alt="avatar" width={30} height={30} className="rounded-full" />
                    <span className="text-gray-600">{notification.sender?.username} Send you a message</span>
                  </div>
                  <span className="text-gray-400 text-xs">{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
              )
            })
          }
      </div>  
    </div>
  )
}

export default NotificationMenuScreen