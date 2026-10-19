'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '@/app/Context/AuthContext';
import { LuUser, LuAtSign, LuQuote, LuCheck } from 'react-icons/lu';

const ProfileUpdateForm = () => {
  const { authUser, handleUpdateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: authUser?.username || '',
    profileName: authUser?.profileName || '',
    description: authUser?.description || '',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleUpdateProfile(formData.name, formData.profileName, formData.description);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
      
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
          Display Name
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150 shadow-sm">
          <LuUser className="text-text-muted text-xs flex-shrink-0" />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter display name"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
            required
          />
        </div>
      </div>

      {/* Profile Username Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
          Profile Handle
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150 shadow-sm">
          <LuAtSign className="text-text-muted text-xs flex-shrink-0" />
          <input
            name="profileName"
            value={formData.profileName}
            onChange={handleChange}
            placeholder="handle"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
            required
          />
        </div>
      </div>

      {/* Description input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
          Bio / About
        </label>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150 shadow-sm">
          <LuQuote className="text-text-muted text-xs mt-1 flex-shrink-0" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell contacts and communities a little bit about yourself..."
            rows={3}
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-medium resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-text-inverse font-bold rounded-xl shadow-md transition-all duration-150 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <LuCheck className="text-sm" /> Saved
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileUpdateForm;
