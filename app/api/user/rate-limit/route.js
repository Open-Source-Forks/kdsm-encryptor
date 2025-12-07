import { NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/apiKeyManager';
import { getUserFromSession } from '@/lib/appwrite/kdsm';

export async function GET(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rateLimitStatus = await ApiKeyManager.getRateLimitStatus(user.$id);
    
    return NextResponse.json({
      success: true,
      data: rateLimitStatus
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rate limit status' },
      { status: 500 }
    );
  }
}