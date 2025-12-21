import { NextResponse } from 'next/server';
import { Client, Account, Databases } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

// Get user data using session route
export async function GET(request) {
  try {
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No active session' },
        { status: 401 }
      );
    }
    
    // Initialize client with session (not API key)
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionId);
    
    const account = new Account(client);
    const databases = new Databases(client);

    // Get user data using the session
    const user = await account.get();
    const userDoc = await databases.getDocument(
      config.database,
      config.collections.users,
      user.$id
    );
    return NextResponse.json({ 
      success: true, 
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        hashedAnswer: userDoc.hashedAnswer,
        securityQuestion: userDoc.securityQuestion,
        emailVerification: user.emailVerification,
        registration: user.registration,
        status: user.status,
        labels: user.labels,
        prefs: user.prefs
      }
    });
  } catch (error) {
    console.error('User data fetch error:', error);
    
    // Clear invalid session cookie
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 401 }
    );
    
    response.cookies.delete("kdsm-session", {
      path: "/",
    });
    
    return response;
  }
}

// Update user profile
export async function PATCH(request) {
  try {
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { name, email } = await request.json();
    
    // Initialize client with session
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionId);
    
    const account = new Account(client);
    
    // Update name if provided
    if (name) {
      await account.updateName(name);
    }
    
    // Update email if provided (will require re-verification)
    if (email) {
      await account.updateEmail(email, request.body.password || '');
    }
    
    // Get updated user data
    const updatedUser = await account.get();
    
    return NextResponse.json({ 
      success: true,
      message: email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully',
      user: {
        $id: updatedUser.$id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerification: updatedUser.emailVerification,
        registration: updatedUser.registration,
        status: updatedUser.status
      }
    });
    
  } catch (error) {
    console.error('User update error:', error);
    
    let errorMessage = 'Failed to update profile';
    let statusCode = 400;
    
    if (error.code === 401) {
      errorMessage = 'Authentication failed';
      statusCode = 401;
    } else if (error.code === 409) {
      errorMessage = 'Email already exists';
      statusCode = 409;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Change password
export async function PUT(request) {
  try {
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { oldPassword, newPassword } = await request.json();
    
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Both old and new passwords are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Initialize client with session
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionId);
    
    const account = new Account(client);
    
    // Update password
    await account.updatePassword(newPassword, oldPassword);
    
    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('Password update error:', error);
    
    let errorMessage = 'Failed to update password';
    let statusCode = 400;
    
    if (error.code === 401) {
      errorMessage = 'Current password is incorrect';
      statusCode = 401;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Delete user account
export async function DELETE(request) {
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
      .setProject(config.project_id)
      .setSession(sessionId);
    
    const account = new Account(client);
    
    // Delete user account
    await account.deleteIdentity();
    
    // Clear session cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    });
    
    response.cookies.delete("kdsm-session", {
      path: "/",
    });
    
    return response;
    
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 400 }
    );
  }
}