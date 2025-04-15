'use client'
import React from 'react';
import { LuMessageSquare } from 'react-icons/lu';
import { useRouter } from 'next/router';

const NotFound = () => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br bg-bg px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Animated Icon with Spinning Border */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin opacity-30"></div>
          <div className="relative z-10 bg-black text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <LuMessageSquare className="text-4xl" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-5xl font-extrabold text-text tracking-wider">404</h1>
        <p className="text-gray-400 text-lg">Oops! The page you're looking for doesn't exist.</p>

        {/* CTA Button */}
        <button
          className="mt-4 px-6 py-2 bg-primary text-text rounded-xl shadow hover:bg-opacity-80 transition duration-300"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
