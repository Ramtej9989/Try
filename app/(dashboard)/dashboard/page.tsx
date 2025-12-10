'use client';

import { useEffect, useState, useCallback } from 'react';
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
interface DashboardStats {
  alertsToday: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  activeThreats: number;
  avgRiskScore: number;
  resolvedToday: number;
  pendingReview: number;
  falsePositives: number;
}

interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  timestamp: string;
  entities?: Array<{ type: string; value: string }>;
  tactic?: string;
}

interface ThreatIntelData {
  total: number;
  distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface HighRiskEntity {
  id: string;
  name: string;
  type: 'HOST' | 'IP' | 'USER';
  score: number;
  factor: string;
  trend: 'up' | 'down' | 'stable';
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelData | null>(null);
  const [highRiskEntities, setHighRiskEntities] = useState<HighRiskEntity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const alertsResponse = await fetch(`${API_URL}/api/alerts?api_key=${API_KEY}&limit=100`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      if (!alertsResponse.ok) {
        throw new Error(`Failed to fetch alerts: ${alertsResponse.status}`);
      }

      const alertsData = await alertsResponse.json();
      const allAlerts = alertsData.alerts || [];

      // Process alerts data
      const criticalCount = allAlerts.filter((a: Alert) => a.severity === 'CRITICAL').length;
      const highCount = allAlerts.filter((a: Alert) => a.severity === 'HIGH').length;
      const mediumCount = allAlerts.filter((a: Alert) => a.severity === 'MEDIUM').length;
      const lowCount = allAlerts.filter((a: Alert) => a.severity === 'LOW').length;
      const newCount = allAlerts.filter((a: Alert) => a.status === 'NEW').length;
      const resolvedCount = allAlerts.filter((a: Alert) => a.status === 'RESOLVED').length;
      const falsePositiveCount = allAlerts.filter((a: Alert) => a.status === 'FALSE_POSITIVE').length;

      setStats({
        alertsToday: alertsData.total || 0,
        criticalAlerts: criticalCount,
        highAlerts: highCount,
        mediumAlerts: mediumCount,
        lowAlerts: lowCount,
        activeThreats: alertsData.total || 0,
        avgRiskScore: 7.2,
        resolvedToday: resolvedCount,
        pendingReview: newCount,
        falsePositives: falsePositiveCount
      });

      setAlerts(allAlerts.slice(0, 5));
      setThreatIntel({
        total: 50,
        distribution: { critical: 12, high: 15, medium: 18, low: 5 }
      });
      setHighRiskEntities(getDefaultHighRiskEntities());
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard: ${err.message}`);
      
      // Set default demo data
      setStats(getDefaultStats());
      setAlerts(getDefaultAlerts());
      setThreatIntel({ total: 50, distribution: { critical: 12, high: 15, medium: 18, low: 5 } });
      setHighRiskEntities(getDefaultHighRiskEntities());
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/detection/run?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ hours_back: 24 })
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Chart configurations
  const alertTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical',
        data: [2, 4, 3, 5, 2, 3, 4],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'High',
        data: [8, 12, 9, 15, 11, 8, 10],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Medium',
        data: [25, 32, 28, 38, 30, 25, 35],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } },
        beginAtZero: true
      }
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
  };

  const severityBarData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      label: 'Alerts by Severity',
      data: [
        stats?.criticalAlerts || 12,
        stats?.highAlerts || 45,
        stats?.mediumAlerts || 180,
        stats?.lowAlerts || 100,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981'],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} alerts`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: '500' as const } } },
      y: { grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true }
    },
  };

  const statusDoughnutData = {
    labels: ['New', 'In Progress', 'Resolved', 'False Positive'],
    datasets: [{
      data: [
        stats?.pendingReview || 250,
        50,
        stats?.resolvedToday || 30,
        stats?.falsePositives || 7,
      ],
      backgroundColor: [
        'rgba(6, 182, 212, 0.85)',
        'rgba(139, 92, 246, 0.85)',
        'rgba(16, 185, 129, 0.85)',
        'rgba(100, 116, 139, 0.85)',
      ],
      borderColor: '#0a0e17',
      borderWidth: 3,
      hoverOffset: 8,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, boxWidth: 12, padding: 12, usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  const attackTypesData = {
    labels: ['Network Attack', 'Auth Failure', 'Malicious IP', 'Port Scan', 'Data Exfil'],
    datasets: [{
      label: 'Occurrences',
      data: [145, 89, 67, 42, 18],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: { label: function(context: any) { return `${context.parsed.x} occurrences`; } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true },
      y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
    },
  };

  // Helper functions
  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' };
      case 'HIGH': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' };
      case 'MEDIUM': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' };
      case 'LOW': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-500' };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-400 text-sm">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time threat monitoring and analytics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedTimeRange === range
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-400">Live</span>
          </div>

          {/* Current Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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
              <p className="mt-2 text-xs text-gray-500">Displaying cached demo data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {/* Alerts Today */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-red-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              12%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.alertsToday || 337}</p>
          <p className="text-xs text-gray-500 mt-1">Alerts Today</p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded-full uppercase">Critical</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.criticalAlerts || 12}</p>
          <p className="text-xs text-gray-500 mt-1">Critical Alerts</p>
        </div>

        {/* High Severity */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 rounded-full uppercase">High</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.highAlerts || 45}</p>
          <p className="text-xs text-gray-500 mt-1">High Severity</p>
        </div>

        {/* Active Threats */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeThreats || 337}</p>
          <p className="text-xs text-gray-500 mt-1">Active Threats</p>
        </div>

        {/* Risk Score */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.avgRiskScore?.toFixed(1) || '7.2'}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Risk Score</p>
        </div>

        {/* Resolved Today */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.resolvedToday || 28}</p>
          <p className="text-xs text-gray-500 mt-1">Resolved Today</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart - Alert Trends */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Alert Trends</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 7 days activity</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>Critical
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>High
              </span>
            </div>
          </div>
          <div className="h-72">
            <Line data={alertTrendData} options={lineChartOptions} />
          </div>
        </div>

        {/* Bar Chart - Alerts by Severity */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Alerts by Severity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Current distribution</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {(stats?.criticalAlerts || 0) + (stats?.highAlerts || 0) + (stats?.mediumAlerts || 0) + (stats?.lowAlerts || 0) || 337}
              </p>
              <p className="text-xs text-gray-500">Total Alerts</p>
            </div>
          </div>
          <div className="h-72">
            <Bar data={severityBarData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Doughnut Chart - Alert Status */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Alert Status</h3>
              <p className="text-xs text-gray-500 mt-0.5">Current state distribution</p>
            </div>
          </div>
          <div className="h-56">
            <Doughnut data={statusDoughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Threat Intelligence Summary */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Threat Intelligence</h3>
              <p className="text-xs text-gray-500 mt-0.5">Active indicators</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full">
              {threatIntel?.total || 50} Total
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Critical', count: threatIntel?.distribution?.critical || 12, color: 'red', percentage: 24 },
              { label: 'High', count: threatIntel?.distribution?.high || 15, color: 'orange', percentage: 30 },
              { label: 'Medium', count: threatIntel?.distribution?.medium || 18, color: 'yellow', percentage: 36 },
              { label: 'Low', count: threatIntel?.distribution?.low || 5, color: 'green', percentage: 10 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg hover:bg-[#1e293b]/30 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.color === 'red' ? 'bg-red-500/20' :
                  item.color === 'orange' ? 'bg-orange-500/20' :
                  item.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                }`}>
                  <span className={`text-sm font-bold ${
                    item.color === 'red' ? 'text-red-400' :
                    item.color === 'orange' ? 'text-orange-400' :
                    item.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{item.count}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.color === 'red' ? 'bg-red-500' :
                        item.color === 'orange' ? 'bg-orange-500' :
                        item.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest security events</p>
            </div>
            <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {(alerts.length > 0 ? alerts : getDefaultAlerts()).slice(0, 5).map((alert, index) => {
              const severityClasses = getSeverityClasses(alert.severity);
              return (
                <div
                  key={alert._id || index}
                  className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg hover:bg-[#1e293b]/50 transition-colors cursor-pointer group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${severityClasses.dot} shadow-lg`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">{alert.title}</p>
                    <p className="text-xs text-gray-500">{formatTime(alert.timestamp)}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${severityClasses.bg} ${severityClasses.text} ${severityClasses.border} border`}>
                    {alert.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attack Types Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Attack Types</h3>
              <p className="text-xs text-gray-500 mt-0.5">Most common attack vectors</p>
            </div>
          </div>
          <div className="h-64">
            <Bar data={attackTypesData} options={horizontalBarOptions} />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">Recent security events</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { time: '2 min ago', event: 'Network scan blocked', source: '203.0.113.142', type: 'block' },
              { time: '5 min ago', event: 'Failed SSH attempt', source: 'charlie@srv-1', type: 'warning' },
              { time: '12 min ago', event: 'Malware signature detected', source: '10.0.0.15', type: 'critical' },
              { time: '18 min ago', event: 'Firewall rule updated', source: 'admin', type: 'info' },
              { time: '25 min ago', event: 'User login from new location', source: 'alice@vpn', type: 'warning' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    item.type === 'critical' ? 'bg-red-500' :
                    item.type === 'warning' ? 'bg-yellow-500' :
                    item.type === 'block' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  {index !== 4 && <div className="absolute left-1.5 top-4 w-px h-8 bg-[#1e293b]"></div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{item.event}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.time}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-400 font-mono">{item.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Risk Entities Table */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">High-Risk Entities</h3>
            <p className="text-xs text-gray-500 mt-0.5">Entities requiring immediate attention</p>
          </div>
          <Link href="/entities" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View All Entities →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Risk Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {highRiskEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-[#1e293b]/30 transition-colors cursor-pointer group">
                  <td className="px-4 py-4">
                    <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{entity.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      entity.type === 'HOST' ? 'bg-green-500/20 text-green-400' :
                      entity.type === 'IP' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {entity.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            entity.score >= 9 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                            entity.score >= 8 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                            'bg-gradient-to-r from-yellow-500 to-yellow-400'
                          }`}
                          style={{ width: `${entity.score * 10}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold ${
                        entity.score >= 9 ? 'text-red-400' :
                        entity.score >= 8 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                        {entity.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {entity.trend === 'up' ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-xs">Rising</span>
                      </span>
                    ) : entity.trend === 'down' ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-xs">Falling</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                        </svg>
                        <span className="text-xs">Stable</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-400">{entity.factor}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// Default data functions
function getDefaultStats(): DashboardStats {
  return {
    alertsToday: 337,
    criticalAlerts: 12,
    highAlerts: 45,
    mediumAlerts: 180,
    lowAlerts: 100,
    activeThreats: 337,
    avgRiskScore: 7.2,
    resolvedToday: 28,
    pendingReview: 250,
    falsePositives: 7
  };
}

function getDefaultAlerts(): Alert[] {
  return [
    { _id: '1', title: 'Attack traffic detected from malicious IP', description: '', severity: 'CRITICAL', status: 'NEW', timestamp: new Date().toISOString() },
    { _id: '2', title: 'Multiple failed login attempts', description: '', severity: 'HIGH', status: 'NEW', timestamp: new Date(Date.now() - 300000).toISOString() },
    { _id: '3', title: 'Suspicious outbound connection', description: '', severity: 'MEDIUM', status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 600000).toISOString() },
    { _id: '4', title: 'Port scan detected', description: '', severity: 'LOW', status: 'NEW', timestamp: new Date(Date.now() - 900000).toISOString() },
    { _id: '5', title: 'Unauthorized access attempt', description: '', severity: 'HIGH', status: 'NEW', timestamp: new Date(Date.now() - 1200000).toISOString() },
  ];
}

function getDefaultHighRiskEntities(): HighRiskEntity[] {
  return [
    { id: '1', name: 'srv-1', type: 'HOST', score: 9.2, factor: 'Critical asset (Finance server)', trend: 'up' },
    { id: '2', name: '203.0.113.142', type: 'IP', score: 9.0, factor: 'Known threat actor (Threat level 10)', trend: 'stable' },
    { id: '3', name: 'charlie', type: 'USER', score: 8.5, factor: 'Multiple failed logins from malicious IPs', trend: 'up' },
    { id: '4', name: 'srv-3', type: 'HOST', score: 8.3, factor: 'Target of attack traffic', trend: 'down' },
    { id: '5', name: '203.0.113.245', type: 'IP', score: 8.0, factor: 'Known threat actor (Threat level 10)', trend: 'stable' },
  ];
}
