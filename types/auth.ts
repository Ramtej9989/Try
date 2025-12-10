/**
 * Authentication related types for the Enterprise Cyber Threat Intelligence & SOC Analytics Platform
 */

// User roles for role-based access control
export type UserRole = 'ADMIN' | 'ANALYST';

// User object with basic profile information
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

// Extended session type to include role information
export interface ExtendedSession {
  user: User;
  expires: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration form data
export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// API authentication result
export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

// API key structure for backend communication
export interface ApiKeyData {
  key: string;
  createdAt: string;
  createdBy: string;
  description: string;
  permissions: string[];
}

// User preferences
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  dashboardLayout: string;
  alertNotifications: boolean;
  emailNotifications: boolean;
}

// Authentication token with JWT structure
export interface AuthToken {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Permission mapping for different user roles
export const RolePermissions: Record<UserRole, string[]> = {
  ADMIN: [
    'view:dashboard', 'view:alerts', 'view:logs', 'view:entities', 
    'view:threat-intel', 'view:settings',
    'manage:users', 'manage:settings', 'manage:threat-intel',
    'upload:data', 'run:detection', 'create:reports'
  ],
  ANALYST: [
    'view:dashboard', 'view:alerts', 'view:logs', 'view:entities',
    'update:alerts'
  ]
};
