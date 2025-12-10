import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Base API URL for the FastAPI backend
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API key for authentication with the backend API
 */
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your-secret-key-for-api-auth';

/**
 * Formats error messages from API responses
 */
export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;
    
    if (responseData?.detail) {
      return responseData.detail;
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  return 'An unexpected error occurred';
}

/**
 * Makes an API request to the backend service
 */
export async function apiRequest<T>(
  method: string, 
  endpoint: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add API key to all requests
    const headers = {
      ...config?.headers,
    };
    
    // Add query parameter for API key
    const params = {
      ...config?.params,
      api_key: API_KEY
    };
    
    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers,
      params,
    };

    let response: AxiosResponse;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(url, requestConfig);
        break;
      case 'POST':
        response = await axios.post(url, data, requestConfig);
        break;
      case 'PUT':
        response = await axios.put(url, data, requestConfig);
        break;
      case 'DELETE':
        response = await axios.delete(url, requestConfig);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data as T;
  } catch (error) {
    throw error;
  }
}

/**
 * Middleware helper to authenticate API routes
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, token: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = await getToken({ req });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return await handler(req, token);
}

/**
 * Middleware helper to authenticate API routes and require admin role
 */
export async function withAdminAuth(
  req: NextRequest,
  handler: (req: NextRequest, token: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = await getToken({ req });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (token.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }
  
  return await handler(req, token);
}
