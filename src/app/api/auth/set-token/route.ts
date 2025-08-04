import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, maxAge = 3600, sameSite = 'strict' } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Set HTTP-only cookie with security flags
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('jwt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSite as 'strict' | 'lax' | 'none',
      maxAge: maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error setting secure token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}