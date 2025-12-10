// lib/api-routes.ts
export const API_ROUTES = {
  // Alert endpoints
  ALERTS: '/api/alerts',
  ALERT_DETAIL: (id: string) => `/api/alerts/${id}`,
  ALERT_STATUS: (id: string) => `/api/alerts/${id}/status`,
  
  // Upload endpoints
  UPLOAD: (type: string) => `/api/ingestion/upload/${type}`,
  
  // Detection endpoints
  RUN_DETECTION: '/api/detection/run',
  
  // Entity risk endpoints
  ENTITIES: '/api/entities',
  ENTITY_DETAIL: (type: string, id: string) => `/api/entities/${type}/${id}`,
  
  // Threat intel endpoints
  THREAT_INTEL: '/api/threat-intel'
};
