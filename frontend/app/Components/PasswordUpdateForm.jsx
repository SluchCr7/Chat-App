'use client';

import React, { useContext, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaLock } from 'react-icons/fa';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      
      {/* Modal Card */}
      <div className="bg-surface border border-border rounded-[28px] max-w-md w-full p-8 shadow-2xl relative flex flex-col gap-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-primary/50 transition duration-300"
          type="button"
        >
          <IoMdClose size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-1 pr-6">
          <h2 className="text-xl font-extrabold text-text-primary">Update Password</h2>
          <p className="text-xs text-text-secondary font-medium">
            Enter your current password and create a new secure password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Old Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300">
              <FaLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              New Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300">
              <FaLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Create new password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Confirm New Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 px-4 py-3 transition duration-300">
              <FaLock className="text-text-muted text-xs" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Retype new password"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted text-sm font-semibold"
              />
            </div>
          </div>

          {/* Error and Success States */}
          {error && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg animate-shake">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-extrabold text-text-inverse uppercase tracking-wider shadow-md hover:scale-102 active:scale-95 transition-all duration-300"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordUpdateForm;
