import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

interface Alert {
  _id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  source_log_id?: string;
  log_type?: string;
}

interface RecentAlertsProps {
  alerts: Alert[];
  isLoading?: boolean;
  maxAlerts?: number;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ 
  alerts = [], 
  isLoading = false,
  maxAlerts = 5 
}) => {
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'FALSE_POSITIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Security Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            <p>No recent alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, maxAlerts).map((alert) => (
              <div 
                key={alert._id} 
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{alert.title}</h3>
                  <span 
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}
                  >
                    {alert.severity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatDate(alert.timestamp)}</span>
                  <span 
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(alert.status)}`}
                  >
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link 
          href="/alerts"
          className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          View All Alerts →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentAlerts;
