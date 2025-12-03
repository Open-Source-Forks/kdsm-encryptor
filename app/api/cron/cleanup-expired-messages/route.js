import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { config, collections } from "@/lib/appwrite/kdsm";

/**
 * CRON job to cleanup expired shared messages
 * This endpoint should be called periodically by Vercel Cron
 */
export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Fetch all shared messages
    const response = await databases.listDocuments(
      config.database,
      collections.share_encrypted_messages,
      [Query.orderAsc("$createdAt"), Query.limit(100)] // Process in batches
    );

    let deletedCount = 0;
    let checkedCount = 0;
    const now = new Date();

    // Check each message for expiration
    for (const doc of response.documents) {
      checkedCount++;
      
      const createdAt = new Date(doc.$createdAt);
      const expiresAt = new Date(
        createdAt.getTime() + doc.expire_seconds * 1000
      );

      // If expired, delete it
      if (now > expiresAt) {
        try {
          await databases.deleteDocument(
            config.database,
            collections.share_encrypted_messages,
            doc.$id
          );
          deletedCount++;
          console.log(`Deleted expired message: ${doc.message_slug}`);
        } catch (deleteError) {
          console.error(
            `Failed to delete message ${doc.message_slug}:`,
            deleteError
          );
        }
      }
    }

    const result = {
      success: true,
      message: `Cleanup completed successfully`,
      stats: {
        checked: checkedCount,
        deleted: deletedCount,
        remaining: checkedCount - deletedCount,
        timestamp: new Date().toISOString(),
      },
    };

    console.log("Cleanup results:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cleanup cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cleanup expired messages",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request) {
  return GET(request);
}
