import Image from 'next/image'
import React, { useContext } from 'react'
import { IoMdClose } from "react-icons/io";
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import Link from 'next/link';

const Chatheader = () => {
  const {selectedUser , setSelectedUser} = useContext(MessageContext)
  const {onlineUsers, users} = useContext(AuthContext)
  return (
      <div className='border-b w-full border-gray-300 py-6 px-4 flex items-center justify-between'>
        <Link href={`/Pages/Users/${selectedUser?._id}`} className='flex items-center gap-3'>
          <Image src={selectedUser?.profilePic?.url} alt='User' width={40} height={40} className='rounded-full' />
          <div className='relative'>
            <span className='font-semibold text-gray-400 hover:underline'>{selectedUser?.username}</span>
            <p className='text-xs text-gray-500'>
              {
                onlineUsers.includes(selectedUser?._id) ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </Link>
        <IoMdClose onClick={() => setSelectedUser(null)} className='text-xl text-primary cursor-pointer hover:text-gray-900' />
      </div>
  )
}

export default Chatheader