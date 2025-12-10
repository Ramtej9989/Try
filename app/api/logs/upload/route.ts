import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can upload logs' },
        { status: 401 }
      );
    }

    // Extract form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const logType = formData.get('type') as string;

    if (!file || !logType) {
      return NextResponse.json(
        { error: 'File and log type are required' },
        { status: 400 }
      );
    }

    // Convert file to FormData for API call
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    // Determine endpoint based on log type
    let endpoint;
    switch (logType) {
      case 'network':
        endpoint = '/api/ingestion/upload/network_logs';
        break;
      case 'auth':
        endpoint = '/api/ingestion/upload/auth_logs';
        break;
      case 'assets':
        endpoint = '/api/ingestion/upload/assets';
        break;
      case 'threat_intel':
        endpoint = '/api/ingestion/upload/threat_intel';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid log type' },
          { status: 400 }
        );
    }

    // Forward request to backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
      apiFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Log upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload log file' },
      { status: 500 }
    );
  }
}
