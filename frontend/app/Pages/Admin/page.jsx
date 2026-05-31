'use client';

import React, { useContext, useEffect, useState } from 'react';
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

  const fetchStats = async () => {
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
  };

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    if (authUser && authUser.isAdmin) {
      fetchStats();
      fetchUsers();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [authUser, page]);

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
    if (!window.confirm("Are you absolutely sure you want to delete this user? All their messages and conversations will be deleted forever.")) return;
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

  // Strict Authorization Check
  if (!authUser || !authUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md p-8 rounded-2xl glass-panel text-center space-y-4">
          <div className="p-4 bg-error/10 text-error rounded-full inline-block border border-error/20">
            <FaUserShield className="text-5xl" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Access Denied</h1>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            This module is restricted to administrators only. If you believe this is an error, please contact the system deployment lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-10 bg-bg-primary text-text-primary px-6 transition-all duration-300">
      <div className="max-w-[1500px] mx-auto space-y-10 text-left">
        
        {/* Page Title */}
        <div className="inline-flex items-center gap-3 rounded-2xl bg-surface border border-border px-5 py-4 shadow-sm">
          <Logo compact />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Admin Dashboard</h1>
            <p className="text-text-muted text-xs font-bold mt-0.5">Monitor system health, manage communities, and moderate members.</p>
          </div>
        </div>

        {/* Top Summaries Stats Widgets */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-4 rounded-xl bg-info/10 text-info border border-info/15">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Users</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalUsers}</span>
                <span className="block text-[10px] text-success mt-1 font-bold">● {stats.stats.onlineUsersCount} Online Now</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-4 rounded-xl bg-accent/10 text-accent border border-accent/15">
                <FaDatabase className="text-2xl" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Groups</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalGroups}</span>
                <span className="block text-[10px] text-text-secondary mt-1 font-semibold">{stats.stats.totalChannels} active channels</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-4 rounded-xl bg-success/10 text-success border border-success/15">
                <FaServer className="text-2xl" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-text-muted tracking-widest">Messages Sent</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalMessages}</span>
                <span className="block text-[10px] text-text-secondary mt-1 font-semibold">Accumulated db records</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-4 rounded-xl bg-warning/10 text-warning border border-warning/15">
                <FaClock className="text-2xl" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-text-muted tracking-widest">Uptime Monitor</span>
                <span className="text-xl font-black text-text-primary">
                  {(stats.systemInfo.uptime / 3600).toFixed(1)} hrs
                </span>
                <span className="block text-[10px] text-text-secondary mt-1 font-bold">Node: {stats.systemInfo.nodeVersion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grids for User lists and RAM usage */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Members Moderation List */}
          <div className="xl:col-span-2 border border-border bg-surface rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-text-primary border-b border-border pb-3 uppercase tracking-wider">User Moderation Database</h2>
            
            <div className="overflow-x-auto w-full">
              <table className="table w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Verified</th>
                    <th className="py-3 px-4 text-center">Admin</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user) => (
                    <tr key={user._id} className="border-b border-border/40 hover:bg-bg-primary/30 transition-all duration-300">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img 
                          src={user.profilePic?.url} 
                          alt="avatar" 
                          className="w-9 h-9 rounded-full object-cover border border-border" 
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary text-sm">{user.username}</span>
                          <span className="text-xs text-text-muted font-semibold">@{user.profileName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary text-xs font-semibold">{user.email}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => handleToggleVerify(user._id)}
                          className={`p-1.5 rounded-lg border transition duration-300 ${
                            user.isVerified 
                            ? "bg-success/10 border-success/20 text-success" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover hover:bg-surface-hover"
                          }`}
                        >
                          {user.isVerified ? <FaCheck /> : <FaTimes />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => handleToggleAdmin(user._id)}
                          className={`p-1.5 rounded-lg border transition duration-300 ${
                            user.isAdmin 
                            ? "bg-accent/10 border-accent/20 text-accent" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover hover:bg-surface-hover"
                          }`}
                        >
                          {user.isAdmin ? <FaCheck /> : <FaTimes />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg bg-error/10 border border-error/20 hover:bg-error/20 text-error transition-all duration-300"
                          title="Delete User"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-border text-xs">
              <span className="text-text-secondary font-semibold">Total {totalUsersCount} members registered</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Prev
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
                  {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* System Performance Status */}
          {stats && (
            <div className="border border-border bg-surface rounded-2xl p-6 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-text-primary border-b border-border pb-3 uppercase tracking-wider">Environment Monitor</h2>
              
              <div className="space-y-4">
                {/* Platform */}
                <div className="flex justify-between items-center py-2 border-b border-border/30 text-xs font-semibold">
                  <span className="text-text-secondary">Architecture Platform</span>
                  <span className="font-bold text-text-primary">{stats.systemInfo.platform} ({stats.systemInfo.arch})</span>
                </div>

                {/* CPUs */}
                <div className="flex justify-between items-center py-2 border-b border-border/30 text-xs font-semibold">
                  <span className="text-text-secondary">Processor Cores</span>
                  <span className="font-bold text-text-primary">{stats.systemInfo.cpuCount} Cores</span>
                </div>

                {/* Memory Gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary">Free System RAM</span>
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
                  <span className="block text-[10px] text-text-muted font-bold">
                    {(stats.systemInfo.freeMem / 1024 / 1024 / 1024).toFixed(1)} GB free of {(stats.systemInfo.totalMem / 1024 / 1024 / 1024).toFixed(1)} GB total
                  </span>
                </div>
              </div>

              {/* Message aggregated progress bar indicator */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Activity Analytics</h3>
                {stats.messageStats?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                    {stats.messageStats.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-border/20 font-semibold">
                        <span className="text-text-secondary">{item._id}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">{item.count} posts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted font-semibold">No message aggregates compiled for the past week.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
