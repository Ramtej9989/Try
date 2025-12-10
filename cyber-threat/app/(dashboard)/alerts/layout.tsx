'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AlertsLayoutProps {
  children: React.ReactNode;
}

export default function AlertsLayout({ children }: AlertsLayoutProps) {
  const pathname = usePathname();
  const [alertStats, setAlertStats] = useState({
    total: 337,
    critical: 12,
    high: 45,
    medium: 180,
    low: 100,
    new: 250,
    inProgress: 50,
    resolved: 30
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setAlertStats(prev => ({
          ...prev,
          total: prev.total + Math.floor(Math.random() * 3),
          new: prev.new + Math.floor(Math.random() * 2)
        }));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Alerts Header Section */}
      <div className="sticky top-0 z-20 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]">
        {/* Main Header */}
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Security Alerts
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Monitor and manage security incidents in real-time
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
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-[#151c2c] border-[#1e293b] text-gray-400'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </span>
                <span className="text-xs font-medium">{isLive ? 'Live' : 'Paused'}</span>
              </button>

              {/* Time Display */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-400 font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-xs font-medium">Export</span>
              </button>

              {/* Create Alert Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white text-xs font-medium transition-all shadow-lg shadow-blue-500/25">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-4 md:px-6 lg:px-8 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Total Alerts */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{alertStats.total}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
              </div>
            </div>

            {/* Critical */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-red-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedSeverity('CRITICAL')}>
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-red-400">{alertStats.critical}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{alertStats.critical}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Critical</p>
              </div>
            </div>

            {/* High */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-orange-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedSeverity('HIGH')}>
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">{alertStats.high}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-400">{alertStats.high}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">High</p>
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-yellow-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedSeverity('MEDIUM')}>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-400">{alertStats.medium}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{alertStats.medium}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Medium</p>
              </div>
            </div>

            {/* Low */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-green-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedSeverity('LOW')}>
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-400">{alertStats.low}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">{alertStats.low}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Low</p>
              </div>
            </div>

            {/* New */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedStatus('NEW')}>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-cyan-400">{alertStats.new}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">New</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-purple-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedStatus('IN_PROGRESS')}>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">{alertStats.inProgress}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Progress</p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#151c2c]/80 backdrop-blur rounded-xl border border-[#1e293b] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedStatus('RESOLVED')}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{alertStats.resolved}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters Bar */}
        <div className="px-4 md:px-6 lg:px-8 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filters */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSelectedSeverity(severity)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedSeverity === severity
                      ? severity === 'ALL' ? 'bg-blue-500/20 text-blue-400' :
                        severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {severity === 'ALL' ? 'All' : severity.charAt(0) + severity.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedStatus === status
                      ? status === 'ALL' ? 'bg-blue-500/20 text-blue-400' :
                        status === 'NEW' ? 'bg-cyan-500/20 text-cyan-400' :
                        status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              {['1h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedTimeRange === range
                      ? 'bg-[#1e293b] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 pl-10 pr-4 py-2 bg-[#151c2c] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              <button className="p-1.5 rounded-md bg-[#1e293b] text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1e293b] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Refresh Button */}
            <button className="p-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 md:px-6 lg:px-8 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-gray-500 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-blue-400 font-medium">Security Alerts</span>
            {selectedSeverity !== 'ALL' && (
              <>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className={`font-medium ${
                  selectedSeverity === 'CRITICAL' ? 'text-red-400' :
                  selectedSeverity === 'HIGH' ? 'text-orange-400' :
                  selectedSeverity === 'MEDIUM' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {selectedSeverity.charAt(0) + selectedSeverity.slice(1).toLowerCase()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        {children}
      </div>

      {/* Floating Quick Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-30">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
