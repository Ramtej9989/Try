/**
 * Alert-related types for the Enterprise Cyber Threat Intelligence & SOC Analytics Platform
 */

// Alert severity levels
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Alert status options
export type AlertStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';

// MITRE ATT&CK Framework tactics
export type MitreTactic = 
  'INITIAL_ACCESS' | 'EXECUTION' | 'PERSISTENCE' | 'PRIVILEGE_ESCALATION' | 
  'DEFENSE_EVASION' | 'CREDENTIAL_ACCESS' | 'DISCOVERY' | 'LATERAL_MOVEMENT' | 
  'COLLECTION' | 'COMMAND_AND_CONTROL' | 'EXFILTRATION' | 'IMPACT';

// Alert entity type
export interface AlertEntity {
  type: string;
  value: string;
}

// Basic alert structure
export interface Alert {
  _id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source_log_id?: string;
  log_type?: string;
  entities?: AlertEntity[];
  tactic?: MitreTactic;
  technique?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

// Alert search parameters
export interface AlertSearchParams {
  severity?: AlertSeverity;
  status?: AlertStatus;
  tactic?: MitreTactic;
  technique?: string;
  entity_type?: string;
  entity_value?: string;
  start_time?: string;
  end_time?: string;
  limit?: number;
  skip?: number;
}

// Alert status update request
export interface AlertStatusUpdateRequest {
  alertId: string;
  status: AlertStatus;
  comment?: string;
}

// Alert query response structure
export interface AlertQueryResponse {
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  alerts: Alert[];
}

// Alert statistics structure
export interface AlertStatistics {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byTactic?: Record<string, number>;
  timeDistribution: {
    interval: string;
    data: {
      timestamp: string;
      count: number;
    }[];
  };
}

// Detection rule structure
export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  tactic?: MitreTactic;
  technique?: string;
  conditions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Detection run results
export interface DetectionResults {
  message: string;
  timestamp: string;
  auth_alerts: number;
  network_alerts: number;
  threat_intel_alerts: number;
  total_alerts: number;
  execution_time_ms: number;
}
