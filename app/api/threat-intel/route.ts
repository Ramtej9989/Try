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
    const limit = searchParams.get('limit') || '100';
    const skip = searchParams.get('skip') || '0';

    // Forward request to backend API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ingestion/threat_intel?api_key=${process.env.NEXT_PUBLIC_API_KEY}&limit=${limit}&skip=${skip}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Threat intelligence retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve threat intelligence' },
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
        { error: 'Unauthorized: Only admins can add threat intelligence' },
        { status: 401 }
      );
    }

    // Get request body
    const threatData = await request.json();

    // Forward request to backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ingestion/threat_intel?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
      threatData
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Threat intelligence upload error:', error);
    return NextResponse.json(
      { error: 'Failed to add threat intelligence' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can delete threat intelligence' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const indicator = searchParams.get('indicator');

    if (!indicator) {
      return NextResponse.json(
        { error: 'Indicator is required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ingestion/threat_intel/${indicator}?api_key=${process.env.NEXT_PUBLIC_API_KEY}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Threat intelligence deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete threat intelligence' },
      { status: 500 }
    );
  }
}
