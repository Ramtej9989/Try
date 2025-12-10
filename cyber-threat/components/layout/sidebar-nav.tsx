'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface SidebarNavProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

export default function SidebarNav({ collapsed, toggleCollapse }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      path: '/alerts', 
      label: 'Security Alerts', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: '12'
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
          )
        },
        { 
          path: '/logs/auth', 
          label: 'Auth Logs', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )
        },
      ]
    },
    { 
      path: '/entities', 
      label: 'Entity Risk', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      path: '/threat-intel', 
      label: 'Threat Intel', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      adminOnly: true
    },
    { 
      path: '/upload', 
      label: 'Upload Data', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      adminOnly: true
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
      adminOnly: true
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    return path !== '/dashboard' && pathname?.startsWith(path);
  };

  return (
    <div className={`h-screen bg-dark-secondary border-r border-[#1e293b] flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-blue">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-white text-sm">CyberShield</h1>
              <p className="text-[10px] text-gray-500">SOC Analytics</p>
            </div>
          )}
          <button 
            onClick={toggleCollapse}
            className="ml-auto p-1.5 rounded-lg hover:bg-dark-hover text-gray-400 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            if ('header' in item && item.items) {
              return (
                <li key={index} className="pt-4 pb-2">
                  {!collapsed && (
                    <span className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {item.header}
                    </span>
                  )}
                  <ul className="mt-2 space-y-1">
                    {item.items.map((subItem, subIndex) => {
                      if (subItem.adminOnly && session?.user?.role !== 'ADMIN') return null;
                      return (
                        <li key={`${index}-${subIndex}`}>
                          <Link
                            href={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-2 border-blue-500'
                                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                            } ${collapsed ? 'justify-center' : ''}`}
                          >
                            {subItem.icon}
                            {!collapsed && <span>{subItem.label}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            } else if ('path' in item) {
              if (item.adminOnly && session?.user?.role !== 'ADMIN') return null;
              return (
                <li key={index}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-2 border-blue-500'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-[#1e293b]">
        <div 
          className="relative"
          onMouseEnter={() => setShowUserMenu(true)}
          onMouseLeave={() => setShowUserMenu(false)}
        >
          <button className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-hover transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {session?.user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.role || 'ADMIN'}</p>
              </div>
            )}
          </button>
          
          {/* User Menu Dropdown */}
          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-dark-card border border-[#1e293b] rounded-lg shadow-xl">
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-hover">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-hover"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
