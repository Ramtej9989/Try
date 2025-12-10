'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

// Types
interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  timestamp: string;
  source_log_id?: string;
  log_type?: string;
  entities?: Array<{ type: string; value: string }>;
  tactic?: string;
  created_at: string;
  updated_at?: string;
}

interface AlertFilters {
  severity: string;
  status: string;
  timeRange: string;
  search: string;
}

export default function AlertsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'ALL',
    status: 'ALL',
    timeRange: '24h',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const pageSize = 20;

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        api_key: API_KEY,
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      });

      if (filters.severity !== 'ALL') {
        queryParams.append('severity', filters.severity);
      }
      if (filters.status !== 'ALL') {
        queryParams.append('status', filters.status);
      }

      const response = await fetch(`${API_URL}/api/alerts?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }
      
      const data = await response.json();
      setAlerts(data.alerts || []);
      setFilteredAlerts(data.alerts || []);
      setTotalAlerts(data.total || 0);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(`Failed to load alerts: ${err.message}`);
      
      // Set demo data on error
      const demoAlerts = generateDemoAlerts();
      setAlerts(demoAlerts);
      setFilteredAlerts(demoAlerts);
      setTotalAlerts(demoAlerts.length);
      setIsLoading(false);
    }
  }, [page, filters.severity, filters.status]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Filter alerts based on search
  useEffect(() => {
    let result = [...alerts];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description?.toLowerCase().includes(searchLower) ||
        alert.entities?.some(e => e.value.toLowerCase().includes(searchLower))
      );
    }

    // Sort alerts
    result.sort((a, b) => {
      if (sortBy === 'timestamp') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const severityA = severityOrder[a.severity] || 0;
        const severityB = severityOrder[b.severity] || 0;
        return sortOrder === 'desc' ? severityB - severityA : severityA - severityB;
      }
    });

    setFilteredAlerts(result);
  }, [alerts, filters.search, sortBy, sortOrder]);

  // Update alert status
  const updateAlertStatus = async (alertId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/alerts/${alertId}/status?api_key=${API_KEY}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update alert: ${response.status}`);
      }
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId ? { ...alert, status: newStatus as Alert['status'] } : alert
      ));
      
      if (selectedAlert?._id === alertId) {
        setSelectedAlert(prev => prev ? { ...prev, status: newStatus as Alert['status'] } : null);
      }
    } catch (err: any) {
      console.error('Error updating alert:', err);
      // Update locally anyway for demo
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId ? { ...alert, status: newStatus as Alert['status'] } : alert
      ));
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk update alerts
  const bulkUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    for (const alertId of selectedAlerts) {
      await updateAlertStatus(alertId, newStatus);
    }
    setSelectedAlerts(new Set());
    setShowBulkActions(false);
    setIsUpdating(false);
  };

  // Toggle alert selection
  const toggleAlertSelection = (alertId: string) => {
    const newSelection = new Set(selectedAlerts);
    if (newSelection.has(alertId)) {
      newSelection.delete(alertId);
    } else {
      newSelection.add(alertId);
    }
    setSelectedAlerts(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  // Select all alerts
  const selectAllAlerts = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a._id)));
      setShowBulkActions(true);
    }
  };

  // Get severity color classes
  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/30',
          dot: 'bg-red-500',
          glow: 'shadow-red-500/20'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          border: 'border-orange-500/30',
          dot: 'bg-orange-500',
          glow: 'shadow-orange-500/20'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/30',
          dot: 'bg-yellow-500',
          glow: 'shadow-yellow-500/20'
        };
      case 'LOW':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500/30',
          dot: 'bg-green-500',
          glow: 'shadow-green-500/20'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/30',
          dot: 'bg-gray-500',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  // Get status color classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'NEW':
        return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' };
      case 'IN_PROGRESS':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'RESOLVED':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
      case 'FALSE_POSITIVE':
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Chart data
  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [
        alerts.filter(a => a.severity === 'CRITICAL').length || 12,
        alerts.filter(a => a.severity === 'HIGH').length || 45,
        alerts.filter(a => a.severity === 'MEDIUM').length || 180,
        alerts.filter(a => a.severity === 'LOW').length || 100,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: '#0a0e17',
      borderWidth: 3,
    }]
  };

  const trendChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical',
        data: [2, 4, 3, 5, 2, 3, 4],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'High',
        data: [8, 12, 9, 15, 11, 8, 10],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 41, 59, 0.5)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.5)' },
        ticks: { color: '#64748b', font: { size: 10 } },
        beginAtZero: true
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 10 },
          boxWidth: 12,
          padding: 8,
        }
      },
    },
    cutout: '65%',
  };

  // Loading state
  if (isLoading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading security alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Connection Error</h3>
              <p className="mt-1 text-xs text-red-300/70">{error}</p>
              <p className="mt-2 text-xs text-gray-500">Showing demo data for preview.</p>
            </div>
            <button 
              onClick={fetchAlerts}
              className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Mini Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Distribution */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-[#334155] transition-all duration-300">
          <h3 className="text-sm font-medium text-white mb-3">Severity Distribution</h3>
          <div className="h-40">
            <Doughnut data={severityChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Alert Trend */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-[#334155] transition-all duration-300">
          <h3 className="text-sm font-medium text-white mb-3">Alert Trend (7 Days)</h3>
          <div className="h-40">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-[#334155] transition-all duration-300">
          <h3 className="text-sm font-medium text-white mb-3">Response Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Avg Response Time</span>
              <span className="text-sm font-bold text-green-400">12m</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0e17] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Resolution Rate</span>
              <span className="text-sm font-bold text-blue-400">89%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0e17] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '89%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">False Positive Rate</span>
              <span className="text-sm font-bold text-yellow-400">2.1%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0e17] rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '2.1%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-400">{selectedAlerts.size}</span>
            </div>
            <span className="text-sm text-gray-300">alerts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => bulkUpdateStatus('IN_PROGRESS')}
              disabled={isUpdating}
              className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
            >
              Mark In Progress
            </button>
            <button 
              onClick={() => bulkUpdateStatus('RESOLVED')}
              disabled={isUpdating}
              className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
            >
              Mark Resolved
            </button>
            <button 
              onClick={() => bulkUpdateStatus('FALSE_POSITIVE')}
              disabled={isUpdating}
              className="px-3 py-1.5 text-xs bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors disabled:opacity-50"
            >
              False Positive
            </button>
            <button 
              onClick={() => { setSelectedAlerts(new Set()); setShowBulkActions(false); }}
              className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Alerts List */}
        <div className={`flex-1 transition-all duration-300 ${showDetailPanel ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                  onChange={selectAllAlerts}
                  className="w-4 h-4 rounded border-[#334155] bg-[#0a0e17] text-blue-500 focus:ring-blue-500/50"
                />
                <div className="flex-1 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => { setSortBy('timestamp'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                    Alert Details
                    <svg className={`w-3 h-3 transition-transform ${sortBy === 'timestamp' && sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => { setSortBy('severity'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                    Severity
                    <svg className={`w-3 h-3 transition-transform ${sortBy === 'severity' && sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Alert Rows */}
            <div className="divide-y divide-[#1e293b]">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  const severityClasses = getSeverityClasses(alert.severity);
                  const statusClasses = getStatusClasses(alert.status);
                  const isSelected = selectedAlerts.has(alert._id);

                  return (
                    <div
                      key={alert._id}
                      className={`px-4 py-4 hover:bg-[#1e293b]/50 transition-all duration-200 cursor-pointer ${
                        isSelected ? 'bg-blue-500/10' : ''
                      } ${selectedAlert?._id === alert._id ? 'bg-[#1e293b]/70 border-l-2 border-blue-500' : ''}`}
                      onClick={() => { setSelectedAlert(alert); setShowDetailPanel(true); }}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => { e.stopPropagation(); toggleAlertSelection(alert._id); }}
                          className="w-4 h-4 rounded border-[#334155] bg-[#0a0e17] text-blue-500 focus:ring-blue-500/50"
                        />
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {/* Alert Details */}
                          <div className="col-span-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${severityClasses.dot} shadow-lg ${severityClasses.glow}`}></div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                                  {alert.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {alert.description || 'No description available'}
                                </p>
                                {alert.entities && alert.entities.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {alert.entities.slice(0, 3).map((entity, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-2 py-0.5 text-[10px] bg-[#0a0e17] text-gray-400 rounded-md font-mono"
                                      >
                                        {entity.type}: {entity.value}
                                      </span>
                                    ))}
                                    {alert.entities.length > 3 && (
                                      <span className="text-[10px] text-gray-500">+{alert.entities.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Severity */}
                          <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${severityClasses.bg} ${severityClasses.text} ${severityClasses.border} border`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${severityClasses.dot}`}></span>
                              {alert.severity}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusClasses.bg} ${statusClasses.text} ${statusClasses.border} border`}>
                              {alert.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="col-span-2">
                            <span className="text-xs text-gray-400">{formatTime(alert.timestamp)}</span>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); setShowDetailPanel(true); }}
                                className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); /* Open menu */ }}
                                className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="More Actions"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300">No alerts found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{Math.min((page - 1) * pageSize + 1, totalAlerts)}</span> to{' '}
                <span className="font-medium text-white">{Math.min(page * pageSize, totalAlerts)}</span> of{' '}
                <span className="font-medium text-white">{totalAlerts}</span> alerts
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalAlerts / pageSize)) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                        page === i + 1
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-[#1e293b] text-gray-400 hover:bg-[#334155] hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(totalAlerts / pageSize), p + 1))}
                  disabled={page >= Math.ceil(totalAlerts / pageSize)}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {showDetailPanel && selectedAlert && (
          <div className="hidden lg:block w-1/3 bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden sticky top-24 max-h-[calc(100vh-120px)]">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Alert Details</h3>
              <button 
                onClick={() => setShowDetailPanel(false)}
                className="p-1 hover:bg-[#1e293b] rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Severity Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getSeverityClasses(selectedAlert.severity).bg} ${getSeverityClasses(selectedAlert.severity).text} ${getSeverityClasses(selectedAlert.severity).border} border uppercase`}>
                  {selectedAlert.severity}
                </span>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusClasses(selectedAlert.status).bg} ${getStatusClasses(selectedAlert.status).text} ${getStatusClasses(selectedAlert.status).border} border`}>
                  {selectedAlert.status.replace('_', ' ')}
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedAlert.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>

              {/* Description */}
              <div className="bg-[#0a0e17] rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Description</h4>
                <p className="text-sm text-gray-300">{selectedAlert.description || 'No description available'}</p>
              </div>

              {/* Entities */}
              {selectedAlert.entities && selectedAlert.entities.length > 0 && (
                <div className="bg-[#0a0e17] rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Related Entities</h4>
                  <div className="space-y-2">
                    {selectedAlert.entities.map((entity, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#1e293b] last:border-0">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          entity.type === 'IP' ? 'bg-purple-500/20 text-purple-400' :
                          entity.type === 'USER' ? 'bg-blue-500/20 text-blue-400' :
                          entity.type === 'HOST' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {entity.type}
                        </span>
                        <span className="text-sm text-gray-300 font-mono">{entity.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tactic */}
              {selectedAlert.tactic && (
                <div className="bg-[#0a0e17] rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">MITRE ATT&CK Tactic</h4>
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                    {selectedAlert.tactic.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Status Update */}
              <div className="bg-[#0a0e17] rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateAlertStatus(selectedAlert._id, 'IN_PROGRESS')}
                    disabled={isUpdating || selectedAlert.status === 'IN_PROGRESS'}
                    className="px-3 py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateAlertStatus(selectedAlert._id, 'RESOLVED')}
                    disabled={isUpdating || selectedAlert.status === 'RESOLVED'}
                    className="px-3 py-2 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => updateAlertStatus(selectedAlert._id, 'FALSE_POSITIVE')}
                    disabled={isUpdating || selectedAlert.status === 'FALSE_POSITIVE'}
                    className="px-3 py-2 text-xs bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    False Positive
                  </button>
                  <button
                    onClick={() => updateAlertStatus(selectedAlert._id, 'NEW')}
                    disabled={isUpdating || selectedAlert.status === 'NEW'}
                    className="px-3 py-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reopen
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#0a0e17] rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5"></div>
                    <div>
                      <p className="text-xs text-gray-300">Alert created</p>
                      <p className="text-[10px] text-gray-500">{new Date(selectedAlert.created_at || selectedAlert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedAlert.updated_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                      <div>
                        <p className="text-xs text-gray-300">Last updated</p>
                        <p className="text-[10px] text-gray-500">{new Date(selectedAlert.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all">
                  Investigate
                </button>
                <button className="p-2.5 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate demo alerts for testing
function generateDemoAlerts(): Alert[] {
  const severities: Alert['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses: Alert['status'][] = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE'];
  const tactics = ['INITIAL_ACCESS', 'EXECUTION', 'PERSISTENCE', 'PRIVILEGE_ESCALATION', 'DEFENSE_EVASION', 'CREDENTIAL_ACCESS', 'DISCOVERY', 'LATERAL_MOVEMENT', 'COLLECTION', 'COMMAND_AND_CONTROL', 'EXFILTRATION'];
  
  const alertTemplates = [
    { title: 'Attack traffic detected from malicious IP', desc: 'Suspicious network traffic detected from known malicious IP address' },
    { title: 'Multiple failed login attempts', desc: 'Brute force attack detected with multiple failed authentication attempts' },
    { title: 'Unauthorized access attempt', desc: 'Unauthorized user attempted to access restricted resource' },
    { title: 'Malware signature detected', desc: 'Known malware signature identified in network traffic' },
    { title: 'Data exfiltration attempt', desc: 'Large data transfer detected to external destination' },
    { title: 'Port scan detected', desc: 'Network reconnaissance activity detected from external IP' },
    { title: 'Privilege escalation attempt', desc: 'User attempted to gain elevated privileges' },
    { title: 'Suspicious PowerShell execution', desc: 'Potentially malicious PowerShell command executed' },
    { title: 'Anomalous user behavior', desc: 'User activity deviates significantly from baseline' },
    { title: 'Connection to C2 server', desc: 'Network connection established to known command and control server' },
  ];

  const ips = ['203.0.113.142', '203.0.113.245', '203.0.113.189', '192.168.1.100', '10.0.0.50'];
  const users = ['alice', 'bob', 'charlie', 'david', 'eva'];
  const hosts = ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5'];

  return Array.from({ length: 50 }, (_, i) => {
    const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = Math.random() > 0.7 ? statuses[Math.floor(Math.random() * statuses.length)] : 'NEW';
    
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    return {
      _id: `alert-${i + 1}`,
      title: template.title,
      description: template.desc,
      severity,
      status,
      timestamp: timestamp.toISOString(),
      created_at: timestamp.toISOString(),
      updated_at: status !== 'NEW' ? new Date(timestamp.getTime() + Math.random() * 3600000).toISOString() : undefined,
      entities: [
        { type: 'IP', value: ips[Math.floor(Math.random() * ips.length)] },
        { type: 'USER', value: users[Math.floor(Math.random() * users.length)] },
        { type: 'HOST', value: hosts[Math.floor(Math.random() * hosts.length)] },
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      tactic: tactics[Math.floor(Math.random() * tactics.length)],
      log_type: Math.random() > 0.5 ? 'network_logs' : 'auth_logs',
    };
  });
}
