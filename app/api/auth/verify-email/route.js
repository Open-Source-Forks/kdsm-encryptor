import { NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

// Create email verification endpoint
export async function POST(request) {
  try {
    const { action = 'create', secret, userId } = await request.json();
    
    // Get session from cookies
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId && action === 'create') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Initialize client
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id);
    
    const account = new Account(client);
    
    if (action === 'create') {
      // Set session for authenticated requests
      client.setSession(sessionId);
      
      // Create email verification
      const verification = await account.createVerification(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email`
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Verification email sent successfully',
        verification
      });
      
    } else if (action === 'confirm') {
      // Confirm email verification
      if (!secret || !userId) {
        return NextResponse.json(
          { success: false, error: 'Secret and userId are required for confirmation' },
          { status: 400 }
        );
      }
      
      const verification = await account.updateVerification(userId, secret);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email verified successfully',
        verification
      });
      
    } else if (action === 'resend') {
      // Resend verification email
      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      client.setSession(sessionId);
      
      const verification = await account.createVerification(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email`
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Verification email resent successfully',
        verification
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Handle specific Appwrite errors
    let errorMessage = 'Email verification failed';
    let statusCode = 400;
    
    if (error.code === 401) {
      errorMessage = 'Authentication required';
      statusCode = 401;
    } else if (error.code === 404) {
      errorMessage = 'User not found';
      statusCode = 404;
    } else if (error.code === 409) {
      errorMessage = 'Email already verified';
      statusCode = 409;
    } else if (error.code === 429) {
      errorMessage = 'Too many requests. Please try again later';
      statusCode = 429;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message 
      },
      { status: statusCode }
    );
  }
}

// Get verification status
export async function GET(request) {
  try {
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Initialize client with session
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id);
    
    const account = new Account(client);
    client.setSession(sessionId);
    
    // Get user data to check verification status
    const user = await account.get();
    
    return NextResponse.json({ 
      success: true, 
      emailVerification: user.emailVerification,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification
      }
    });
    
  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check verification status' },
      { status: 401 }
    );
  }
}
