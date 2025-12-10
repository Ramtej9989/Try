'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LogTable from '@/components/logs/log-table';
import LogFilter from '@/components/logs/log-filter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

export default function NetworkLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const pageSize = 20;

  // Available filters for dropdowns
  const [availableFilters, setAvailableFilters] = useState({
    protocols: ['TCP', 'UDP', 'ICMP'],
    actions: ['ALLOW', 'DENY'],
    labels: ['normal', 'attack']
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        api_key: API_KEY,
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      });
      
      // Add filters if they exist
      if (filters.protocol) queryParams.append('protocol', filters.protocol);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.label) queryParams.append('label', filters.label);
      if (filters.search) queryParams.append('search', filters.search);
      
      // Convert time range to dates
      if (filters.timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.timeRange) {
          case '24h':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case 'all':
          default:
            // No date filtering
            break;
        }
        
        if (filters.timeRange !== 'all') {
          queryParams.append('startDate', startDate.toISOString());
          queryParams.append('endDate', now.toISOString());
        }
      }

      const response = await fetch(
        `${API_URL}/api/logs/network?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalLogs(data.total || 0);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching network logs:', err);
      setError(`Failed to load logs: ${err.message}`);
      setIsLoading(false);
      
      // For demo/testing, display placeholder data if API fails
      setLogs(generatePlaceholderNetworkLogs());
      setTotalLogs(500);
    }
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleLogSelect = (log: any) => {
    console.log('Selected log:', log);
    // Implement log detail view if needed
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Network Logs</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-sm text-red-600">Showing sample data instead.</p>
            </div>
          </div>
        </div>
      )}
      
      <LogFilter 
        logType="network"
        onFilter={handleFilter}
        availableFilters={availableFilters}
        currentFilters={filters}
      />
      
      <LogTable
        logs={logs}
        totalLogs={totalLogs}
        logType="network"
        isLoading={isLoading && !logs.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onLogSelect={handleLogSelect}
      />
    </div>
  );
}

// Helper function to generate placeholder network logs for testing
function generatePlaceholderNetworkLogs() {
  const protocols = ['TCP', 'UDP', 'ICMP'];
  const actions = ['ALLOW', 'DENY'];
  const logs = [];
  
  for (let i = 0; i < 20; i++) {
    const isAttack = Math.random() < 0.3; // 30% chance of being an attack
    logs.push({
      _id: `nlog-${i + 1}`,
      timestamp: new Date().toISOString(),
      src_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      dest_ip: isAttack ? '203.0.113.142' : `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      src_port: Math.floor(Math.random() * 65535) + 1,
      dest_port: [80, 443, 22, 25, 53][Math.floor(Math.random() * 5)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      action: isAttack ? 'DENY' : actions[Math.floor(Math.random() * actions.length)],
      bytes_sent: Math.floor(Math.random() * 10000),
      bytes_received: Math.floor(Math.random() * 10000),
      label: isAttack ? 'attack' : 'normal'
    });
  }
  
  return logs;
}
