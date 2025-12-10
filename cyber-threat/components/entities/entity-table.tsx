'use client';

import { useState, useEffect } from 'react';
import { Table, TablePagination } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getSeverityBgColor } from '@/lib/utils';

export interface EntityRisk {
  _id: string;
  entity_id: string;
  entity_type: 'USER' | 'IP' | 'HOST';
  risk_score: number;
  risk_factors: Array<{
    factor: string;
    score: number;
    details: string;
  }>;
  last_updated: string;
}

interface EntityTableProps {
  entities: EntityRisk[];
  totalEntities: number;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEntitySelect: (entity: EntityRisk) => void;
  selectedEntityId?: string;
  onRecalculateClick?: () => void;
  isRecalculating?: boolean;
  entityTypeFilter?: string;
  onEntityTypeFilterChange?: (type: string) => void;
}

export default function EntityTable({
  entities = [],
  totalEntities = 0,
  isLoading = false,
  page = 1,
  pageSize = 10,
  onPageChange,
  onEntitySelect,
  selectedEntityId,
  onRecalculateClick,
  isRecalculating = false,
  entityTypeFilter = '',
  onEntityTypeFilterChange
}: EntityTableProps) {
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    return getSeverityBgColor(score);
  };

  // Get entity type badge style
  const getEntityTypeBadge = (type: string) => {
    switch(type) {
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'IP':
        return 'bg-purple-100 text-purple-800';
      case 'HOST':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Entity ID',
      accessorKey: 'entity_id',
      className: 'min-w-[200px]'
    },
    {
      header: 'Type',
      accessorKey: 'entity_type',
      cell: (entity: EntityRisk) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntityTypeBadge(entity.entity_type)}`}>
          {entity.entity_type}
        </span>
      ),
      className: 'w-24'
    },
    {
      header: 'Risk Score',
      accessorKey: 'risk_score',
      cell: (entity: EntityRisk) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
            <div 
              className={`h-2.5 rounded-full ${getRiskScoreColor(entity.risk_score)}`}
              style={{ width: `${entity.risk_score * 10}%` }}
            ></div>
          </div>
          <span className={`text-sm font-medium`}>
            {entity.risk_score.toFixed(1)}
          </span>
        </div>
      ),
      className: 'w-40'
    },
    {
      header: 'Last Updated',
      accessorKey: 'last_updated',
      cell: (entity: EntityRisk) => (
        <span className="text-sm text-gray-500">
          {formatDate(entity.last_updated)}
        </span>
      ),
      className: 'w-40'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Entity Risk Scores</h3>
          
          {/* Entity Type Filter */}
          {onEntityTypeFilterChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded-md ${entityTypeFilter === '' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onEntityTypeFilterChange('')}
                >
                  All
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded-md ${entityTypeFilter === 'USER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onEntityTypeFilterChange('USER')}
                >
                  Users
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded-md ${entityTypeFilter === 'IP' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onEntityTypeFilterChange('IP')}
                >
                  IPs
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded-md ${entityTypeFilter === 'HOST' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onEntityTypeFilterChange('HOST')}
                >
                  Hosts
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Recalculate button */}
        {onRecalculateClick && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onRecalculateClick}
            disabled={isRecalculating}
          >
            {isRecalculating ? 'Recalculating...' : 'Recalculate Risk Scores'}
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        data={entities}
        isLoading={isLoading}
        noDataMessage="No entities found"
        rowClassName={(item) => item._id === selectedEntityId ? 'bg-blue-50' : ''}
        onRowClick={onEntitySelect}
        keyExtractor={(item) => item._id}
      />

      <div className="border-t border-gray-200">
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalEntities}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
