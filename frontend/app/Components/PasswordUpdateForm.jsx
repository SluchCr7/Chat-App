'use client';

import React, { useContext, useState, useEffect } from 'react';
import { LuLock, LuX, LuCheck } from "react-icons/lu";
import { AuthContext } from '../Context/AuthContext';

const PasswordUpdateForm = ({ show, setShow }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { updatePassword } = useContext(AuthContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && show) {
        setShow(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, setShow]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    updatePassword(formData.newPassword);
    setSuccess('Password updated successfully!');
    setTimeout(() => {
      setShow(false);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('');
    }, 1200);
  };

  if (!show) return null;

  return (
    <div className="menu_bg">
      {/* Modal Card */}
      <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative flex flex-col gap-5 text-left">
        
        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
          type="button"
          aria-label="Close dialog"
        >
          <LuX size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6 border-b border-border pb-3">
          <h2 className="text-base font-black text-text-primary tracking-tight">Update Password</h2>
          <p className="text-xs text-text-secondary font-medium">
            Enter your current password and establish a new secure credential.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          
          {/* Old Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
              Current Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150">
              <LuLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Current password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
              New Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150">
              <LuLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Create new password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
              Confirm New Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-3.5 py-2.5 transition duration-150">
              <LuLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Retype new password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Error and Success Feedback */}
          {error && (
            <p className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <LuCheck size={14} /> {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-bold text-text-inverse uppercase tracking-wider shadow-md active:scale-95 transition-all duration-150"
          >
            Save New Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordUpdateForm;
