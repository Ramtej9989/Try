'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Root page component that redirects users based on authentication status
 * 
 * This page serves as the entry point for the application and automatically
 * routes users to the appropriate destination:
 * - Authenticated users are sent to the dashboard
 * - Unauthenticated users are redirected to the login page
 */
export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Redirect based on authentication status
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
    // For 'loading' state, we'll show the loading indicator below
  }, [status, router]);

  // Show loading state while determining authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading Enterprise SOC Platform...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your security dashboard</p>
        </div>
      </div>
    );
  }

  // This should not be visible as the useEffect will redirect
  return null;
}
