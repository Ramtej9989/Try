import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '100';
    const skip = searchParams.get('skip') || '0';
    
    // Determine endpoint based on log type
    let endpoint;
    switch (params.type) {
      case 'network':
        endpoint = '/api/ingestion/logs/network';
        break;
      case 'auth':
        endpoint = '/api/ingestion/logs/auth';
        break;
      case 'assets':
        endpoint = '/api/ingestion/assets';
        break;
      case 'threat_intel':
        endpoint = '/api/ingestion/threat_intel';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid log type' },
          { status: 400 }
        );
    }

    // Forward request to backend API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?api_key=${process.env.NEXT_PUBLIC_API_KEY}&limit=${limit}&skip=${skip}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Log retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}
