'use client'
import React, { useEffect } from 'react'

const Loader = ({onComplete}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // Call function after 10 seconds
    }, 10000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className='bg-black w-full justify-center flex items-center min-h-screen'>
        {/* <div className='w-10 h-10 rounded-full border border-gray-950 loader'>
        </div> */}
        <span className="loading loading-spinner loading-xl"></span>
    </div>
  )
}

export default Loader