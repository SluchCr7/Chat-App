import React from 'react'
import Logo from './Logo'
const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center w-full justify-center p-12">
      <div className="w-full text-center">
        <div className="mx-auto mb-8 inline-flex items-center justify-center rounded-3xl bg-card-custom px-4 py-3 shadow-sm shadow-cyan-500/10">
          <Logo compact />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8 w-[60%] mx-auto">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full w-[100%] bg-gray-700 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-muted">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;