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
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '100';
    const skip = searchParams.get('skip') || '0';
    
    // Build query string
    let queryString = `?api_key=${process.env.NEXT_PUBLIC_API_KEY}&limit=${limit}&skip=${skip}`;
    if (severity) queryString += `&severity=${severity}`;
    if (status) queryString += `&status=${status}`;

    // Forward request to backend API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/detection/alerts${queryString}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Alert retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { alertId, status } = await request.json();
    
    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'Alert ID and status are required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/detection/alerts/${alertId}/status?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
      { status }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Alert update error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert status' },
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
        { error: 'Unauthorized: Only admins can run detection' },
        { status: 401 }
      );
    }

    // Get request body
    const { hoursBack = 24 } = await request.json();

    // Forward request to backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/detection/run?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
      { hours_back: hoursBack }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Detection run error:', error);
    return NextResponse.json(
      { error: 'Failed to run detection' },
      { status: 500 }
    );
  }
}
