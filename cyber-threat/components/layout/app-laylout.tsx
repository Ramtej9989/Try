import SidebarNav from './sidebar-nav';
import TopNav from './top-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav />
      <div className="flex flex-col flex-1">
        <TopNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
