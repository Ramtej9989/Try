'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthStatusProps {
  children: React.ReactNode;
  adminRequired?: boolean;
}

export default function AuthStatus({ children, adminRequired = false }: AuthStatusProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If authentication check is complete
    if (status !== 'loading') {
      // If not authenticated, redirect to login
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      // If admin access is required but user is not admin
      if (adminRequired && session?.user?.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      // User is authenticated and has appropriate permissions
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [status, session, router, adminRequired]);

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If authorized, render children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // This should not happen due to redirects above, but just in case
  return null;
}
