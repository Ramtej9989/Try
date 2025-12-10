'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [notifications, setNotifications] = useState(3);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // System metrics
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 42,
    memoryUsage: 68,
    networkLatency: 12,
    activeConnections: 1247,
    eventsPerSecond: 856,
    threatsBlocked: 23
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live metric updates
  useEffect(() => {
    if (isLive) {
      const metricsInterval = setInterval(() => {
        setSystemMetrics(prev => ({
          cpuUsage: Math.min(100, Math.max(20, prev.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.min(100, Math.max(40, prev.memoryUsage + (Math.random() - 0.5) * 5)),
          networkLatency: Math.min(100, Math.max(5, prev.networkLatency + (Math.random() - 0.5) * 4)),
          activeConnections: Math.max(1000, prev.activeConnections + Math.floor((Math.random() - 0.5) * 50)),
          eventsPerSecond: Math.max(500, prev.eventsPerSecond + Math.floor((Math.random() - 0.5) * 100)),
          threatsBlocked: prev.threatsBlocked + (Math.random() > 0.8 ? 1 : 0)
        }));
        setLastUpdated(new Date());
      }, 5000);
      return () => clearInterval(metricsInterval);
    }
  }, [isLive]);

  // Update system status based on metrics
  useEffect(() => {
    if (systemMetrics.cpuUsage > 90 || systemMetrics.memoryUsage > 90) {
      setSystemStatus('critical');
    } else if (systemMetrics.cpuUsage > 70 || systemMetrics.memoryUsage > 80) {
      setSystemStatus('warning');
    } else {
      setSystemStatus('healthy');
    }
  }, [systemMetrics]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'healthy': return { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' };
      case 'warning': return { bg: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
    }
  };

  const statusColors = getStatusColor();

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Top Status Bar */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]">
        {/* Main Header */}
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              {/* Dashboard Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse-slow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                {/* Notification Badge */}
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {notifications}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Security Dashboard
                  </h1>
                  {/* System Status Badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusColors.bg}/20 border ${statusColors.bg}/30`}>
                    <span className={`relative flex h-2 w-2`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColors.bg} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColors.bg}`}></span>
                    </span>
                    <span className={`text-xs font-medium ${statusColors.text} capitalize`}>
                      {systemStatus}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Real-time threat intelligence and security analytics platform
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Live Toggle */}
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isLive 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
                    : 'bg-[#151c2c] border-[#1e293b] text-gray-400 hover:bg-[#1e293b]'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </span>
                <span className="text-xs font-medium">{isLive ? 'Live Mode' : 'Paused'}</span>
              </button>

              {/* Time Display */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-right">
                  <span className="text-sm text-white font-mono font-bold">
                    {currentTime.toLocaleTimeString()}
                  </span>
                  <p className="text-[10px] text-gray-500">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <button 
                onClick={toggleFullscreen}
                className="hidden lg:flex items-center justify-center p-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all duration-200"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Metrics Bar */}
        <div className="px-4 md:px-6 lg:px-8 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* CPU Usage */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-all duration-300 group">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="#1e293b"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke={systemMetrics.cpuUsage > 80 ? '#ef4444' : systemMetrics.cpuUsage > 60 ? '#f59e0b' : '#3b82f6'}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${systemMetrics.cpuUsage} 100`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {Math.round(systemMetrics.cpuUsage)}%
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">CPU</p>
                <p className={`text-sm font-semibold ${systemMetrics.cpuUsage > 80 ? 'text-red-400' : systemMetrics.cpuUsage > 60 ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {Math.round(systemMetrics.cpuUsage)}%
                </p>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-purple-500/30 transition-all duration-300">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="#1e293b" strokeWidth="4" fill="none" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke={systemMetrics.memoryUsage > 85 ? '#ef4444' : systemMetrics.memoryUsage > 70 ? '#f59e0b' : '#8b5cf6'}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${systemMetrics.memoryUsage} 100`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {Math.round(systemMetrics.memoryUsage)}%
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Memory</p>
                <p className={`text-sm font-semibold ${systemMetrics.memoryUsage > 85 ? 'text-red-400' : systemMetrics.memoryUsage > 70 ? 'text-yellow-400' : 'text-purple-400'}`}>
                  {Math.round(systemMetrics.memoryUsage)}%
                </p>
              </div>
            </div>

            {/* Network Latency */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Latency</p>
                <p className={`text-sm font-semibold ${systemMetrics.networkLatency > 50 ? 'text-red-400' : systemMetrics.networkLatency > 30 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {Math.round(systemMetrics.networkLatency)}ms
                </p>
              </div>
            </div>

            {/* Active Connections */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-green-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Connections</p>
                <p className="text-sm font-semibold text-green-400">
                  {systemMetrics.activeConnections.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Events Per Second */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-orange-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Events/s</p>
                <p className="text-sm font-semibold text-orange-400">
                  {systemMetrics.eventsPerSecond.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Threats Blocked */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-red-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Blocked</p>
                <p className="text-sm font-semibold text-red-400">
                  {systemMetrics.threatsBlocked}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation / Breadcrumb */}
        <div className="px-4 md:px-6 lg:px-8 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Home</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-blue-400 font-medium">Dashboard</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#151c2c] hover:bg-[#1e293b] text-gray-400 hover:text-white rounded-lg border border-[#1e293b] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export Report
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#151c2c] hover:bg-[#1e293b] text-gray-400 hover:text-white rounded-lg border border-[#1e293b] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Widget
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#151c2c] hover:bg-[#1e293b] text-gray-400 hover:text-white rounded-lg border border-[#1e293b] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Last Updated Indicator */}
        <div className="px-4 md:px-6 lg:px-8 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            {isLive && (
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Auto-refresh enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        {children}
      </div>

      {/* Quick Access Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 bg-[#0a0e17]/95 backdrop-blur-xl border-t border-[#1e293b] px-4 py-2">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-[10px] font-medium">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-[10px] font-medium">Intel</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-6 left-6 hidden lg:flex items-center gap-2 px-3 py-2 bg-[#151c2c]/80 backdrop-blur rounded-lg border border-[#1e293b] text-xs text-gray-500">
        <kbd className="px-1.5 py-0.5 bg-[#0a0e17] rounded text-gray-400 font-mono">Ctrl</kbd>
        <span>+</span>
        <kbd className="px-1.5 py-0.5 bg-[#0a0e17] rounded text-gray-400 font-mono">D</kbd>
        <span className="ml-1">Dashboard shortcuts</span>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-200 group">
          <svg className="w-6 h-6 group-hover:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg className="w-6 h-6 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
