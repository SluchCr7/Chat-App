import React, { memo } from 'react'
import { IoInformation } from "react-icons/io5";

const Alert =memo(({Notify}) => {

  return (
    <div className={`${Notify === "" ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-[90%] md:w-[350px]"} transition-all border-l-[2px] border-DarkRed duration-1000 flex items-center gap-2 bg-white z-[1000] py-4 px-7 rounded-md text-black shadow-xl fixed top-10 right-6`}>
        <IoInformation className='text-2xl bg-black text-white w-5 h-5 rounded-full'/>
        <span className='text-black text-sm'>{Notify}</span>
    </div>
  )
})

Alert.displayName = "Alert"

export default Alert