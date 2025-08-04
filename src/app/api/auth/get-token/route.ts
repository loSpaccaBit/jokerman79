import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token');

    if (!token) {
      return NextResponse.json({ token: null }, { status: 200 });
    }

    return NextResponse.json({ token: token.value });
  } catch (error) {
    console.error('Error getting secure token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}