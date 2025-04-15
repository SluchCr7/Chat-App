import React from 'react'
import { LuMessageSquare } from 'react-icons/lu'

const loading = () => {
  return (
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
  )
}

export default loading