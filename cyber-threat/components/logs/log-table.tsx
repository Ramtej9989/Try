'use client';

import { useState } from 'react';
import { Table, TablePagination } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

export interface AuthLog {
  _id: string;
  timestamp: string;
  username: string;
  src_ip: string;
  dest_host: string;
  status: string;
  auth_method: string;
}

export interface NetworkLog {
  _id: string;
  timestamp: string;
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
  protocol: string;
  action: string;
  bytes_sent: number;
  bytes_received: number;
  label?: string;
}

export type LogType = 'auth' | 'network';

interface LogTableProps<T> {
  logs: T[];
  totalLogs: number;
  logType: LogType;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onLogSelect?: (log: T) => void;
  selectedLogId?: string;
}

export default function LogTable<T extends AuthLog | NetworkLog>({
  logs = [],
  totalLogs = 0,
  logType,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
  onLogSelect,
  selectedLogId
}: LogTableProps<T>) {
  const authLogColumns = [
    {
      header: 'Time',
      accessorKey: 'timestamp',
      cell: (log: AuthLog) => (
        <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
      )
    },
    {
      header: 'User',
      accessorKey: 'username',
    },
    {
      header: 'Source IP',
      accessorKey: 'src_ip',
    },
    {
      header: 'Destination',
      accessorKey: 'dest_host',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (log: AuthLog) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {log.status}
        </span>
      )
    },
    {
      header: 'Auth Method',
      accessorKey: 'auth_method',
      cell: (log: AuthLog) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {log.auth_method}
        </span>
      )
    }
  ];
  
  const networkLogColumns = [
    {
      header: 'Time',
      accessorKey: 'timestamp',
      cell: (log: NetworkLog) => (
        <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
      )
    },
    {
      header: 'Source',
      accessorKey: 'src_ip',
      cell: (log: NetworkLog) => (
        <div className="text-sm">
          <div>{log.src_ip}</div>
          <div className="text-xs text-gray-500">:{log.src_port}</div>
        </div>
      )
    },
    {
      header: 'Destination',
      accessorKey: 'dest_ip',
      cell: (log: NetworkLog) => (
        <div className="text-sm">
          <div>{log.dest_ip}</div>
          <div className="text-xs text-gray-500">:{log.dest_port}</div>
        </div>
      )
    },
    {
      header: 'Protocol',
      accessorKey: 'protocol',
      cell: (log: NetworkLog) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {log.protocol}
        </span>
      )
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (log: NetworkLog) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          log.action === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {log.action}
        </span>
      )
    },
    {
      header: 'Traffic',
      cell: (log: NetworkLog) => (
        <div className="text-xs">
          <div>↑ {formatBytes(log.bytes_sent)}</div>
          <div>↓ {formatBytes(log.bytes_received)}</div>
        </div>
      )
    },
    {
      header: 'Label',
      accessorKey: 'label',
      cell: (log: NetworkLog) => (
        log.label ? (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            log.label === 'attack' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {log.label}
          </span>
        ) : null
      )
    }
  ];

  const columns = logType === 'auth' ? authLogColumns : networkLogColumns;

  // Helper function to format bytes
  function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">
          {logType === 'auth' ? 'Authentication Logs' : 'Network Logs'}
        </h3>
      </div>

      <Table
        columns={columns}
        data={logs}
        isLoading={isLoading}
        noDataMessage={`No ${logType} logs found`}
        rowClassName={(item) => item._id === selectedLogId ? 'bg-blue-50' : ''}
        onRowClick={onLogSelect}
        keyExtractor={(item) => item._id}
      />

      <div className="border-t border-gray-200">
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalLogs}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
