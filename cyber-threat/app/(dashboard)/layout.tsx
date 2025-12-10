'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarMobileOpen(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
      // Cmd/Ctrl + B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">CyberShield</h2>
          <p className="text-gray-400 text-sm">Loading security platform...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Navigation items
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      description: 'Overview & Analytics',
    },
    {
      path: '/alerts',
      label: 'Security Alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: '12',
      badgeColor: 'red',
      description: 'Active Incidents',
    },
    {
      header: 'Analytics',
      items: [
        {
          path: '/logs/network',
          label: 'Network Logs',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          ),
          description: 'Traffic Analysis',
        },
        {
          path: '/logs/auth',
          label: 'Auth Logs',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          description: 'Login Activity',
        },
      ],
    },
    {
      path: '/entities',
      label: 'Entity Risk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Risk Scoring',
    },
    {
      path: '/threat-intel',
      label: 'Threat Intel',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badge: '50',
      badgeColor: 'blue',
      description: 'IOC Database',
    },
    {
      header: 'Administration',
      adminOnly: true,
      items: [
        {
          path: '/upload',
          label: 'Upload Data',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          ),
          description: 'Import Security Data',
          adminOnly: true,
        },
        {
          path: '/settings',
          label: 'Settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          description: 'System Configuration',
          adminOnly: true,
        },
      ],
    },
  ];

  // Sample notifications
  const sampleNotifications = [
    { id: 1, title: 'Critical Alert', message: 'Attack traffic detected from 203.0.113.142', time: '2m ago', type: 'critical' },
    { id: 2, title: 'New Threat Intel', message: '5 new IOCs added to database', time: '15m ago', type: 'info' },
    { id: 3, title: 'System Update', message: 'Detection rules updated successfully', time: '1h ago', type: 'success' },
  ];

  // Check if path is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  // Get notification type color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#111827] border-r border-[#1e293b] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e293b]">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#111827] rounded-full"></span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white truncate">CyberShield</h1>
              <p className="text-[10px] text-gray-500 truncate">SOC Analytics Platform v1.0</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Stats (when expanded) */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-[#1e293b]">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-red-500/10 rounded-lg">
                <p className="text-lg font-bold text-red-400">12</p>
                <p className="text-[9px] text-gray-500 uppercase">Critical</p>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                <p className="text-lg font-bold text-yellow-400">45</p>
                <p className="text-[9px] text-gray-500 uppercase">High</p>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                <p className="text-lg font-bold text-green-400">89%</p>
                <p className="text-[9px] text-gray-500 uppercase">Health</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              // Handle section headers
              if ('header' in item && item.items) {
                // Skip admin sections for non-admin users
                if (item.adminOnly && session?.user?.role !== 'ADMIN') {
                  return null;
                }
                return (
                  <li key={index} className="pt-5 pb-2">
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-2 px-3 mb-2">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          {item.header}
                        </span>
                        <div className="flex-1 h-px bg-[#1e293b]"></div>
                      </div>
                    )}
                    {sidebarCollapsed && (
                      <div className="w-full h-px bg-[#1e293b] my-2"></div>
                    )}
                    <ul className="space-y-1">
                      {item.items.map((subItem: any, subIndex: number) => {
                        if (subItem.adminOnly && session?.user?.role !== 'ADMIN') {
                          return null;
                        }
                        return (
                          <li key={`${index}-${subIndex}`}>
                            <Link
                              href={subItem.path}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                                isActive(subItem.path)
                                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/5'
                                  : 'text-gray-400 hover:text-white hover:bg-[#1e293b]/70'
                              } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                              title={sidebarCollapsed ? subItem.label : ''}
                            >
                              {/* Active indicator */}
                              {isActive(subItem.path) && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></span>
                              )}
                              <span className={`flex-shrink-0 transition-colors ${isActive(subItem.path) ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`}>
                                {subItem.icon}
                              </span>
                              {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                  <span className="block truncate">{subItem.label}</span>
                                  {subItem.description && (
                                    <span className="block text-[10px] text-gray-500 truncate">{subItem.description}</span>
                                  )}
                                </div>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              // Handle regular nav items
              if ('path' in item) {
                if (item.adminOnly && session?.user?.role !== 'ADMIN') {
                  return null;
                }
                return (
                  <li key={index}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/5'
                          : 'text-gray-400 hover:text-white hover:bg-[#1e293b]/70'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      {/* Active indicator */}
                      {isActive(item.path) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></span>
                      )}
                      <span className={`flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{item.label}</span>
                            {item.description && (
                              <span className="block text-[10px] text-gray-500 truncate">{item.description}</span>
                            )}
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              item.badgeColor === 'red' ? 'bg-red-500/20 text-red-400' :
                              item.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </nav>

        {/* Help Section */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-[#1e293b]">
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Need Help?</p>
                  <p className="text-[10px] text-gray-500">View documentation</p>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                View Docs
              </button>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-3 border-t border-[#1e293b]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#1e293b] transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <span className="text-sm font-bold text-white">
                    {session?.user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111827] rounded-full"></span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{session?.user?.email || 'admin@example.com'}</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className={`absolute ${sidebarCollapsed ? 'left-full ml-2 bottom-0' : 'bottom-full left-0 right-0 mb-2'} py-2 bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl z-50 min-w-[200px]`}>
                <div className="px-4 py-2 border-b border-[#334155]">
                  <p className="text-sm font-medium text-white">{session?.user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email || 'admin@example.com'}</p>
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded-full">
                    {session?.user?.role || 'ADMIN'}
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#334155] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#334155] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#334155] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Help & Support</span>
                  </Link>
                </div>
                <div className="border-t border-[#334155] pt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#334155] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platform Version */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-t border-[#1e293b] bg-[#0f1419]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-600">© 2025 CyberShield</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <p className="text-[10px] text-gray-600">v1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search alerts, entities, logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-80 lg:w-96 pl-10 pr-20 py-2.5 bg-[#151c2c] border border-[#1e293b] rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-[#0a0e17] border border-[#334155] rounded text-gray-500 font-mono">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-[#0a0e17] border border-[#334155] rounded text-gray-500 font-mono">K</kbd>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="md:hidden p-2 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Time Display */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-right">
                  <span className="text-xs text-white font-mono font-semibold">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#334155] flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Notifications</h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {sampleNotifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-[#334155] transition-colors cursor-pointer border-b border-[#334155]/50 last:border-0">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{notification.message}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-[#334155] bg-[#151c2c]">
                      <Link href="/notifications" className="block text-center text-xs text-blue-400 hover:text-blue-300">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Alert</span>
              </button>

              {/* User Avatar (Mobile) */}
              <button
                onClick={() => setSidebarMobileOpen(true)}
                className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
              >
                <span className="text-sm font-bold text-white">
                  {session?.user?.name?.charAt(0) || 'A'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0e17]">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#334155]">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search alerts, entities, logs, threat intel..."
                autoFocus
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              <kbd className="px-2 py-1 text-xs bg-[#0a0e17] border border-[#334155] rounded text-gray-500">ESC</kbd>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-3 p-3 bg-[#151c2c] hover:bg-[#0a0e17] rounded-lg transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white">View Critical Alerts</p>
                    <p className="text-[10px] text-gray-500">12 unresolved</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-3 bg-[#151c2c] hover:bg-[#0a0e17] rounded-lg transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white">Threat Intelligence</p>
                    <p className="text-[10px] text-gray-500">50 indicators</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-3 bg-[#151c2c] hover:bg-[#0a0e17] rounded-lg transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white">High Risk Entities</p>
                    <p className="text-[10px] text-gray-500">5 entities</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-3 bg-[#151c2c] hover:bg-[#0a0e17] rounded-lg transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white">View Dashboard</p>
                    <p className="text-[10px] text-gray-500">Analytics overview</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-[#334155] bg-[#151c2c] flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-[#0a0e17] border border-[#334155] rounded">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-[#0a0e17] border border-[#334155] rounded">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-[#0a0e17] border border-[#334155] rounded">↵</kbd>
                  Select
                </span>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
