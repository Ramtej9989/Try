import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

export async function GET(request: NextRequest) {
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
    const entityType = searchParams.get('entityType');
    const minScore = searchParams.get('minScore') || '0';
    const limit = searchParams.get('limit') || '100';
    const skip = searchParams.get('skip') || '0';
    
    // Build query string
    let queryString = `?api_key=${process.env.NEXT_PUBLIC_API_KEY}&limit=${limit}&skip=${skip}&min_score=${minScore}`;
    if (entityType) queryString += `&entity_type=${entityType}`;

    // Forward request to backend API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/risk/scores${queryString}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Entity risk retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve entity risk scores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can calculate risk scores' },
        { status: 401 }
      );
    }

    // Get request body
    const { entityType } = await request.json();

    // Build query string
    let queryString = `?api_key=${process.env.NEXT_PUBLIC_API_KEY}`;
    if (entityType) queryString += `&entity_type=${entityType}`;

    // Forward request to backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/risk/calculate${queryString}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Risk calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk scores' },
      { status: 500 }
    );
  }
}
