'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { LogType } from './log-table';

interface LogFilterProps {
  logType: LogType;
  onFilter: (filters: any) => void;
  availableFilters?: {
    users?: string[];
    statuses?: string[];
    authMethods?: string[];
    protocols?: string[];
    actions?: string[];
    labels?: string[];
  };
  currentFilters?: any;
}

export default function LogFilter({
  logType,
  onFilter,
  availableFilters = {},
  currentFilters = {}
}: LogFilterProps) {
  // State for filter values
  const [filters, setFilters] = useState({
    search: currentFilters.search || '',
    user: currentFilters.user || '',
    status: currentFilters.status || '',
    authMethod: currentFilters.authMethod || '',
    protocol: currentFilters.protocol || '',
    action: currentFilters.action || '',
    label: currentFilters.label || '',
    timeRange: currentFilters.timeRange || '24h'
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilter(filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      user: '',
      status: '',
      authMethod: '',
      protocol: '',
      action: '',
      label: '',
      timeRange: '24h'
    });
    onFilter({});
  };

  // Convert available filters to dropdown items format
  const createDropdownItems = (values: string[] = []) => {
    return [
      { label: 'All', value: '' },
      ...values.map(value => ({ label: value, value }))
    ];
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Field */}
          <div>
            <Input
              label="Search"
              placeholder={logType === 'auth' ? 'Search username, IP, host...' : 'Search IP addresses, protocols...'}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Time Range Filter */}
          <div>
            <Dropdown
              label="Time Range"
              items={[
                { label: 'Last 24 hours', value: '24h' },
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'All time', value: 'all' }
              ]}
              value={filters.timeRange}
              onChange={(value) => handleFilterChange('timeRange', value as string)}
            />
          </div>
          
          {/* Auth Log Specific Filters */}
          {logType === 'auth' && (
            <>
              <div>
                <Dropdown
                  label="Username"
                  items={createDropdownItems(availableFilters.users)}
                  value={filters.user}
                  onChange={(value) => handleFilterChange('user', value as string)}
                />
              </div>
              
              <div>
                <Dropdown
                  label="Status"
                  items={createDropdownItems(availableFilters.statuses)}
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value as string)}
                />
              </div>
              
              <div>
                <Dropdown
                  label="Auth Method"
                  items={createDropdownItems(availableFilters.authMethods)}
                  value={filters.authMethod}
                  onChange={(value) => handleFilterChange('authMethod', value as string)}
                />
              </div>
            </>
          )}
          
          {/* Network Log Specific Filters */}
          {logType === 'network' && (
            <>
              <div>
                <Dropdown
                  label="Protocol"
                  items={createDropdownItems(availableFilters.protocols)}
                  value={filters.protocol}
                  onChange={(value) => handleFilterChange('protocol', value as string)}
                />
              </div>
              
              <div>
                <Dropdown
                  label="Action"
                  items={createDropdownItems(availableFilters.actions)}
                  value={filters.action}
                  onChange={(value) => handleFilterChange('action', value as string)}
                />
              </div>
              
              <div>
                <Dropdown
                  label="Label"
                  items={createDropdownItems(availableFilters.labels)}
                  value={filters.label}
                  onChange={(value) => handleFilterChange('label', value as string)}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
