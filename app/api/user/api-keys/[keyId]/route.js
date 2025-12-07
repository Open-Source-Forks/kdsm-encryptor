import { NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/apiKeyManager';
import { getUserFromSession } from '@/lib/appwrite/kdsm';

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { keyId } = await params;
    
    await ApiKeyManager.deleteApiKey(keyId, user.$id);
    
    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}