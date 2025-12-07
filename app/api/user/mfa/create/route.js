import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite/kdsm';

export async function POST(request) {
  try {
    // Get the logged-in user's session
    const { account } = await createSessionClient(request);
    
    // Create TOTP authenticator for the logged-in user
    const authenticator = await account.createMfaAuthenticator("totp");
    
    return NextResponse.json({
      success: true,
      data: {
        secret: authenticator.secret,
        uri: authenticator.uri,
      },
    });
  } catch (error) {
    console.error("Error creating MFA authenticator:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to create MFA authenticator"
    }, { status: 500 });
  }
}

