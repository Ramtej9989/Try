import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only allow ADMIN or ANALYST roles
    if (role !== 'ADMIN' && role !== 'ANALYST') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db("soc_platform");

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      await client.close();
      return NextResponse.json(
        { error: 'User with that email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = {
      name,
      email,
      password_hash: hashedPassword,
      role,
      createdAt: new Date()
    };

    // Insert user into database
    await db.collection('users').insertOne(newUser);
    await client.close();

    // Return success without password
    const { password_hash, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
