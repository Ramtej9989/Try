/**
 * Entity-related types for the Enterprise Cyber Threat Intelligence & SOC Analytics Platform
 */

// Entity types
export type EntityType = 'USER' | 'IP' | 'HOST';

// Risk factor contributing to risk score
export interface RiskFactor {
  factor: string;
  score: number;
  details: string;
}

// Asset data structure from assets.csv
export interface Asset {
  _id?: string;
  host: string;
  ip_address: string;
  owner: string;
  criticality: number;
}

// Basic entity risk score structure
export interface EntityRiskScore {
  _id: string;
  entity_id: string;
  entity_type: EntityType;
  risk_score: number;
  risk_factors: RiskFactor[];
  last_updated: string;
}

// Extended entity details with additional data
export interface EntityDetail {
  entity_id: string;
  entity_type: EntityType;
  risk_score: number;
  risk_factors: RiskFactor[];
  last_updated: string;
  additional_data?: {
    auth_logs?: any[];
    network_logs?: any[];
    threat_intel?: any;
    asset?: Asset;
  };
}

// Entity search parameters
export interface EntitySearchParams {
  entity_type?: EntityType;
  min_score?: number;
  max_score?: number;
  risk_factor?: string;
  limit?: number;
  skip?: number;
}

// Entity query response structure
export interface EntityQueryResponse {
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  scores: EntityRiskScore[];
}

// Risk recalculation request
export interface RiskRecalculationRequest {
  entity_type?: EntityType;
  entity_id?: string;
  force?: boolean;
}

// Risk recalculation response
export interface RiskRecalculationResponse {
  message: string;
  timestamp: string;
  entities_processed: number;
  execution_time_ms: number;
}

// Risk score thresholds
export const RISK_THRESHOLDS = {
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
  CRITICAL: 9
};

// Risk factor types
export type RiskFactorType = 
  'SUSPICIOUS_AUTH' | 
  'FAILED_LOGIN' | 
  'KNOWN_THREAT_ACTOR' | 
  'UNUSUAL_BEHAVIOR' | 
  'CRITICAL_ASSET' | 
  'DETECTED_ATTACK' | 
  'PRIVILEGED_ACCESS';
