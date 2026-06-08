"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
}

export default function SocialLoginButtons({ onSuccess }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      // In a real implementation, this would use Google OAuth SDK
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful Google login
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google'
      };

      toast({
        title: "Google Login Successful",
        description: "Welcome back! You've been signed in with Google.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading('facebook');
    try {
      // Simulate Facebook login process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockFacebookUser = {
        id: 'facebook_' + Date.now(),
        name: 'Facebook User',
        email: 'user@facebook.com',
        avatar: 'https://graph.facebook.com/v12.0/me/picture?type=large',
        provider: 'facebook'
      };

      toast({
        title: "Facebook Login Successful",
        description: "Welcome back! You've been signed in with Facebook.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Facebook Login Failed",
        description: "There was an error signing in with Facebook. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleLinkedInLogin = async () => {
    setIsLoading('linkedin');
    try {
      // Simulate LinkedIn login process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockLinkedInUser = {
        id: 'linkedin_' + Date.now(),
        name: 'LinkedIn Professional',
        email: 'user@linkedin.com',
        avatar: 'https://media.licdn.com/dms/image/default-profile',
        provider: 'linkedin'
      };

      toast({
        title: "LinkedIn Login Successful",
        description: "Welcome back! You've been signed in with LinkedIn.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "LinkedIn Login Failed",
        description: "There was an error signing in with LinkedIn. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google Login */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="w-full h-12 flex items-center justify-center space-x-3 hover:bg-gray-50"
        >
          {isLoading === 'google' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </>
          )}
        </Button>

        {/* Facebook Login */}
        <Button
          variant="outline"
          onClick={handleFacebookLogin}
          disabled={isLoading !== null}
          className="w-full h-12 flex items-center justify-center space-x-3 hover:bg-gray-50"
        >
          {isLoading === 'facebook' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          ) : (
            <>
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Continue with Facebook</span>
            </>
          )}
        </Button>

        {/* LinkedIn Login */}
        <Button
          variant="outline"
          onClick={handleLinkedInLogin}
          disabled={isLoading !== null}
          className="w-full h-12 flex items-center justify-center space-x-3 hover:bg-gray-50"
        >
          {isLoading === 'linkedin' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          ) : (
            <>
              <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">Continue with LinkedIn</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
