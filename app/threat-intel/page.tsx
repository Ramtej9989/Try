'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Table, TablePagination } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

export default function ThreatIntelligencePage() {
  const { data: session } = useSession();
  const [threatIntel, setThreatIntel] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalIndicators, setTotalIndicators] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const pageSize = 15;

  useEffect(() => {
    fetchThreatIntel();
  }, [page, typeFilter]);

  const fetchThreatIntel = async () => {
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
      if (typeFilter) queryParams.append('type', typeFilter);

      const response = await fetch(
        `${API_URL}/api/threat-intel?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threat intelligence: ${response.status}`);
      }
      
      const data = await response.json();
      setThreatIntel(data.threat_intel || []);
      setTotalIndicators(data.total || 0);
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Error fetching threat intelligence:', err);
      setError(`Failed to load threat intelligence: ${err.message}`);
      setIsLoading(false);
      
      // For demo purposes, display placeholder data
      const placeholderData = generatePlaceholderThreatIntel();
      setThreatIntel(placeholderData);
      setTotalIndicators(50);
    }
  };

  // Define table columns for threat intelligence
  const columns = [
    {
      header: 'Indicator',
      accessorKey: 'indicator',
      cell: (item: any) => (
        <div className="font-medium">{item.indicator}</div>
      )
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (item: any) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {item.type}
        </span>
      ),
      className: 'w-24'
    },
    {
      header: 'Threat Level',
      accessorKey: 'threat_level',
      cell: (item: any) => {
        const level = item.threat_level;
        let colorClass = 'bg-green-100 text-green-800';
        
        if (level >= 8) {
          colorClass = 'bg-red-100 text-red-800';
        } else if (level >= 6) {
          colorClass = 'bg-orange-100 text-orange-800';
        } else if (level >= 4) {
          colorClass = 'bg-yellow-100 text-yellow-800';
        }
        
        return (
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full ${level >= 8 ? 'bg-red-500' : level >= 6 ? 'bg-orange-500' : level >= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                style={{ width: `${level * 10}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{level}</span>
          </div>
        );
      },
      className: 'w-32'
    },
    {
      header: 'Source',
      accessorKey: 'source',
    },
    {
      header: 'First Seen',
      accessorKey: 'first_seen',
      cell: (item: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(item.first_seen)}
        </span>
      )
    },
    {
      header: 'Last Seen',
      accessorKey: 'last_seen',
      cell: (item: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(item.last_seen)}
        </span>
      )
    }
  ];

  const handleIndicatorSelect = (indicator: any) => {
    setSelectedIndicator(indicator);
  };

  const handleAddIndicator = () => {
    console.log('Adding new indicator...');
    // Implement add indicator functionality if needed
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Threat Intelligence</h1>
        
        {session?.user?.role === 'ADMIN' && (
          <Button
            onClick={handleAddIndicator}
            variant="default"
            size="sm"
          >
            Add Indicator
          </Button>
        )}
      </div>
      
      <div className="bg-white p-6 shadow rounded-lg">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Threat Intelligence Overview</h2>
          <p className="text-gray-500">
            Based on threat intelligence from 50 sources, monitoring malicious IPs, domains, and other indicators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Indicators</div>
              <div className="text-2xl font-bold">50</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Critical (9-10)</div>
              <div className="text-2xl font-bold text-red-600">12</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">High (7-8)</div>
              <div className="text-2xl font-bold text-orange-600">15</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Medium (4-6)</div>
              <div className="text-2xl font-bold text-yellow-600">18</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
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
              <p className="text-sm text-red-600">Showing sample threat intelligence data instead.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter buttons for indicator types */}
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${typeFilter === '' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setTypeFilter('')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${typeFilter === 'IP' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setTypeFilter('IP')}
          >
            IP Addresses
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${typeFilter === 'DOMAIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setTypeFilter('DOMAIN')}
          >
            Domains
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${typeFilter === 'URL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setTypeFilter('URL')}
          >
            URLs
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${typeFilter === 'HASH' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setTypeFilter('HASH')}
          >
            File Hashes
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={threatIntel}
          isLoading={isLoading && !threatIntel.length}
          noDataMessage="No threat intelligence indicators found"
          onRowClick={handleIndicatorSelect}
          keyExtractor={(item) => item._id || item.indicator}
        />
        
        <div className="border-t border-gray-200">
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={totalIndicators}
            onPageChange={setPage}
          />
        </div>
      </div>
      
      {selectedIndicator && (
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium mb-4">Indicator Details: {selectedIndicator.indicator}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">Type</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {selectedIndicator.type}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">Threat Level</span>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedIndicator.threat_level >= 8 ? 'bg-red-500' : 
                        selectedIndicator.threat_level >= 6 ? 'bg-orange-500' : 
                        selectedIndicator.threat_level >= 4 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                      style={{ width: `${selectedIndicator.threat_level * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 font-medium">{selectedIndicator.threat_level}/10</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">Source</span>
                <span className="font-medium">{selectedIndicator.source}</span>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">First Seen</span>
                <span className="font-medium">{formatDate(selectedIndicator.first_seen)}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">Last Seen</span>
                <span className="font-medium">{formatDate(selectedIndicator.last_seen)}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedIndicator.tags ? (
                    selectedIndicator.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {selectedIndicator.description && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 block">Description</span>
              <p className="mt-1">{selectedIndicator.description}</p>
            </div>
          )}
          
          {session?.user?.role === 'ADMIN' && (
            <div className="mt-6 flex space-x-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to generate placeholder threat intelligence data
function generatePlaceholderThreatIntel() {
  const data = [];
  
  // Generate IP indicators (mostly from the 203.0.113.x range as in your uploaded data)
  for (let i = 1; i <= 50; i++) {
    const ipNum = i + 100;
    const threatLevel = Math.floor(Math.random() * 5) + 6; // Generate threat levels between 6-10
    
    const firstSeen = new Date();
    firstSeen.setDate(firstSeen.getDate() - Math.floor(Math.random() * 30)); // Random date in the last month
    
    const lastSeen = new Date();
    lastSeen.setDate(firstSeen.getDate() + Math.floor(Math.random() * 10)); // Random date after first seen
    
    data.push({
      _id: `ti-${i}`,
      indicator: `203.0.113.${ipNum}`,
      type: 'IP',
      threat_level: threatLevel,
      source: 'LOCAL_FEED',
      first_seen: firstSeen.toISOString(),
      last_seen: lastSeen.toISOString(),
      tags: threatLevel >= 9 ? ['malware', 'ransomware'] : threatLevel >= 7 ? ['scanner', 'bruteforce'] : ['suspicious'],
      description: threatLevel >= 9 ? 'Known malicious IP associated with ransomware C2' : 
                   threatLevel >= 7 ? 'IP observed conducting port scans and brute force attempts' :
                   'IP flagged for suspicious activity'
    });
  }
  
  return data;
}
