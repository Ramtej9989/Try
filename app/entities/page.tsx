'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import EntityTable from '@/components/entities/entity-table';
import RiskScoreCard from '@/components/entities/risk-score-card';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

export default function EntitiesPage() {
  const { data: session } = useSession();
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalEntities, setTotalEntities] = useState(0);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchEntities();
  }, [page, entityTypeFilter]);

  const fetchEntities = async () => {
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
      if (entityTypeFilter) queryParams.append('entity_type', entityTypeFilter);

      const response = await fetch(
        `${API_URL}/api/entities?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entities: ${response.status}`);
      }
      
      const data = await response.json();
      setEntities(data.scores || []);
      setTotalEntities(data.total || 0);
      setIsLoading(false);
      
      // If there are entities and none selected yet, select the first one
      if ((data.scores || []).length > 0 && !selectedEntity) {
        fetchEntityDetail(data.scores[0]);
      }
    } catch (err: any) {
      console.error('Error fetching entities:', err);
      setError(`Failed to load entity risk scores: ${err.message}`);
      setIsLoading(false);
      
      // For demo/testing, display placeholder data if API fails
      const placeholderData = generatePlaceholderEntities();
      setEntities(placeholderData);
      setTotalEntities(placeholderData.length);
      
      if (placeholderData.length > 0 && !selectedEntity) {
        setSelectedEntity({
          ...placeholderData[0],
          additional_data: {
            auth_logs: generatePlaceholderAuthLogs(placeholderData[0].entity_id, 5),
            network_logs: generatePlaceholderNetworkLogs(placeholderData[0].entity_type === 'IP' ? placeholderData[0].entity_id : null, 5),
            asset: placeholderData[0].entity_type === 'HOST' ? {
              host: placeholderData[0].entity_id,
              ip_address: '10.0.0.1',
              owner: 'IT Department',
              criticality: 5
            } : null,
            threat_intel: placeholderData[0].entity_type === 'IP' && placeholderData[0].risk_score > 8 ? {
              indicator: placeholderData[0].entity_id,
              threat_level: 10,
              source: 'ThreatFeed',
              first_seen: '2025-11-01T00:00:00.000Z',
              last_seen: '2025-12-07T00:00:00.000Z'
            } : null
          }
        });
      }
    }
  };
  
  const fetchEntityDetail = async (entity: any) => {
    try {
      const response = await fetch(
        `${API_URL}/api/entities/${entity.entity_type.toLowerCase()}/${encodeURIComponent(entity.entity_id)}?api_key=${API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entity detail: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedEntity(data);
    } catch (err: any) {
      console.error('Error fetching entity detail:', err);
      
      // For demo purposes, create some fake additional data
      setSelectedEntity({
        ...entity,
        additional_data: {
          auth_logs: entity.entity_type === 'USER' ? generatePlaceholderAuthLogs(entity.entity_id, 5) : [],
          network_logs: entity.entity_type === 'IP' ? generatePlaceholderNetworkLogs(entity.entity_id, 5) : [],
          asset: entity.entity_type === 'HOST' ? {
            host: entity.entity_id,
            ip_address: '10.0.0.1',
            owner: 'IT Department',
            criticality: entity.entity_id === 'srv-1' ? 5 : 3
          } : null,
          threat_intel: entity.entity_type === 'IP' && entity.risk_score > 8 ? {
            indicator: entity.entity_id,
            threat_level: 10,
            source: 'ThreatFeed',
            first_seen: '2025-11-01T00:00:00.000Z',
            last_seen: '2025-12-07T00:00:00.000Z'
          } : null
        }
      });
    }
  };

  const handleEntitySelect = (entity: any) => {
    fetchEntityDetail(entity);
  };
  
  const handleRecalculateRisk = async () => {
    setIsRecalculating(true);
    
    try {
      const response = await fetch(
        `${API_URL}/api/entities/recalculate?api_key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({ force: true })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to recalculate risk scores: ${response.status}`);
      }
      
      // Wait for recalculation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch updated entities
      await fetchEntities();
      
    } catch (err: any) {
      console.error('Error recalculating risk scores:', err);
      alert(`Failed to recalculate risk scores: ${err.message}`);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Entity Risk Analysis</h1>
        
        {session?.user?.role === 'ADMIN' && (
          <Button
            onClick={handleRecalculateRisk}
            isLoading={isRecalculating}
            variant="outline"
            size="sm"
          >
            {isRecalculating ? 'Recalculating...' : 'Recalculate Risk Scores'}
          </Button>
        )}
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
              <p className="text-sm text-red-600">Showing sample data instead.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EntityTable
            entities={entities}
            totalEntities={totalEntities}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onEntitySelect={handleEntitySelect}
            selectedEntityId={selectedEntity?._id}
            entityTypeFilter={entityTypeFilter}
            onEntityTypeFilterChange={setEntityTypeFilter}
          />
        </div>
        
        <div className="lg:col-span-1">
          <RiskScoreCard
            entity={selectedEntity}
            isLoading={isLoading && !error}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to generate placeholder entity data for testing
function generatePlaceholderEntities() {
  return [
    {
      _id: 'entity-1',
      entity_id: 'srv-1',
      entity_type: 'HOST',
      risk_score: 9.2,
      risk_factors: [
        {
          factor: 'CRITICAL_ASSET',
          score: 2.5,
          details: 'Critical asset with criticality rating 5/5'
        },
        {
          factor: 'ATTACK_TARGET',
          score: 3.8,
          details: 'Target of multiple attack traffic events'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 2.9,
          details: 'Associated with 4 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-2',
      entity_id: '203.0.113.142',
      entity_type: 'IP',
      risk_score: 9.0,
      risk_factors: [
        {
          factor: 'KNOWN_THREAT_ACTOR',
          score: 5.0,
          details: 'Known malicious IP with threat level 10/10'
        },
        {
          factor: 'DETECTED_ATTACK',
          score: 3.0,
          details: 'Source of multiple attack events'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-3',
      entity_id: 'charlie',
      entity_type: 'USER',
      risk_score: 8.5,
      risk_factors: [
        {
          factor: 'SUSPICIOUS_AUTH',
          score: 4.0,
          details: 'High login failure rate (12 of 15 failed)'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 3.5,
          details: 'Associated with 5 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-4',
      entity_id: 'srv-3',
      entity_type: 'HOST',
      risk_score: 8.3,
      risk_factors: [
        {
          factor: 'CRITICAL_ASSET',
          score: 2.0,
          details: 'Important asset with criticality rating 4/5'
        },
        {
          factor: 'ATTACK_TARGET',
          score: 3.5,
          details: 'Target of attack traffic'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 2.8,
          details: 'Associated with 3 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-5',
      entity_id: '203.0.113.245',
      entity_type: 'IP',
      risk_score: 8.0,
      risk_factors: [
        {
          factor: 'KNOWN_THREAT_ACTOR',
          score: 5.0,
          details: 'Known malicious IP with threat level 10/10'
        },
        {
          factor: 'DETECTED_ATTACK',
          score: 2.0,
          details: 'Source of attack events'
        }
      ],
      last_updated: new Date().toISOString()
    }
  ];
}

// Helper function to generate placeholder auth logs for testing
function generatePlaceholderAuthLogs(username: string, count: number) {
  const logs = [];
  const statuses = ['SUCCESS', 'FAILURE'];
  const hosts = ['srv-1', 'srv-2', 'srv-3'];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      _id: `auth-log-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      username: username,
      src_ip: Math.random() > 0.5 ? '203.0.113.142' : '192.168.1.100',
      dest_host: hosts[Math.floor(Math.random() * hosts.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      auth_method: 'PASSWORD'
    });
  }
  
  return logs;
}

// Helper function to generate placeholder network logs for testing
function generatePlaceholderNetworkLogs(ip: string | null, count: number) {
  const logs = [];
  const protocols = ['TCP', 'UDP'];
  const ports = [22, 80, 443, 3389];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      _id: `net-log-${i}`,
      timestamp: new Date(Date.now() - i * 7200000).toISOString(),
      src_ip: ip || '192.168.1.100',
      dest_ip: ip ? '10.0.0.1' : ip,
      src_port: Math.floor(Math.random() * 60000) + 1024,
      dest_port: ports[Math.floor(Math.random() * ports.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      action: Math.random() > 0.6 ? 'ALLOW' : 'DENY',
      bytes_sent: Math.floor(Math.random() * 10000),
      bytes_received: Math.floor(Math.random() * 10000)
    });
  }
  
  return logs;
}
