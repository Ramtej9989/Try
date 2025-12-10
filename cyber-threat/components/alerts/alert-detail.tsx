'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Alert } from './alert-table';
import { getSeverityBgColor } from '@/lib/utils';

interface AlertDetailProps {
  alert: Alert | null;
  isLoading?: boolean;
  onStatusChange?: (alertId: string, status: string) => void;
  onClose?: () => void;
}

export default function AlertDetail({
  alert,
  isLoading = false,
  onStatusChange,
  onClose
}: AlertDetailProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!alert) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Select an alert to view details</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    FALSE_POSITIVE: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    FALSE_POSITIVE: 'False Positive',
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>{alert.title}</CardTitle>
          <div className="mt-1 text-sm text-gray-500">
            {formatDate(alert.timestamp)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getSeverityBgColor(alert.severity === 'CRITICAL' ? 10 : alert.severity === 'HIGH' ? 8 : alert.severity === 'MEDIUM' ? 5 : 2)}`}>
            {alert.severity}
          </span>
          {onClose && (
            <button 
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Alert Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm">{alert.description}</p>
          </div>

          {/* Alert Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[alert.status as keyof typeof statusColors]}`}>
                  {statusLabels[alert.status as keyof typeof statusLabels]}
                </span>
              </div>
            </div>
            
            {alert.log_type && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Log Type</h3>
                <p className="mt-1 text-sm">{alert.log_type}</p>
              </div>
            )}

            {alert.tactic && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">MITRE ATT&CK</h3>
                <p className="mt-1 text-sm">{alert.tactic} / {alert.technique || 'Unknown'}</p>
              </div>
            )}
          </div>

          {/* Entities */}
          {alert.entities && alert.entities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Involved Entities</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {alert.entities.map((entity, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      entity.type === 'IP' ? 'bg-blue-50 text-blue-700' :
                      entity.type === 'USER' ? 'bg-purple-50 text-purple-700' :
                      entity.type === 'HOST' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {entity.type}: {entity.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Actions */}
          {onStatusChange && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Update Status</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={alert.status === 'NEW' ? 'default' : 'outline'}
                  onClick={() => onStatusChange(alert._id, 'NEW')}
                  disabled={alert.status === 'NEW'}
                >
                  New
                </Button>
                <Button
                  size="sm"
                  variant={alert.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                  onClick={() => onStatusChange(alert._id, 'IN_PROGRESS')}
                  disabled={alert.status === 'IN_PROGRESS'}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant={alert.status === 'RESOLVED' ? 'success' : 'outline'}
                  onClick={() => onStatusChange(alert._id, 'RESOLVED')}
                  disabled={alert.status === 'RESOLVED'}
                >
                  Resolved
                </Button>
                <Button
                  size="sm"
                  variant={alert.status === 'FALSE_POSITIVE' ? 'subtle' : 'outline'}
                  onClick={() => onStatusChange(alert._id, 'FALSE_POSITIVE')}
                  disabled={alert.status === 'FALSE_POSITIVE'}
                >
                  False Positive
                </Button>
              </div>
            </div>
          )}

          {/* Evidence */}
          {alert.source_log_id && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Evidence</h3>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  View Source Log
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
