'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TopNav() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [alertCount, setAlertCount] = useState<number | null>(null);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch alert count
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const response = await fetch('/api/alerts?status=NEW');
        const data = await response.json();
        setAlertCount(data.total || 0);
      } catch (error) {
        console.error('Error fetching alert count:', error);
      }
    };
    
    fetchAlertCount();
    
    // Set up periodic refresh of alert count
    const interval = setInterval(fetchAlertCount, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center">
        <div className="font-medium text-gray-700 mr-8 hidden md:block">
          Enterprise Cyber Threat Intelligence
        </div>
        
        <div className="text-sm text-gray-500 hidden md:block">
          {currentDateTime}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Alert indicator */}
        {alertCount !== null && alertCount > 0 && (
          <Link href="/alerts" className="relative flex items-center">
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </Link>
        )}
        
        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-medium">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-700">{session?.user?.name}</div>
              <div className="text-xs text-gray-500">{session?.user?.role}</div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
