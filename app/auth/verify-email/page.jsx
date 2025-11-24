"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  // Auto-verify if URL contains verification parameters
  useEffect(() => {
    if (userId && secret) {
      handleVerification();
    }
  }, [userId, secret]);

  const handleVerification = async () => {
    if (!userId || !secret) {
      setVerificationStatus("error");
      setMessage("Invalid verification link. Missing parameters.");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("pending");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "confirm",
          userId,
          secret,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus("success");
        setMessage("Your email has been verified successfully!");
        toast.success("Email Verified!", {
          description: "Your email has been verified successfully.",
        });

        // Redirect to profile after 3 seconds
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setMessage(data.error || "Verification failed. Please try again.");
        toast.error("Verification Failed", {
          description: data.error || "Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setMessage("Network error. Please check your connection and try again.");
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "resend",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Verification Email Sent!", {
          description: "Please check your email for the verification link.",
        });
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        toast.error("Failed to Send Email", {
          description: data.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            Verifying your email address...
          </p>
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-green-600">
              Email Verified Successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            <p className="text-xs text-muted-foreground">
              Redirecting to your profile in 3 seconds...
            </p>
          </div>
          <Button 
            onClick={() => router.push("/profile")} 
            className="w-full"
          >
            Go to Profile
          </Button>
        </div>
      );
    }

    if (verificationStatus === "error") {
      return (
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-16 w-16 text-red-500" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-red-600">
              Verification Failed
            </p>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          <div className="flex flex-col space-y-2 w-full">
            <Button 
              onClick={handleResendVerification} 
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      );
    }

    // Default state when no URL parameters
    return (
      <div className="flex flex-col items-center space-y-4">
        <Mail className="h-16 w-16 text-primary" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            Email Verification Required
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your email and click the verification link, or request a new one below.
          </p>
        </div>
        <div className="flex flex-col space-y-2 w-full">
          <Button 
            onClick={handleResendVerification} 
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Verification Email
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md text-primary bg-secondary/40 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Email Verification</CardTitle>
        <CardDescription className="text-center">
          {verificationStatus === "success" 
            ? "Your email has been successfully verified"
            : verificationStatus === "error"
            ? "There was an issue verifying your email"
            : "Verify your email address to continue"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
