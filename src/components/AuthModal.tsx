'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Eye, EyeOff, Mail, Phone, Lock, User, AlertCircle,
  CheckCircle, Shield, Zap, Globe, Heart
} from 'lucide-react';
import type { AuthModalProps } from '@/types/auth';

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  onSuccess,
  redirectTo
}: AuthModalProps) {
  const { login, register, resetPassword, isLoading, user } = useAuth();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    level: string;
    feedback: string[];
  }>({ score: 0, level: 'very-weak', feedback: [] });

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
    privacyAccepted: false,
    newsletter: false
  });

  // Forgot password state
  const [resetPasswordData, setResetPasswordData] = useState({
    identifier: ''
  });

  // Reset form data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setActiveTab(defaultTab);
    } else {
      // Reset forms when modal closes
      setLoginData({ identifier: '', password: '', rememberMe: false });
      setRegisterData({
        email: '', phone: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', termsAccepted: false,
        privacyAccepted: false, newsletter: false
      });
      setResetPasswordData({ identifier: '' });
    }
  }, [isOpen, defaultTab]);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const feedback = [];

    if (!requirements.length) feedback.push('At least 8 characters');
    if (!requirements.uppercase) feedback.push('One uppercase letter');
    if (!requirements.lowercase) feedback.push('One lowercase letter');
    if (!requirements.numbers) feedback.push('One number');
    if (!requirements.special) feedback.push('One special character');

    let level = 'very-weak';
    if (score >= 5) level = 'strong';
    else if (score >= 4) level = 'good';
    else if (score >= 3) level = 'fair';
    else if (score >= 2) level = 'weak';

    setPasswordStrength({
      score: (score / 5) * 100,
      level,
      feedback
    });
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginData.identifier || !loginData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await login(
        loginData.identifier,
        loginData.password
      );

      setSuccess('Login successful! Welcome back.');
      // Create a PublicUser object from the login data
      const publicUser = {
        id: 'temp-id',
        email: loginData.identifier,
        name: 'User',
        role: 'user' as const,
        verified: false,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      onSuccess?.(publicUser);
      setTimeout(() => {
        onClose();
        if (redirectTo) {
          window.location.href = redirectTo;
        }
      }, 1000);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!registerData.firstName || !registerData.lastName) {
      setError('Please provide your first and last name');
      return;
    }

    if (!registerData.email && !registerData.phone) {
      setError('Please provide either an email address or phone number');
      return;
    }

    if (!registerData.password || !registerData.confirmPassword) {
      setError('Please provide and confirm your password');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 60) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    if (!registerData.termsAccepted || !registerData.privacyAccepted) {
      setError('Please accept the terms of service and privacy policy');
      return;
    }

    try {
      await register(
        registerData.email,
        registerData.password,
        `${registerData.firstName} ${registerData.lastName}`.trim()
      );

      setSuccess('Account created successfully! Welcome to ProCV.');
      // Create a PublicUser object from the registration data
      const publicUser = {
        id: 'temp-id',
        email: registerData.email,
        name: `${registerData.firstName} ${registerData.lastName}`.trim(),
        role: 'user' as const,
        verified: false,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      onSuccess?.(publicUser);
      setTimeout(() => {
        onClose();
        if (redirectTo) {
          window.location.href = redirectTo;
        }
      }, 1000);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Handle forgot password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetPasswordData.identifier) {
      setError('Please enter your email address or phone number');
      return;
    }

    try {
      await resetPassword(resetPasswordData.identifier);

      setSuccess('Password reset instructions have been sent to your email/phone.');
      setTimeout(() => setActiveTab('login'), 3000);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to ProCV
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register' | 'forgot-password')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-identifier">Email or Phone Number</Label>
                <div className="relative mt-1">
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData(prev => ({
                      ...prev,
                      identifier: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                  {loginData.identifier.includes('@') ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={loginData.rememberMe}
                    onCheckedChange={(checked) => setLoginData(prev => ({
                      ...prev,
                      rememberMe: checked as boolean
                    }))}
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    Remember me
                  </Label>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up now
              </button>
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="First name"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))}
                      className="pl-10"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="last-name">Last Name *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last name"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))}
                      className="pl-10"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="register-email">Email Address</Label>
                <div className="relative mt-1">
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                <div className="relative mt-1">
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+238 123 456 789"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="register-password">Password *</Label>
                <div className="relative mt-1">
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={registerData.password}
                    onChange={(e) => {
                      const password = e.target.value;
                      setRegisterData(prev => ({ ...prev, password }));
                      checkPasswordStrength(password);
                    }}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {registerData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Password strength:</span>
                      <Badge
                        variant={passwordStrength.level === 'strong' ? 'default' : 'secondary'}
                        className={
                          passwordStrength.level === 'strong' ? 'bg-green-600' :
                          passwordStrength.level === 'good' ? 'bg-blue-600' :
                          passwordStrength.level === 'fair' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }
                      >
                        {passwordStrength.level}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.level === 'strong' ? 'bg-green-600' :
                          passwordStrength.level === 'good' ? 'bg-blue-600' :
                          passwordStrength.level === 'fair' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        Missing: {passwordStrength.feedback.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={registerData.termsAccepted}
                    onCheckedChange={(checked) => setRegisterData(prev => ({
                      ...prev,
                      termsAccepted: checked as boolean
                    }))}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={registerData.privacyAccepted}
                    onCheckedChange={(checked) => setRegisterData(prev => ({
                      ...prev,
                      privacyAccepted: checked as boolean
                    }))}
                    required
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={registerData.newsletter}
                    onCheckedChange={(checked) => setRegisterData(prev => ({
                      ...prev,
                      newsletter: checked as boolean
                    }))}
                  />
                  <Label htmlFor="newsletter" className="text-sm leading-relaxed">
                    Subscribe to newsletter for market updates and exclusive offers
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </div>
          </TabsContent>

          {/* Forgot Password Tab */}
          <TabsContent value="forgot-password" className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgot-identifier">Email or Phone Number</Label>
                <div className="relative mt-1">
                  <Input
                    id="forgot-identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={resetPasswordData.identifier}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      identifier: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                  {resetPasswordData.identifier.includes('@') ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Features */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
            <div className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-3 w-3 mr-1" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
