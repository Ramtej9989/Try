'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import UploadForm from '@/components/upload/upload-form';
import { Button } from '@/components/ui/button';
import { API_URL, API_KEY } from '../../lib/api-config';

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [uploadsCompleted, setUploadsCompleted] = useState({
    assets: false,
    threat_intel: false,
    auth_logs: false,
    network_logs: false
  });
  const [runningDetection, setRunningDetection] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [detectionSuccess, setDetectionSuccess] = useState<string | null>(null);

  // Redirect non-admin users
  if (session?.user?.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const handleUploadSuccess = (type: 'assets' | 'threat_intel' | 'auth_logs' | 'network_logs') => {
    setUploadsCompleted(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleRunDetection = async () => {
    setRunningDetection(true);
    setDetectionError(null);
    setDetectionSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/detection/run?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ hours_back: 24 })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Detection failed with status: ${response.status}`);
      }

      const data = await response.json();
      setDetectionSuccess(`Detection completed successfully! Generated ${data.total_alerts || 0} alerts`);
      
      // After successful detection, redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Detection error:', err);
      setDetectionError(err.message || 'Failed to run detection');
    } finally {
      setRunningDetection(false);
    }
  };

  const allUploadsCompleted = uploadsCompleted.assets && 
                             uploadsCompleted.threat_intel && 
                             uploadsCompleted.auth_logs && 
                             uploadsCompleted.network_logs;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Security Data</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <UploadForm
            title="Asset Inventory"
            description="Upload your asset inventory CSV file containing host information and criticality ratings"
            type="assets"
            onSuccess={() => handleUploadSuccess('assets')}
          />
          
          <UploadForm
            title="Threat Intelligence"
            description="Upload threat intelligence indicators in CSV format (IPs, domains, hashes)"
            type="threat_intel"
            onSuccess={() => handleUploadSuccess('threat_intel')}
          />
          
          <UploadForm
            title="Authentication Logs"
            description="Upload authentication events CSV with login attempts and successes/failures"
            type="auth_logs"
            onSuccess={() => handleUploadSuccess('auth_logs')}
          />
          
          <UploadForm
            title="Network Logs"
            description="Upload network traffic logs CSV showing connections between systems"
            type="network_logs"
            onSuccess={() => handleUploadSuccess('network_logs')}
          />
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-2">Run Detection Rules</h2>
            <p className="text-sm text-gray-500 mb-4">
              After uploading all required data files, run detection rules to identify security threats
            </p>
            
            {detectionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{detectionError}</p>
              </div>
            )}
            
            {detectionSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm text-green-700">{detectionSuccess}</p>
                <p className="text-sm text-green-700 mt-1">Redirecting to dashboard...</p>
              </div>
            )}
            
            <Button
              onClick={handleRunDetection}
              disabled={!allUploadsCompleted || runningDetection}
              isLoading={runningDetection}
              className="w-full"
            >
              {runningDetection ? 'Running Detection...' : 'Run Detection Rules'}
            </Button>
            
            {!allUploadsCompleted && (
              <p className="text-sm text-amber-600 mt-2">
                Please upload all required data files before running detection
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
