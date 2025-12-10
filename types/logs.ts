/**
 * Log-related types for the Enterprise Cyber Threat Intelligence & SOC Analytics Platform
 */

// Base log interface with common properties
export interface BaseLog {
  _id: string;
  timestamp: string;
}

// Authentication log structure from auth_logs.csv
export interface AuthLog extends BaseLog {
  username: string;
  src_ip: string;
  dest_host: string;
  status: 'SUCCESS' | 'FAILURE';
  auth_method: 'PASSWORD' | 'SSH_KEY' | 'MFA';
}

// Network log structure from network_logs.csv
export interface NetworkLog extends BaseLog {
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
  protocol: string;
  action: 'ALLOW' | 'DENY';
  bytes_sent: number;
  bytes_received: number;
  label?: 'normal' | 'attack';
}

// Log types enumeration
export type LogType = 'auth' | 'network' | 'endpoint' | 'web';

// Log search parameters
export interface LogSearchParams {
  startTime?: string;
  endTime?: string;
  limit?: number;
  skip?: number;
  sort?: 'asc' | 'desc';
}

// Authentication log search parameters
export interface AuthLogSearchParams extends LogSearchParams {
  username?: string;
  src_ip?: string;
  dest_host?: string;
  status?: string;
  auth_method?: string;
}

// Network log search parameters
export interface NetworkLogSearchParams extends LogSearchParams {
  src_ip?: string;
  dest_ip?: string;
  protocol?: string;
  action?: string;
  port?: number;
  min_bytes?: number;
  label?: string;
}

// Log query response structure
export interface LogQueryResponse<T> {
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  logs: T[];
}

// Log statistics structure
export interface LogStatistics {
  total: number;
  byStatus?: Record<string, number>;
  byProtocol?: Record<string, number>;
  byAction?: Record<string, number>;
  byAuthMethod?: Record<string, number>;
  timeDistribution: {
    interval: string;
    data: {
      timestamp: string;
      count: number;
    }[];
  };
}

// Time interval options for log analysis
export type TimeInterval = '5m' | '30m' | '1h' | '6h' | '12h' | '24h' | '7d' | '30d';

// Log summary aggregation
export interface LogSummary {
  timeRange: {
    start: string;
    end: string;
  };
  auth: {
    total: number;
    success: number;
    failure: number;
    failureRate: number;
  };
  network: {
    total: number;
    allowed: number;
    denied: number;
    denyRate: number;
    bytesTransferred: number;
    attackTraffic: number;
  };
}
