"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, Mail, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [step, setStep] = useState("request"); // request, reset, success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  // If URL contains reset parameters, show reset form
  useEffect(() => {
    if (userId && secret) {
      setStep("reset");
    }
  }, [userId, secret]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Reset Email Sent!", {
          description: "Please check your email for reset instructions.",
        });
        setStep("success");
      } else {
        toast.error("Failed to Send Reset Email", {
          description: data.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (password !== passwordAgain) {
      toast.error("Passwords Don't Match", {
        description: "Please make sure both passwords are identical.",
      });
      return;
    }

    if (password.length < 8) {
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "confirm",
          userId,
          secret,
          password,
          passwordAgain,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password Reset Successfully!", {
          description: "You can now log in with your new password.",
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast.error("Password Reset Failed", {
          description: data.error || "Please try again or request a new reset link.",
        });
      }
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestForm = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Reset Password
        </CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Remember your password?{" "}
          <Link href="/auth/login" className="underline">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </>
  );

  const renderResetForm = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Set New Password
        </CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              secured={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="passwordAgain" className="text-sm font-medium">
              Confirm New Password
            </label>
            <Input
              id="passwordAgain"
              type="password"
              secured={true}
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Reset Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          <Link href="/auth/login" className="underline">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </>
  );

  const renderSuccess = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
          Email Sent!
        </CardTitle>
        <CardDescription className="text-center">
          We've sent a password reset link to your email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <Mail className="h-16 w-16 text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the reset link to set a new password.
            </p>
            <p className="text-xs text-muted-foreground">
              If you don't see the email, check your spam folder.
            </p>
          </div>
          <Button 
            onClick={() => setStep("request")} 
            variant="outline"
            className="w-full"
          >
            Send Another Email
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          <Link href="/auth/login" className="underline">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </>
  );

  return (
    <Card className="w-full max-w-md text-primary bg-secondary/40 backdrop-blur-md shadow-lg">
      {step === "request" && renderRequestForm()}
      {step === "reset" && renderResetForm()}
      {step === "success" && renderSuccess()}
    </Card>
  );
}
