import { NextResponse } from "next/server";
import { Client, Account, Databases } from "node-appwrite";
import { collections, config } from "@/lib/appwrite/kdsm";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const account = new Account(client);
// Login route
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create email session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Get user details with the new session
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(session.secret);
    
    const sessionAccount = new Account(sessionClient);
    const databases = new Databases(client);
    const user = await sessionAccount.get();
    await databases.updateDocument(
      config.database,
      collections.users,
      user.$id,
      { lastLogin: new Date().toISOString() }
    );
    // Set the session cookie
    const response = NextResponse.json({ 
      success: true, 
      session,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        registration: user.registration
      },
      message: !user.emailVerification ? "Please verify your email address" : "Login successful"
    });
    
    response.cookies.set("kdsm-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      expires: new Date(session.expire),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    
    let errorMessage = "Authentication failed";
    let statusCode = 401;
    
    if (error.code === 401) {
      errorMessage = "Invalid email or password";
    } else if (error.code === 429) {
      errorMessage = "Too many login attempts. Please try again later";
      statusCode = 429;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
// Logout route
export async function DELETE(request) {
  try {
    const sessionToken = request.cookies.get("kdsm-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Create a client with the session token for user-specific operations
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const sessionAccount = new Account(sessionClient);
    
    // Delete the current session
    await sessionAccount.deleteSession('current');

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("kdsm-session", {
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session deletion error:", error);
    
    // Even if session deletion fails, clear the cookie
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out locally" 
    });
    response.cookies.delete("kdsm-session", {
      path: "/",
    });
    
    return response;
  }
}
// Verify session route
export async function GET(request) {
  try {
    const sessionToken = request.cookies.get("kdsm-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Create session client
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const sessionAccount = new Account(sessionClient);
    const user = await sessionAccount.get();

    return NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        registration: user.registration,
        status: user.status,
        labels: user.labels
      },
      session: {
        isValid: true,
        requiresVerification: !user.emailVerification
      }
    });
  } catch (error) {
    console.error("Session verification error:", error);
    
    // Clear invalid session cookie
    const response = NextResponse.json(
      { success: false, error: "Invalid or expired session" },
      { status: 401 }
    );
    
    response.cookies.delete("kdsm-session", {
      path: "/",
    });
    
    return response;
  }
}
