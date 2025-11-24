import { NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

// Password recovery endpoint
export async function POST(request) {
  try {
    const { action = 'create', email, secret, userId, password, passwordAgain } = await request.json();
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id);
    
    const account = new Account(client);
    
    if (action === 'create') {
      // Create password recovery
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required' },
          { status: 400 }
        );
      }
      
      const recovery = await account.createRecovery(
        email,
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password recovery email sent successfully',
        recovery
      });
      
    } else if (action === 'confirm') {
      // Complete password recovery
      if (!secret || !userId || !password || !passwordAgain) {
        return NextResponse.json(
          { success: false, error: 'Secret, userId, password, and passwordAgain are required' },
          { status: 400 }
        );
      }
      
      if (password !== passwordAgain) {
        return NextResponse.json(
          { success: false, error: 'Passwords do not match' },
          { status: 400 }
        );
      }
      
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      
      const recovery = await account.updateRecovery(
        userId, 
        secret, 
        password, 
        passwordAgain
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset successfully',
        recovery
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Password recovery error:', error);
    
    // Handle specific Appwrite errors
    let errorMessage = 'Password recovery failed';
    let statusCode = 400;
    
    if (error.code === 404) {
      errorMessage = 'User not found';
      statusCode = 404;
    } else if (error.code === 401) {
      errorMessage = 'Invalid or expired recovery token';
      statusCode = 401;
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
