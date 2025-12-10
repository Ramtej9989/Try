/**
 * Threat intelligence related types for the Enterprise Cyber Threat Intelligence & SOC Analytics Platform
 */

// Threat indicator types
export type ThreatIndicatorType = 'IP' | 'DOMAIN' | 'URL' | 'HASH' | 'EMAIL';

// Threat intelligence indicator structure from threat_intel.csv
export interface ThreatIntelIndicator {
  _id?: string;
  indicator: string;
  type: ThreatIndicatorType;
  threat_level: number;
  source: string;
  first_seen: string;
  last_seen: string;
  tags?: string[];
  description?: string;
}

// Threat intelligence search parameters
export interface ThreatIntelSearchParams {
  indicator?: string;
  type?: ThreatIndicatorType;
  min_threat_level?: number;
  max_threat_level?: number;
  source?: string;
  tag?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  skip?: number;
}

// Threat intelligence query response structure
export interface ThreatIntelQueryResponse {
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  threat_intel: ThreatIntelIndicator[];
}

// Threat intelligence source definition
export interface ThreatIntelSource {
  id: string;
  name: string;
  description: string;
  url?: string;
  type: 'MANUAL' | 'API' | 'FEED' | 'OSINT';
  active: boolean;
  update_frequency?: number; // In hours
  last_updated?: string;
  api_key?: string;
  config?: Record<string, any>;
}

// Threat intelligence statistics
export interface ThreatIntelStatistics {
  total: number;
  distribution: {
    critical: number; // Threat level 9-10
    high: number;     // Threat level 7-8
    medium: number;   // Threat level 4-6
    low: number;      // Threat level 1-3
  };
  byType: Record<ThreatIndicatorType, number>;
  bySource: Record<string, number>;
  recentlyAdded: number;
}

// Threat intelligence enrichment for an entity
export interface ThreatIntelEnrichment {
  entity: string;
  entity_type: string;
  matches: ThreatIntelIndicator[];
  highest_threat_level: number;
  sources: string[];
}

// Threat feed configuration
export interface ThreatFeedConfig {
  id: string;
  name: string;
  url: string;
  format: 'CSV' | 'JSON' | 'STIX' | 'TAXII';
  auth_required: boolean;
  auth_type?: 'API_KEY' | 'BASIC' | 'BEARER' | 'CUSTOM';
  credentials?: Record<string, string>;
  enabled: boolean;
  update_interval: number; // In hours
  indicator_mapping: Record<string, string>;
}
