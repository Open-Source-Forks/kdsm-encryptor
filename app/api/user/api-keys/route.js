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

    const apiKeys = await ApiKeyManager.getUserApiKeys(user.$id);
    
    return NextResponse.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { keyName } = await request.json();
    
    if (!keyName || keyName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Key name is required' },
        { status: 400 }
      );
    }

    const newApiKey = await ApiKeyManager.createApiKey(user.$id, keyName.trim());
    
    return NextResponse.json({
      success: true,
      data: newApiKey
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}