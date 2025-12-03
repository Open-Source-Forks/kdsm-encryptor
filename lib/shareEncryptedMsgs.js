/**
 * Create a new shared encrypted message via API (Not used)
 * @param {string} encryptedMessage - The encrypted message content
 * @param {string} encryptionKey - The key used for encryption
 * @param {number} expireSeconds - Time in seconds until message expires (300-86400)
 * @returns {Promise<{slug: string, shareUrl: string}>} The generated slug and full share URL
 */
export async function createSharedMessage(
  encryptedMessage,
  encryptionKey,
  expireSeconds = 300
) {
  try {
    const response = await fetch("/api/shared-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encryptedMessage,
        encryptionKey,
        expireSeconds,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to create shared message");
    }

    return result.data;
  } catch (error) {
    console.error("Error creating shared message:", error);
    throw new Error(error.message || "Failed to create shared message");
  }
}

/**
 * Retrieve a shared encrypted message by slug via API
 * @param {string} slug - The 10-character message slug
 * @returns {Promise<{encMessage: string, actualKey: string, isExpired: boolean}>}
 */
export async function getSharedMessage(slug) {
  try {
    if (!slug || slug.length !== 10) {
      throw new Error("Invalid message slug");
    }

    const response = await fetch(`/api/shared-messages/${slug}`, {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to retrieve message");
    }

    return result.data;
  } catch (error) {
    console.error("Error retrieving shared message:", error);
    throw new Error(error.message || "Failed to retrieve message");
  }
}

/**
 * Delete a shared encrypted message by slug via API
 * @param {string} slug - The 10-character message slug
 * @returns {Promise<void>}
 */
export async function deleteSharedMessage(slug) {
  try {
    const response = await fetch(`/api/shared-messages/${slug}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to delete message");
    }
  } catch (error) {
    console.error("Error deleting shared message:", error);
    throw new Error(error.message || "Failed to delete message");
  }
}

/**
 * Get all shared messages for the logged-in user via API
 * @returns {Promise<Array>} List of user's shared messages
 */
export async function getUserSharedMessages() {
  try {
    const response = await fetch("/api/shared-messages", {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to get user messages");
    }

    return result.data;
  } catch (error) {
    console.error("Error getting user shared messages:", error);
    throw new Error(error.message || "Failed to get user messages");
  }
}
