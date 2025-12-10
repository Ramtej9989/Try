'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import SidebarNav from './sidebar-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-primary">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-primary overflow-hidden">
      <SidebarNav collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
