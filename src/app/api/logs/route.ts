import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    
    // Validate log entry
    if (!logEntry.message || !logEntry.level) {
      return NextResponse.json({ error: 'Invalid log entry' }, { status: 400 });
    }

    // In production, send to your monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry or another monitoring service
      // await sendToMonitoringService(logEntry);
      
      // For now, we'll just log server-side (replace with your monitoring solution)
      console.error('Client Error:', {
        ...logEntry,
        timestamp: new Date().toISOString(),
        server: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process log entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}