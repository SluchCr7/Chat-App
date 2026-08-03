'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '@/app/Context/AuthContext';
import Logo from '@/app/Components/Logo';
import { FaUserShield, FaUsers, FaDatabase, FaServer, FaCheck, FaTimes, FaTrashAlt, FaClock } from "react-icons/fa";
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminDashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/admin/stats`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin metrics");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/admin/users?page=${page}&limit=8`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setUsersData(res.data.users);
      setTotalPages(res.data.pages);
      setTotalUsersCount(res.data.total);
    } catch (err) {
      console.error(err);
    }
  }, [page]);

  useEffect(() => {
    if (authUser && authUser.isAdmin) {
      fetchStats();
      fetchUsers();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [authUser, fetchStats, fetchUsers]);

  const handleToggleAdmin = async (userId) => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/admin/users/${userId}/admin`, {}, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin role");
    }
  };

  const handleToggleVerify = async (userId) => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.put(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/admin/users/${userId}/verify`, {}, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to toggle verification");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/admin/users/${userId}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!authUser || !authUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md p-8 rounded-3xl border border-border bg-surface text-center space-y-4 shadow-xl">
          <div className="p-4 bg-error/10 text-error rounded-full inline-block border border-error/20">
            <FaUserShield className="text-4xl" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Restricted Module Access</h1>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            This module is reserved for platform administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-8 bg-bg-primary text-text-primary px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8 text-left">
        
        {/* Header */}
        <div className="inline-flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-3 shadow-sm">
          <Logo compact />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Admin Console</h1>
            <p className="text-text-muted text-xs font-semibold mt-0.5">Platform operations, system metrics, and moderation database.</p>
          </div>
        </div>

        {/* Metrics Widgets */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-info/10 text-info border border-info/20">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Total Users</span>
                <span className="text-xl font-black text-text-primary">{stats.stats.totalUsers}</span>
                <span className="block text-[10px] text-emerald-500 mt-0.5 font-bold">● {stats.stats.onlineUsersCount} Online Now</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <FaDatabase className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Total Groups</span>
                <span className="text-xl font-black text-text-primary">{stats.stats.totalGroups}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-semibold">{stats.stats.totalChannels} channels</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FaServer className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Messages Sent</span>
                <span className="text-xl font-black text-text-primary">{stats.stats.totalMessages}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-semibold">Total DB records</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <FaClock className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">System Uptime</span>
                <span className="text-lg font-black text-text-primary">
                  {(stats.systemInfo.uptime / 3600).toFixed(1)} hrs
                </span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-semibold">Node {stats.systemInfo.nodeVersion}</span>
              </div>
            </div>
          </div>
        )}

        {/* User Moderation & Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* User Table */}
          <div className="xl:col-span-2 border border-border bg-surface rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-black text-text-primary border-b border-border pb-3 uppercase tracking-wider">User Directory & Moderation</h2>
            
            <div className="overflow-x-auto w-full">
              <table className="table w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3 text-center">Verified</th>
                    <th className="py-2.5 px-3 text-center">Admin</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user) => (
                    <tr key={user._id} className="border-b border-border/30 hover:bg-bg-primary/40 transition">
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <img 
                          src={user.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-border" 
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary text-xs">{user.username}</span>
                          <span className="text-[10px] text-text-muted font-semibold">@{user.profileName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-secondary text-xs font-semibold">{user.email}</td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleToggleVerify(user._id)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isVerified 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover"
                          }`}
                        >
                          {user.isVerified ? <FaCheck size={10} /> : <FaTimes size={10} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleToggleAdmin(user._id)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isAdmin 
                            ? "bg-accent/10 border-accent/20 text-accent" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover"
                          }`}
                        >
                          {user.isAdmin ? <FaCheck size={10} /> : <FaTimes size={10} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition"
                          title="Delete User"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center pt-3 border-t border-border text-xs">
              <span className="text-text-secondary font-semibold">Total {totalUsersCount} registered users</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition"
                >
                  Prev
                </button>
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
                  {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* System Performance Status */}
          {stats && (
            <div className="border border-border bg-surface rounded-3xl p-6 space-y-5 shadow-sm">
              <h2 className="text-sm font-black text-text-primary border-b border-border pb-3 uppercase tracking-wider">Environment Monitor</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-border/30 text-xs font-semibold">
                  <span className="text-text-secondary">Platform</span>
                  <span className="font-bold text-text-primary">{stats.systemInfo.platform} ({stats.systemInfo.arch})</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/30 text-xs font-semibold">
                  <span className="text-text-secondary">CPUs</span>
                  <span className="font-bold text-text-primary">{stats.systemInfo.cpuCount} Cores</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary">Free RAM</span>
                    <span className="text-text-primary">
                      {((stats.systemInfo.freeMem / stats.systemInfo.totalMem) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-bg-primary border border-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${((stats.systemInfo.freeMem / stats.systemInfo.totalMem) * 100)}%` }}
                    />
                  </div>
                  <span className="block text-[9px] text-text-muted font-bold mt-1">
                    {(stats.systemInfo.freeMem / 1024 / 1024 / 1024).toFixed(1)} GB free of {(stats.systemInfo.totalMem / 1024 / 1024 / 1024).toFixed(1)} GB
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
