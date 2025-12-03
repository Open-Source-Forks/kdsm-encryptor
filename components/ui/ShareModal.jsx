import { useState, useMemo, useCallback } from "react";
import { Modal } from "@/components/ui/chats/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Instagram,
  Copy,
  Check,
  Clock,
  Lock,
  LogIn,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { createSharedMessage } from "@/lib/shareEncryptedMsgs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ShareModal = ({ isOpen, onClose, encryptedMessage, encryptionKey }) => {
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiryDuration, setExpiryDuration] = useState(300);
  const { user, loading } = useAuth();

  // Define expiry duration options
  const expiryOptions = useMemo(
    () => [
      { label: "5 minutes", value: 300, enabled: true },
      { label: "10 minutes", value: 600, enabled: true },
      { label: "30 minutes", value: 1800, enabled: false },
      { label: "1 hour", value: 3600, enabled: false },
      { label: "10 hours", value: 36000, enabled: false },
      { label: "1 day", value: 86400, enabled: false },
    ],
    []
  );

  // Memoized share message without encryption key
  const shareMessage = useMemo(() => {
    if (!shareUrl) return "";
    const baseMessage = `🔐 Try decrypting this message using KDSM Encryptor!\n\n✨ Click the link below to decrypt:\n${shareUrl}\n\n🚀 Secure. Simple. Powerful.\n\n#KDSMEncryptor #Encryption #Security`;
    return baseMessage;
  }, [shareUrl]);

  // Memoized platform configurations
  const platforms = useMemo(
    () => [
      {
        name: "WhatsApp",
        icon: MessageCircle,
        color: "bg-green-500 hover:bg-green-600",
        url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
        description: "Share via WhatsApp",
      },
      {
        name: "X (Twitter)",
        icon: Send,
        color: "bg-black hover:bg-gray-800",
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareMessage
        )}`,
        description: "Share on X",
      },
      {
        name: "Telegram",
        icon: Send,
        color: "bg-blue-500 hover:bg-blue-600",
        url: `https://t.me/share/url?text=${encodeURIComponent(shareMessage)}`,
        description: "Share on Telegram",
      },
      {
        name: "Instagram",
        icon: Instagram,
        color:
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        url: null, // Instagram doesn't support direct URL sharing
        description: "Copy for Instagram",
      },
    ],
    [shareMessage]
  );

  // Generate shareable link
  const generateShareLink = useCallback(async () => {
    if (!user?.$id) {
      toast.error("Authentication Required", {
        description: "Please log in to generate a shareable link",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createSharedMessage(
        encryptedMessage,
        encryptionKey,
        expiryDuration
      );

      setShareUrl(result.shareUrl);
      toast.success("Link Generated", {
        description: `Your link will expire in ${
          expiryOptions.find((opt) => opt.value === expiryDuration)?.label
        }`,
      });
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error("Failed to Generate Link", {
        description: error.message || "Could not create shareable link",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [user, encryptedMessage, encryptionKey, expiryDuration, expiryOptions]);

  // Handle platform share with optimized copy functionality
  const handleShare = useCallback(
    async (platform) => {
      if (!shareUrl) {
        toast.error("No Link", {
          description: "Please generate a shareable link first",
        });
        return;
      }

      try {
        if (platform.url) {
          // Open social media platform
          window.open(platform.url, "_blank", "noopener,noreferrer");
          toast.success("Redirected", {
            description: `Opened ${platform.name} to share your encrypted message`,
          });
        } else {
          // Copy to clipboard for platforms without direct URL support
          await navigator.clipboard.writeText(shareMessage);
          setCopiedPlatform(platform.name);

          setTimeout(() => {
            setCopiedPlatform(null);
          }, 2000);

          toast.success("Copied", {
            description: `Message copied for ${platform.name}. Paste it manually!`,
          });
        }
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Share Failed", {
          description: `Could not share to ${platform.name}`,
        });
      }
    },
    [shareMessage, shareUrl]
  );

  // Copy entire message to clipboard
  const copyMessage = useCallback(async () => {
    if (!shareUrl) {
      toast.error("No Link", {
        description: "Please generate a shareable link first",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedPlatform("clipboard");

      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);

      toast.success("Copied", {
        description: "Share message copied to clipboard",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Copy Failed", {
        description: "Could not copy message to clipboard",
      });
    }
  }, [shareMessage, shareUrl]);

  // Copy direct URL
  const copyUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("URL Copied", {
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      console.error("Copy URL error:", error);
      toast.error("Copy Failed", {
        description: "Could not copy URL to clipboard",
      });
    }
  }, [shareUrl]);

  // If not logged in, show login prompt
  if (!loading && !user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-orange-500" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              You need to be logged in to generate shareable links for your
              encrypted messages
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onClose();
                window.location.href = "/auth/login";
              }}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Send className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">
            Share Encrypted Message
          </h2>
          <p className="text-muted-foreground">
            Generate a secure link to share your encrypted message
          </p>
        </div>

        {/* Expiry Duration Selection */}
        {!shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Link Expiry Duration
            </label>
            <Select
              value={expiryDuration.toString()}
              onValueChange={(value) => setExpiryDuration(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select expiry duration" />
              </SelectTrigger>
              <SelectContent>
                {expiryOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    disabled={!option.enabled}
                  >
                    {option.label} {!option.enabled && "(Coming Soon)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The link will automatically expire after the selected duration
            </p>
          </motion.div>
        )}

        {/* Generate Link Button */}
        {!shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Generate Shareable Link
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Share URL Display */}
        {shareUrl && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  ✓ Link Generated Successfully
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background rounded p-2 flex-1 overflow-x-auto">
                    {shareUrl}
                  </code>
                  <Button
                    onClick={copyUrl}
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-muted/50 rounded-lg border"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Share Message Preview:
              </p>
              <div className="text-xs bg-background rounded p-3 border max-h-32 overflow-y-auto font-tomorrow">
                {shareMessage}
              </div>
            </motion.div>
          </>
        )}

        {/* Platform Buttons */}
        {shareUrl && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    onClick={() => handleShare(platform)}
                    className={`w-full h-12 ${platform.color} text-white relative overflow-hidden group`}
                    variant="ghost"
                  >
                    <div className="flex items-center gap-2">
                      <platform.icon className="w-5 h-5" />
                      <span className="font-medium">{platform.name}</span>
                    </div>

                    {/* Success indicator */}
                    {copiedPlatform === platform.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-green-500 flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Copy Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={copyMessage}
                variant="outline"
                className="w-full h-12 border-dashed border-2 hover:border-solid transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  {copiedPlatform === "clipboard" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>Copy Share Message</span>
                </div>
              </Button>
            </motion.div>
          </>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shareUrl ? 0.7 : 0.4 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            {shareUrl
              ? "Recipients can click the link to instantly decrypt your message"
              : "Your link will be secure and expire automatically"}
          </p>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ShareModal;
