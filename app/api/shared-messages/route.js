import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";
import { config, collections, getUserFromSession } from "@/lib/appwrite/kdsm";

/**
 * Generate a cryptographically secure 10-character slug
 */
function generateMessageSlug() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

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

    const { encryptedMessage, encryptionKey, expireSeconds, hangman, tries } =
      await request.json();

    // Validate inputs
    if (!encryptedMessage || encryptedMessage.length > 15000) {
      return NextResponse.json(
        { success: false, error: "Invalid encrypted message length" },
        { status: 400 }
      );
    }

    if (!encryptionKey || encryptionKey.length > 200) {
      return NextResponse.json(
        { success: false, error: "Invalid encryption key length" },
        { status: 400 }
      );
    }

    const expiry = parseInt(expireSeconds) || 300;
    if (expiry < 300 || expiry > 86400) {
      return NextResponse.json(
        { success: false, error: "Expire seconds must be between 300 and 86400" },
        { status: 400 }
      );
    }

    // Validate hangman and tries
    const enableHangman = Boolean(hangman);
    const hangmanTries = parseInt(tries) || -1;
    
    if (enableHangman && hangmanTries !== -1) {
      if (hangmanTries < 6 || hangmanTries > 10) {
        return NextResponse.json(
          { success: false, error: "Tries must be -1 (infinite) or between 6 and 10" },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    const slug = generateMessageSlug();

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Create document in Appwrite
    const document = await databases.createDocument(
      config.database,
      collections.share_encrypted_messages,
      ID.unique(),
      {
        message_slug: slug,
        enc_message: encryptedMessage,
        actual_key: encryptionKey,
        expire_seconds: expiry,
        userId: user.$id,
        hangman: enableHangman,
        tries: hangmanTries,
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
        expireSeconds: doc.expire_seconds,
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
