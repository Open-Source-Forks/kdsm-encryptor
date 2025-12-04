import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { config, collections } from "@/lib/appwrite/kdsm";

/**
 * CRON job to cleanup expired shared messages
 * This endpoint should be called periodically by GitHub Actions
 */
export async function GET(request) {
  console.log("[CRON] Cleanup job started at:", new Date().toISOString());
  
  try {
    // Verify the request is from GitHub Actions (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    console.log("[CRON] Auth header present:", !!authHeader);
    console.log("[CRON] CRON_SECRET configured:", !!process.env.CRON_SECRET);
    
    if (authHeader !== expectedAuth) {
      console.error("[CRON] Unauthorized access attempt");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("[CRON] Authorization successful");

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Fetch all shared messages
    console.log("[CRON] Fetching shared messages...");
    const response = await databases.listDocuments(
      config.database,
      collections.share_encrypted_messages,
      [Query.orderAsc("$createdAt"), Query.limit(100)] // Process in batches
    );

    console.log(`[CRON] Found ${response.documents.length} messages to check`);

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
        console.log(`[CRON] Deleting expired message: ${doc.message_slug} (expired: ${expiresAt.toISOString()})`);
        try {
          await databases.deleteDocument(
            config.database,
            collections.share_encrypted_messages,
            doc.$id
          );
          deletedCount++;
          console.log(`[CRON] ✓ Deleted message: ${doc.message_slug}`);
        } catch (deleteError) {
          console.error(
            `[CRON] ✗ Failed to delete message ${doc.message_slug}:`,
            deleteError
          );
        }
      } else {
        console.log(`[CRON] Message ${doc.message_slug} not expired yet (expires: ${expiresAt.toISOString()})`);
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

    console.log("[CRON] Cleanup completed:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON] Cleanup cron job error:", error);
    console.error("[CRON] Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cleanup expired messages",
        details: {
          code: error.code,
          type: error.type,
        }
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request) {
  return GET(request);
}
