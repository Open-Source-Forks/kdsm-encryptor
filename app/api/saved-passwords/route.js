import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";
import { config, collections, getUserFromSession } from "@/lib/appwrite/kdsm";

/**
 * POST - Create a new shared encrypted message
 */
export async function POST(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password, email, username, platformName } =
      await request.json();

    // Validate inputs
    if (!password || password.length > 30 || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Invalid password length" },
        { status: 400 }
      );
    }

    if (!email || email.length > 100 || email.length < 5) {
      return NextResponse.json(
        { success: false, error: "Invalid email length" },
        { status: 400 }
      );
    }

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Create document in Appwrite
    const document = await databases.createDocument(
      config.database,
      collections.savedPasswords,
      ID.unique(),
      {
        userId: user.$id,
        username,
        email,
        platformName,
        password,
      }
    );

    // Generate share URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://kdsm.tech";
    const shareUrl = `${baseUrl}/encryptor/shared/${slug}`;

    return NextResponse.json({
      success: true,
      data: {
        slug,
        shareUrl,
        documentId: document.$id,
        expiresAt: new Date(
          new Date(document.$createdAt).getTime() + expiry * 1000
        ).toISOString(),
      },
    });
  } catch (error) {
    console.error("Create shared message error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create shared message" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all shared messages for the logged-in user
 */
export async function GET(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    const response = await databases.listDocuments(
      config.database,
      collections.share_encrypted_messages,
      [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
    );

    const messages = response.documents.map((doc) => {
      const createdAt = new Date(doc.$createdAt);
      const expiresAt = new Date(
        createdAt.getTime() + doc.expire_seconds * 1000
      );
      const isExpired = new Date() > expiresAt;

      return {
        id: doc.$id,
        slug: doc.message_slug,
        isExpired,
        createdAt: doc.$createdAt,
        expiresAt: expiresAt.toISOString(),
        username: doc.username,
      };
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get shared messages error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get shared messages" },
      { status: 500 }
    );
  }
}
