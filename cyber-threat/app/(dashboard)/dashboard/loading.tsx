'use client';

import { useEffect, useState } from 'react';

export default function DashboardLoading() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing security platform...');

  const loadingMessages = [
    'Initializing security platform...',
    'Connecting to threat intelligence feeds...',
    'Loading security alerts...',
    'Analyzing entity risk scores...',
    'Fetching network logs...',
    'Processing authentication data...',
    'Building dashboard visualizations...',
    'Almost ready...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messageIndex = Math.min(
      Math.floor((loadingProgress / 100) * loadingMessages.length),
      loadingMessages.length - 1
    );
    setLoadingText(loadingMessages[messageIndex]);
  }, [loadingProgress]);

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
            <div>
              <div className="h-8 w-48 bg-[#1e293b] rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-[#1e293b]/50 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Actions Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-[#1e293b] rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-[#1e293b] rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Progress Section */}
      <div className="flex flex-col items-center justify-center py-16 mb-8">
        {/* Animated Logo/Spinner */}
        <div className="relative w-32 h-32 mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#1e293b]"></div>
          
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
          
          {/* Middle ring */}
          <div className="absolute inset-3 rounded-full border-4 border-[#1e293b]"></div>
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Inner ring */}
          <div className="absolute inset-6 rounded-full border-4 border-[#1e293b]"></div>
          <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          
          {/* Center icon */}
          <div className="absolute inset-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-bold text-white mb-2">CyberShield</h2>
        <p className="text-sm text-gray-400 mb-6 h-5 transition-all duration-300">{loadingText}</p>

        {/* Progress Bar */}
        <div className="w-80 max-w-full">
          <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Loading dashboard...</span>
            <span>{Math.round(Math.min(loadingProgress, 100))}%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-4 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e293b]"></div>
              <div className="w-12 h-4 bg-[#1e293b]/50 rounded"></div>
            </div>
            <div className="h-7 w-16 bg-[#1e293b] rounded mb-1"></div>
            <div className="h-3 w-20 bg-[#1e293b]/50 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1 */}
        <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-32 bg-[#1e293b] rounded mb-2"></div>
              <div className="h-3 w-24 bg-[#1e293b]/50 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[#1e293b]/50 rounded"></div>
              <div className="h-6 w-16 bg-[#1e293b]/50 rounded"></div>
            </div>
          </div>
          <div className="h-64 bg-[#0a0e17] rounded-lg flex items-end justify-around px-4 pb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i}
                className="w-8 bg-gradient-to-t from-blue-500/30 to-purple-500/30 rounded-t animate-pulse"
                style={{ 
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 100}ms`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-36 bg-[#1e293b] rounded mb-2"></div>
              <div className="h-3 w-28 bg-[#1e293b]/50 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-[#1e293b] rounded"></div>
          </div>
          <div className="h-64 bg-[#0a0e17] rounded-lg flex items-center justify-center">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full border-[20px] border-[#1e293b]"></div>
              <div className="absolute inset-0 rounded-full border-[20px] border-transparent border-t-red-500/50 border-r-orange-500/50 animate-pulse"></div>
              <div className="absolute inset-8 rounded-full bg-[#0a0e17] flex items-center justify-center">
                <div className="h-6 w-12 bg-[#1e293b] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Threat Intel Summary */}
        <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-6 animate-pulse">
          <div className="h-5 w-40 bg-[#1e293b] rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[#1e293b]"></div>
                <div className="flex-1">
                  <div className="h-3 w-16 bg-[#1e293b] rounded mb-2"></div>
                  <div className="h-1.5 w-full bg-[#1e293b] rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-6 animate-pulse">
          <div className="h-5 w-36 bg-[#1e293b] rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-[#1e293b] mt-1"></div>
                <div className="flex-1">
                  <div className="h-3 w-full bg-[#1e293b] rounded mb-2"></div>
                  <div className="h-2 w-20 bg-[#1e293b]/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 bg-[#1e293b] rounded"></div>
            <div className="h-4 w-16 bg-[#1e293b]/50 rounded"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#1e293b]"></div>
                <div className="flex-1">
                  <div className="h-3 w-full bg-[#1e293b] rounded mb-1"></div>
                  <div className="h-2 w-16 bg-[#1e293b]/50 rounded"></div>
                </div>
                <div className="w-16 h-5 bg-[#1e293b] rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#151c2c]/80 backdrop-blur border border-[#1e293b] rounded-xl overflow-hidden animate-pulse">
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="h-5 w-40 bg-[#1e293b] rounded"></div>
          <div className="h-4 w-28 bg-[#1e293b]/50 rounded"></div>
        </div>
        
        {/* Table Header */}
        <div className="px-6 py-3 bg-[#0f1419] border-b border-[#1e293b] grid grid-cols-5 gap-4">
          {['Entity', 'Type', 'Risk Score', 'Trend', 'Risk Factor'].map((_, i) => (
            <div key={i} className="h-3 w-20 bg-[#1e293b]/50 rounded"></div>
          ))}
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-[#1e293b]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-5 gap-4 items-center" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-4 w-24 bg-[#1e293b] rounded"></div>
              <div className="h-6 w-16 bg-[#1e293b] rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-[#1e293b] rounded-full"></div>
                <div className="h-4 w-8 bg-[#1e293b] rounded"></div>
              </div>
              <div className="h-4 w-16 bg-[#1e293b]/50 rounded"></div>
              <div className="h-4 w-full bg-[#1e293b]/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed bottom-6 left-6 hidden lg:flex items-center gap-2 px-4 py-2 bg-[#151c2c]/80 backdrop-blur rounded-lg border border-[#1e293b]">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-xs text-gray-500">Loading security modules...</span>
      </div>

      {/* Corner Decorations */}
      <div className="fixed top-20 right-8 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
