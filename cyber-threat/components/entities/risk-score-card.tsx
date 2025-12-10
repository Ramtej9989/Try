'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getSeverityBgColor, formatDate } from '@/lib/utils';

interface RiskFactor {
  factor: string;
  score: number;
  details: string;
}

export interface EntityDetail {
  entity_id: string;
  entity_type: 'USER' | 'IP' | 'HOST';
  risk_score: number;
  risk_factors: RiskFactor[];
  last_updated: string;
  additional_data?: {
    auth_logs?: any[];
    network_logs?: any[];
    threat_intel?: any;
    asset?: any;
  };
}

interface RiskScoreCardProps {
  entity: EntityDetail | null;
  isLoading?: boolean;
}

export default function RiskScoreCard({ entity, isLoading = false }: RiskScoreCardProps) {
  // Get risk score color based on score
  const getRiskScoreColor = (score: number) => {
    if (score >= 9) return 'text-red-600';
    if (score >= 7) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get risk factor color based on score
  const getRiskFactorColor = (score: number) => {
    if (score >= 3) return 'bg-red-50 border-red-200';
    if (score >= 2) return 'bg-orange-50 border-orange-200';
    if (score >= 1) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  // Get entity type icon and color
  const getEntityTypeInfo = (type: string) => {
    switch(type) {
      case 'USER':
        return { 
          icon: '👤', 
          color: 'bg-blue-50 text-blue-800',
          label: 'User'
        };
      case 'IP':
        return { 
          icon: '🌐', 
          color: 'bg-purple-50 text-purple-800',
          label: 'IP Address'
        };
      case 'HOST':
        return { 
          icon: '💻', 
          color: 'bg-green-50 text-green-800',
          label: 'Host'
        };
      default:
        return { 
          icon: '❓', 
          color: 'bg-gray-50 text-gray-800',
          label: 'Unknown'
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entity Risk Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entity Risk Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Select an entity to view risk details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const entityTypeInfo = getEntityTypeInfo(entity.entity_type);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xl flex items-center">
            <span className="mr-2">{entityTypeInfo.icon}</span>
            {entity.entity_id}
          </CardTitle>
          <div className="mt-1 text-sm text-gray-500 flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${entityTypeInfo.color}`}>
              {entityTypeInfo.label}
            </span>
            <span>•</span>
            <span>Last updated: {formatDate(entity.last_updated)}</span>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getRiskScoreColor(entity.risk_score)}`}>
            {entity.risk_score.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Risk Score</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Risk Score Visualization */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Assessment</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${getSeverityBgColor(entity.risk_score)}`}
                style={{ width: `${entity.risk_score * 10}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Factors</h3>
            {entity.risk_factors.length > 0 ? (
              <div className="space-y-2">
                {entity.risk_factors.map((factor, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-md ${getRiskFactorColor(factor.score)}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{factor.factor}</span>
                      <span className={`font-medium ${getRiskScoreColor(factor.score)}`}>
                        +{factor.score.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{factor.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No risk factors identified</p>
            )}
          </div>

          {/* Entity Details Based on Type */}
          {entity.entity_type === 'USER' && entity.additional_data?.auth_logs && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Authentication Activity</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left pb-2">Time</th>
                      <th className="text-left pb-2">Source IP</th>
                      <th className="text-left pb-2">Status</th>
                      <th className="text-left pb-2">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entity.additional_data.auth_logs.slice(0, 5).map((log: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 pr-4">{formatDate(log.timestamp)}</td>
                        <td className="py-2 pr-4">{log.src_ip}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2">{log.auth_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {entity.entity_type === 'IP' && entity.additional_data?.network_logs && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Network Activity</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left pb-2">Time</th>
                      <th className="text-left pb-2">Destination</th>
                      <th className="text-left pb-2">Protocol</th>
                      <th className="text-left pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entity.additional_data.network_logs.slice(0, 5).map((log: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 pr-4">{formatDate(log.timestamp)}</td>
                        <td className="py-2 pr-4">{log.dest_ip}:{log.dest_port}</td>
                        <td className="py-2 pr-4">{log.protocol}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${log.action === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {log.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {entity.entity_type === 'IP' && entity.additional_data?.threat_intel && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Threat Intelligence</h3>
              <div className="bg-red-50 border border-red-100 rounded-md p-3">
                <div className="font-medium text-red-700 mb-2">Known Malicious IP</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Threat Level</span>
                    <span className="font-medium">{entity.additional_data.threat_intel.threat_level}/10</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Source</span>
                    <span className="font-medium">{entity.additional_data.threat_intel.source}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">First Seen</span>
                    <span className="font-medium">{formatDate(entity.additional_data.threat_intel.first_seen)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Last Seen</span>
                    <span className="font-medium">{formatDate(entity.additional_data.threat_intel.last_seen)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {entity.entity_type === 'HOST' && entity.additional_data?.asset && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Asset Information</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">IP Address</span>
                    <span className="font-medium">{entity.additional_data.asset.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Owner</span>
                    <span className="font-medium">{entity.additional_data.asset.owner}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Criticality</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{entity.additional_data.asset.criticality}/5</span>
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < entity.additional_data.asset.criticality ? 'text-red-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
