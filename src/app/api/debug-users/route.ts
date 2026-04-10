import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        email: true,
        displayName: true,
        role: true,
        password: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
