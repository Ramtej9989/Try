'use client';

import { useState } from 'react';
import { Table, TablePagination } from '@/components/ui/table';
import { Dropdown } from '@/components/ui/dropdown';
import { formatDate, getSeverityBgColor } from '@/lib/utils';

export interface Alert {
  _id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  source_log_id?: string;
  log_type?: string;
  entities?: Array<{
    type: string;
    value: string;
  }>;
  tactic?: string;
  technique?: string;
}

interface AlertTableProps {
  alerts: Alert[];
  totalAlerts: number;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAlertSelect: (alert: Alert) => void;
  onStatusChange?: (alertId: string, status: string) => void;
  selectedAlertId?: string;
}

export default function AlertTable({
  alerts = [],
  totalAlerts = 0,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
  onAlertSelect,
  onStatusChange,
  selectedAlertId,
}: AlertTableProps) {
  // Define column configuration for the table
  const columns = [
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (alert: Alert) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBgColor(alert.severity === 'CRITICAL' ? 10 : alert.severity === 'HIGH' ? 8 : alert.severity === 'MEDIUM' ? 5 : 2)}`}>
          {alert.severity}
        </span>
      ),
      className: 'w-24'
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (alert: Alert) => (
        <div className="max-w-md">
          <div className="font-medium text-sm">{alert.title}</div>
          <div className="text-xs text-gray-500 truncate">{alert.description}</div>
        </div>
      )
    },
    {
      header: 'Time',
      accessorKey: 'timestamp',
      cell: (alert: Alert) => (
        <span className="text-sm text-gray-500">
          {formatDate(alert.timestamp)}
        </span>
      ),
      className: 'w-40'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (alert: Alert) => {
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

        if (onStatusChange) {
          // If status can be changed, show dropdown
          return (
            <Dropdown
              items={[
                { label: 'New', value: 'NEW' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'False Positive', value: 'FALSE_POSITIVE' },
              ]}
              value={alert.status}
              onChange={(value) => onStatusChange(alert._id, value as string)}
              buttonClassName={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[alert.status as keyof typeof statusColors]}`}
            />
          );
        }
        
        // Otherwise show static status
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[alert.status as keyof typeof statusColors]}`}>
            {statusLabels[alert.status as keyof typeof statusLabels]}
          </span>
        );
      },
      className: 'w-32'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Security Alerts</h3>
      </div>

      <Table
        columns={columns}
        data={alerts}
        isLoading={isLoading}
        noDataMessage="No alerts found"
        rowClassName={(item) => item._id === selectedAlertId ? 'bg-blue-50' : ''}
        onRowClick={onAlertSelect}
        keyExtractor={(item) => item._id}
      />

      <div className="border-t border-gray-200">
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalAlerts}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
