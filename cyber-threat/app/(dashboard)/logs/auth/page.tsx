'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

// Types
interface AuthLog {
  _id: string;
  timestamp: string;
  username: string;
  src_ip: string;
  dest_host: string;
  status: 'SUCCESS' | 'FAILURE';
  auth_method: string;
  user_agent?: string;
  geo_location?: string;
  risk_score?: number;
}

interface AuthFilters {
  username: string;
  status: string;
  authMethod: string;
  srcIp: string;
  destHost: string;
  timeRange: string;
  search: string;
}

interface AuthStats {
  totalLogs: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  uniqueIPs: number;
  suspiciousAttempts: number;
}

export default function AuthLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuthLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuthLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState<AuthStats | null>(null);
  const [filters, setFilters] = useState<AuthFilters>({
    username: '',
    status: 'ALL',
    authMethod: 'ALL',
    srcIp: '',
    destHost: '',
    timeRange: '24h',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'username' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const pageSize = 20;

  // Available filter options
  const userOptions = ['alice', 'bob', 'charlie', 'david', 'eva'];
  const authMethods = ['PASSWORD', 'SSH_KEY', 'MFA', 'OAUTH', 'CERTIFICATE'];
  const hostOptions = ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5'];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch auth logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        api_key: API_KEY,
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      });

      if (filters.username) queryParams.append('username', filters.username);
      if (filters.status !== 'ALL') queryParams.append('status', filters.status);
      if (filters.authMethod !== 'ALL') queryParams.append('auth_method', filters.authMethod);

      const response = await fetch(`${API_URL}/api/logs/auth?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch auth logs: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setFilteredLogs(data.logs || []);
      setTotalLogs(data.total || 0);
      calculateStats(data.logs || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching auth logs:', err);
      setError(`Failed to load auth logs: ${err.message}`);
      
      // Set demo data
      const demoLogs = generateDemoAuthLogs();
      setLogs(demoLogs);
      setFilteredLogs(demoLogs);
      setTotalLogs(demoLogs.length);
      calculateStats(demoLogs);
      setIsLoading(false);
    }
  }, [page, filters.username, filters.status, filters.authMethod]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Calculate statistics
  const calculateStats = (logData: AuthLog[]) => {
    const successCount = logData.filter(l => l.status === 'SUCCESS').length;
    const failedCount = logData.filter(l => l.status === 'FAILURE').length;
    const uniqueUsers = new Set(logData.map(l => l.username)).size;
    const uniqueIPs = new Set(logData.map(l => l.src_ip)).size;
    const suspicious = logData.filter(l => l.risk_score && l.risk_score > 7).length;

    setStats({
      totalLogs: logData.length,
      successfulLogins: successCount,
      failedLogins: failedCount,
      uniqueUsers,
      uniqueIPs,
      suspiciousAttempts: suspicious || Math.floor(failedCount * 0.3)
    });
  };

  // Filter logs based on search and filters
  useEffect(() => {
    let result = [...logs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log =>
        log.username.toLowerCase().includes(searchLower) ||
        log.src_ip.toLowerCase().includes(searchLower) ||
        log.dest_host.toLowerCase().includes(searchLower)
      );
    }

    if (filters.srcIp) {
      result = result.filter(log => log.src_ip.includes(filters.srcIp));
    }

    if (filters.destHost) {
      result = result.filter(log => log.dest_host.includes(filters.destHost));
    }

    // Sort logs
    result.sort((a, b) => {
      if (sortBy === 'timestamp') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'username') {
        return sortOrder === 'desc' 
          ? b.username.localeCompare(a.username) 
          : a.username.localeCompare(b.username);
      } else {
        return sortOrder === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
    });

    setFilteredLogs(result);
  }, [logs, filters.search, filters.srcIp, filters.destHost, sortBy, sortOrder]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Check if IP is suspicious (from threat intel range)
  const isSuspiciousIP = (ip: string) => {
    return ip.startsWith('203.0.113.');
  };

  // Chart configurations
  const loginTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Successful',
        data: [12, 8, 45, 78, 65, 42, 18],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
      },
      {
        label: 'Failed',
        data: [5, 3, 12, 25, 18, 15, 8],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 20, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } }, beginAtZero: true }
    },
  };

  const authMethodData = {
    labels: ['Password', 'SSH Key', 'MFA', 'OAuth', 'Certificate'],
    datasets: [{
      data: [45, 25, 15, 10, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: '#0a0e17',
      borderWidth: 3,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12, padding: 8 } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8 }
    },
    cutout: '65%',
  };

  const userActivityData = {
    labels: userOptions,
    datasets: [{
      label: 'Login Attempts',
      data: [85, 72, 65, 58, 42],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } }, beginAtZero: true }
    },
  };

  // Loading state
  if (isLoading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading authentication logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Authentication Logs
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor login activity and detect suspicious access attempts</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isLive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-[#151c2c] border-[#1e293b] text-gray-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-xs font-medium">{isLive ? 'Live' : 'Paused'}</span>
          </button>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs font-medium">Export</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-purple-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">API Connection Error</h3>
              <p className="mt-1 text-xs text-red-300/70">{error}</p>
              <p className="mt-2 text-xs text-gray-500">Displaying sample authentication data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Total Logs */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalLogs || 400}</p>
          <p className="text-xs text-gray-500 mt-1">Total Logs</p>
        </div>

        {/* Successful Logins */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded-full">
              {stats ? Math.round((stats.successfulLogins / stats.totalLogs) * 100) : 65}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.successfulLogins || 260}</p>
          <p className="text-xs text-gray-500 mt-1">Successful</p>
        </div>

        {/* Failed Logins */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded-full">
              {stats ? Math.round((stats.failedLogins / stats.totalLogs) * 100) : 35}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.failedLogins || 140}</p>
          <p className="text-xs text-gray-500 mt-1">Failed</p>
        </div>

        {/* Unique Users */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.uniqueUsers || 5}</p>
          <p className="text-xs text-gray-500 mt-1">Unique Users</p>
        </div>

        {/* Unique IPs */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.uniqueIPs || 25}</p>
          <p className="text-xs text-gray-500 mt-1">Unique IPs</p>
        </div>

        {/* Suspicious */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 rounded-full uppercase">Alert</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.suspiciousAttempts || 42}</p>
          <p className="text-xs text-gray-500 mt-1">Suspicious</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Login Trend */}
        <div className="lg:col-span-2 bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Login Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Success vs Failed attempts over time</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>Success
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>Failed
              </span>
            </div>
          </div>
          <div className="h-64">
            <Line data={loginTrendData} options={lineChartOptions} />
          </div>
        </div>

        {/* Auth Methods */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Auth Methods</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution by method</p>
            </div>
          </div>
          <div className="h-52">
            <Doughnut data={authMethodData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">User Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Logins per user</p>
            </div>
          </div>
          <div className="h-52">
            <Bar data={userActivityData} options={barChartOptions} />
          </div>
        </div>

        {/* Top Failed Logins */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Failed IPs</h3>
              <p className="text-xs text-gray-500 mt-0.5">IPs with most failures</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { ip: '203.0.113.142', count: 45, suspicious: true },
              { ip: '203.0.113.196', count: 32, suspicious: true },
              { ip: '192.168.1.100', count: 18, suspicious: false },
              { ip: '203.0.113.245', count: 15, suspicious: true },
              { ip: '10.0.0.50', count: 8, suspicious: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg hover:bg-[#1e293b]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.suspicious ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-sm text-gray-300 font-mono">{item.ip}</span>
                  {item.suspicious && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded uppercase">Threat</span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Failed Attempts */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Failures</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest failed attempts</p>
            </div>
          </div>
          <div className="space-y-3">
            {filteredLogs.filter(l => l.status === 'FAILURE').slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg hover:bg-[#1e293b]/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-400">{log.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{log.username}@{log.dest_host}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(log.timestamp)}</p>
                </div>
                {isSuspiciousIP(log.src_ip) && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded uppercase">⚠</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by user, IP, or host..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>

          {/* User Filter */}
          <select
            value={filters.username}
            onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
            className="px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">All Users</option>
            {userOptions.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          {/* Auth Method Filter */}
          <select
            value={filters.authMethod}
            onChange={(e) => setFilters(prev => ({ ...prev, authMethod: e.target.value }))}
            className="px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            {authMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          {/* Time Range */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setFilters(prev => ({ ...prev, timeRange: range }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filters.timeRange === range
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#1e293b] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-[#1e293b] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ username: '', status: 'ALL', authMethod: 'ALL', srcIp: '', destHost: '', timeRange: '24h', search: '' })}
            className="px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Logs Table / Timeline */}
      <div className="flex gap-6">
        <div className={`flex-1 transition-all duration-300 ${showDetailPanel ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
            {viewMode === 'table' ? (
              <>
                {/* Table Header */}
                <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
                  <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => { setSortBy('timestamp'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                      Timestamp
                      <svg className={`w-3 h-3 transition-transform ${sortBy === 'timestamp' && sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => { setSortBy('username'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                      User
                    </div>
                    <div className="col-span-2">Source IP</div>
                    <div className="col-span-2">Destination</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => { setSortBy('status'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                      Status
                    </div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#1e293b]">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const suspicious = isSuspiciousIP(log.src_ip);
                      return (
                        <div
                          key={log._id}
                          className={`px-4 py-4 hover:bg-[#1e293b]/50 transition-all cursor-pointer ${
                            selectedLog?._id === log._id ? 'bg-[#1e293b]/70 border-l-2 border-purple-500' : ''
                          } ${suspicious ? 'bg-red-500/5' : ''}`}
                          onClick={() => { setSelectedLog(log); setShowDetailPanel(true); }}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Timestamp */}
                            <div className="col-span-2">
                              <p className="text-sm text-gray-300">{formatRelativeTime(log.timestamp)}</p>
                              <p className="text-[10px] text-gray-500">{formatTime(log.timestamp)}</p>
                            </div>

                            {/* User */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                  <span className="text-xs font-bold text-purple-400">{log.username.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm text-white font-medium">{log.username}</span>
                              </div>
                            </div>

                            {/* Source IP */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300 font-mono">{log.src_ip}</span>
                                {suspicious && (
                                  <span className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded uppercase">Threat</span>
                                )}
                              </div>
                            </div>

                            {/* Destination */}
                            <div className="col-span-2">
                              <span className="text-sm text-gray-300">{log.dest_host}</span>
                            </div>

                            {/* Method */}
                            <div className="col-span-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.auth_method === 'MFA' ? 'bg-green-500/20 text-green-400' :
                                log.auth_method === 'SSH_KEY' ? 'bg-purple-500/20 text-purple-400' :
                                log.auth_method === 'PASSWORD' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {log.auth_method}
                              </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                                log.status === 'SUCCESS'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {log.status === 'SUCCESS' ? 'OK' : 'FAIL'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedLog(log); setShowDetailPanel(true); }}
                                className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                                        <div className="px-4 py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-300">No logs found</h3>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{Math.min((page - 1) * pageSize + 1, totalLogs)}</span> to{' '}
                    <span className="font-medium text-white">{Math.min(page * pageSize, totalLogs)}</span> of{' '}
                    <span className="font-medium text-white">{totalLogs}</span> logs
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(totalLogs / pageSize)) }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                            page === i + 1
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-[#1e293b] text-gray-400 hover:bg-[#334155] hover:text-white'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(Math.ceil(totalLogs / pageSize), p + 1))}
                      disabled={page >= Math.ceil(totalLogs / pageSize)}
                      className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Timeline View */
              <div className="p-6">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1e293b]"></div>
                  
                  <div className="space-y-6">
                    {filteredLogs.map((log, index) => {
                      const suspicious = isSuspiciousIP(log.src_ip);
                      return (
                        <div
                          key={log._id}
                          className={`relative pl-12 cursor-pointer group ${
                            selectedLog?._id === log._id ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                          }`}
                          onClick={() => { setSelectedLog(log); setShowDetailPanel(true); }}
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute left-2 top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            log.status === 'SUCCESS' 
                              ? 'bg-green-500/20 border-2 border-green-500' 
                              : 'bg-red-500/20 border-2 border-red-500'
                          }`}>
                            {log.status === 'SUCCESS' ? (
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>

                          {/* Timeline Content */}
                          <div className={`p-4 rounded-xl border transition-all ${
                            log.status === 'SUCCESS'
                              ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                              : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                          } ${suspicious ? 'ring-1 ring-orange-500/30' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-sm font-medium ${log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                                    {log.status === 'SUCCESS' ? 'Successful Login' : 'Failed Login Attempt'}
                                  </span>
                                  {suspicious && (
                                    <span className="px-1.5 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded uppercase">
                                      Suspicious IP
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium text-white">{log.username}</span>
                                  {' '}attempted to login to{' '}
                                  <span className="font-medium text-white">{log.dest_host}</span>
                                  {' '}from{' '}
                                  <span className="font-mono text-purple-400">{log.src_ip}</span>
                                  {' '}using{' '}
                                  <span className="text-cyan-400">{log.auth_method}</span>
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-gray-500">{formatRelativeTime(log.timestamp)}</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">{formatTime(log.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {showDetailPanel && selectedLog && (
          <div className="hidden lg:block w-1/3 bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden sticky top-24 max-h-[calc(100vh-120px)]">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Log Details</h3>
              <button
                onClick={() => setShowDetailPanel(false)}
                className="p-1 hover:bg-[#1e293b] rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase ${
                  selectedLog.status === 'SUCCESS'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedLog.status}
                </span>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  selectedLog.auth_method === 'MFA' ? 'bg-green-500/20 text-green-400' :
                  selectedLog.auth_method === 'SSH_KEY' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedLog.auth_method}
                </span>
                {isSuspiciousIP(selectedLog.src_ip) && (
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    ⚠ Threat IP
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">User Information</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{selectedLog.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedLog.username}</p>
                    <p className="text-xs text-gray-500">User Account</p>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Connection Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Source IP</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 font-mono">{selectedLog.src_ip}</span>
                      {isSuspiciousIP(selectedLog.src_ip) && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Destination Host</span>
                    <span className="text-sm text-gray-300">{selectedLog.dest_host}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Auth Method</span>
                    <span className="text-sm text-gray-300">{selectedLog.auth_method}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Timestamp</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Date & Time</span>
                    <span className="text-sm text-gray-300">{formatTime(selectedLog.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Relative</span>
                    <span className="text-sm text-gray-300">{formatRelativeTime(selectedLog.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Threat Assessment */}
              {isSuspiciousIP(selectedLog.src_ip) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-red-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Threat Assessment
                  </h4>
                  <p className="text-sm text-red-300/80 mb-3">
                    This IP address ({selectedLog.src_ip}) has been identified in our threat intelligence database as a known malicious source.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-400/60">Threat Level</span>
                      <span className="text-sm font-bold text-red-400">HIGH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-400/60">Category</span>
                      <span className="text-sm text-red-300">Brute Force / Credential Stuffing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-400/60">First Seen</span>
                      <span className="text-sm text-red-300">2025-11-01</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Activity */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Related Activity</h4>
                <div className="space-y-2">
                  {filteredLogs
                    .filter(l => l.username === selectedLog.username && l._id !== selectedLog._id)
                    .slice(0, 3)
                    .map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-[#1e293b]/30 rounded-lg cursor-pointer hover:bg-[#1e293b]/50 transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-xs text-gray-400">{log.dest_host}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{formatRelativeTime(log.timestamp)}</span>
                      </div>
                    ))}
                  {filteredLogs.filter(l => l.username === selectedLog.username && l._id !== selectedLog._id).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No related activity found</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
                  Investigate
                </button>
                <button className="p-2.5 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button className="p-2.5 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Generate demo auth logs for testing
function generateDemoAuthLogs(): AuthLog[] {
  const users = ['alice', 'bob', 'charlie', 'david', 'eva'];
  const hosts = ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5'];
  const authMethods = ['PASSWORD', 'SSH_KEY', 'MFA', 'OAUTH', 'CERTIFICATE'];
  const statuses: ('SUCCESS' | 'FAILURE')[] = ['SUCCESS', 'FAILURE'];
  
  // Mix of normal and suspicious IPs
  const normalIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '10.0.0.51', '172.16.0.10'];
  const suspiciousIPs = ['203.0.113.142', '203.0.113.196', '203.0.113.245', '203.0.113.189', '203.0.113.167'];

  const logs: AuthLog[] = [];

  for (let i = 0; i < 100; i++) {
    const isSuspicious = Math.random() < 0.35; // 35% chance of suspicious activity
    const status = isSuspicious ? (Math.random() < 0.8 ? 'FAILURE' : 'SUCCESS') : (Math.random() < 0.75 ? 'SUCCESS' : 'FAILURE');
    const srcIp = isSuspicious 
      ? suspiciousIPs[Math.floor(Math.random() * suspiciousIPs.length)]
      : normalIPs[Math.floor(Math.random() * normalIPs.length)];

    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    logs.push({
      _id: `auth-log-${i + 1}`,
      timestamp: timestamp.toISOString(),
      username: users[Math.floor(Math.random() * users.length)],
      src_ip: srcIp,
      dest_host: hosts[Math.floor(Math.random() * hosts.length)],
      status: status,
      auth_method: authMethods[Math.floor(Math.random() * authMethods.length)],
      risk_score: isSuspicious ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 4) + 1
    });
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return logs;
}

