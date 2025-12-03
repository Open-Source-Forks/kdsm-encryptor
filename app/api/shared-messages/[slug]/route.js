import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { config, collections } from "@/lib/appwrite/kdsm";

/**
 * GET - Retrieve a shared encrypted message by slug
 */
export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug || slug.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid message slug" },
        { status: 400 }
      );
    }

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Query for the document with matching slug
    const response = await databases.listDocuments(
      config.database,
      collections.share_encrypted_messages,
      [Query.equal("message_slug", slug), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    const document = response.documents[0];

    // Check if message has expired
    const createdAt = new Date(document.$createdAt);
    const expiresAt = new Date(
      createdAt.getTime() + document.expire_seconds * 1000
    );
    const isExpired = new Date() > expiresAt;

    // If expired, delete the document
    if (isExpired) {
      await databases.deleteDocument(
        config.database,
        collections.share_encrypted_messages,
        document.$id
      );
      
      return NextResponse.json(
        { success: false, error: "Message has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        encMessage: document.enc_message,
        actualKey: document.actual_key,
        isExpired: false,
        expiresAt: expiresAt.toISOString(),
        createdAt: document.$createdAt,
      },
    });
  } catch (error) {
    console.error("Get shared message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve message",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a shared encrypted message by slug
 */
export async function DELETE(request, { params }) {
  try {
    const { slug } = params;

    if (!slug || slug.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid message slug" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // Query for the document with matching slug
    const response = await databases.listDocuments(
      config.database,
      collections.share_encrypted_messages,
      [Query.equal("message_slug", slug), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    const document = response.documents[0];

    // Delete the document
    await databases.deleteDocument(
      config.database,
      collections.share_encrypted_messages,
      document.$id
    );

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete shared message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
