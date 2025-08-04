import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the HTTP-only cookie
    response.cookies.set('jwt_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error clearing secure token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}