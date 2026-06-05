'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '@/app/Context/AuthContext';
import { FaUser, FaQuoteLeft } from 'react-icons/fa';

const ProfileUpdateForm = () => {
  const { authUser, handleUpdateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: authUser?.username || '',
    profileName: authUser?.profileName || '',
    description: authUser?.description || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateProfile(formData.name, formData.profileName, formData.description);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Display Name
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
          <FaUser className="text-text-muted text-xs" />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter display name"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold"
          />
        </div>
      </div>

      {/* Profile Username Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Profile handle
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
          <span className="text-text-muted text-sm font-extrabold select-none">@</span>
          <input
            name="profileName"
            value={formData.profileName}
            onChange={handleChange}
            placeholder="username"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold"
          />
        </div>
      </div>

      {/* Description input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Bio / Description
        </label>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300 shadow-sm">
          <FaQuoteLeft className="text-text-muted text-[10px] mt-1 flex-shrink-0" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write something interesting about yourself..."
            rows={3}
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-text-inverse font-extrabold rounded-xl shadow-md hover:scale-102 active:scale-95 transition-all duration-300 text-xs uppercase tracking-wider"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ProfileUpdateForm;
