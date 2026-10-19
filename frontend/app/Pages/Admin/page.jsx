'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '@/app/Context/AuthContext';
import Logo from '@/app/Components/Logo';
import Avatar from '@/app/Components/Avatar';
import { 
  LuShield, LuUsers, LuDatabase, LuServer, LuClock, 
  LuCheck, LuX, LuTrash2, LuCpu, LuHardDrive, LuChevronLeft, LuChevronRight 
} from "react-icons/lu";
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
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (!authUser || !authUser.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary p-6 text-center">
        <div className="p-4 rounded-3xl bg-surface border border-border shadow-xl max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <LuShield className="text-xl" />
          </div>
          <h1 className="text-lg font-black tracking-tight">Access Restricted</h1>
          <p className="text-xs text-text-secondary font-medium">
            You do not have administrative privileges to view the VYRO moderation dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-8 sm:py-10 px-4 sm:px-6 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8 text-left">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <Logo compact size="md" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Admin Console</h1>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                System telemetry, user directory, role permissions, and space moderation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
              Super Admin Mode
            </span>
          </div>
        </div>

        {/* Metric Cards Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <LuUsers className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Active Accounts</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalUsers}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-medium">{stats.stats.verifiedUsers} verified</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <LuDatabase className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Communities</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalGroups}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-medium">{stats.stats.totalChannels} channels</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LuServer className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Messages Processed</span>
                <span className="text-2xl font-black text-text-primary">{stats.stats.totalMessages}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-medium">Real-time sync</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <LuClock className="text-xl" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-black text-text-muted tracking-widest">Service Uptime</span>
                <span className="text-2xl font-black text-text-primary">
                  {(stats.systemInfo.uptime / 3600).toFixed(1)}h
                </span>
                <span className="block text-[10px] text-text-secondary mt-0.5 font-medium">Node {stats.systemInfo.nodeVersion}</span>
              </div>
            </div>
          </div>
        )}

        {/* User Moderation & Performance Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* User Table */}
          <div className="xl:col-span-2 border border-border bg-surface rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black text-text-primary border-b border-border pb-3 uppercase tracking-wider">User Directory & Permissions</h2>
            
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
                        <Avatar src={user.profilePic?.url} name={user.username} size={32} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-text-primary text-xs truncate">{user.username}</span>
                          <span className="text-[10px] text-text-muted font-medium truncate">@{user.profileName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-secondary text-xs font-medium">{user.email}</td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleToggleVerify(user._id)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isVerified 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover"
                          }`}
                          title="Toggle Verification"
                        >
                          {user.isVerified ? <LuCheck size={12} /> : <LuX size={12} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleToggleAdmin(user._id)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isAdmin 
                            ? "bg-primary/10 border-primary/20 text-primary" 
                            : "bg-surface border-border text-text-muted hover:border-border-hover"
                          }`}
                          title="Toggle Admin Privilege"
                        >
                          {user.isAdmin ? <LuCheck size={12} /> : <LuX size={12} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition"
                          title="Delete User"
                        >
                          <LuTrash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-3 border-t border-border text-xs">
              <span className="text-text-secondary font-medium">Total {totalUsersCount} registered users</span>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition flex items-center gap-1"
                >
                  <LuChevronLeft size={13} /> Prev
                </button>
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 text-xs">
                  {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition flex items-center gap-1"
                >
                  Next <LuChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* System Performance Status */}
          {stats && (
            <div className="border border-border bg-surface rounded-3xl p-6 space-y-5 shadow-sm text-left">
              <h2 className="text-xs font-black text-text-primary border-b border-border pb-3 uppercase tracking-wider flex items-center gap-2">
                <LuCpu className="text-primary" /> Environment Telemetry
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-border/30 text-xs font-medium">
                  <span className="text-text-secondary">Host Platform</span>
                  <span className="font-bold text-text-primary">{stats.systemInfo.platform} ({stats.systemInfo.arch})</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/30 text-xs font-medium">
                  <span className="text-text-secondary">Processor Cores</span>
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
                  <span className="block text-[10px] text-text-muted font-medium mt-1">
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
