// Authentication and security related TypeScript interfaces

export interface User {
  id: string;
  email?: string;
  phone?: string;
  password?: string; // Only used during registration, never exposed
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  preferences?: UserPreferences;
  profile?: UserProfile;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export type UserRole = 'user' | 'agent' | 'admin' | 'superadmin';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  languages?: string[];
  interests?: string[];
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
}

export interface UserPreferences {
  currency: 'EUR' | 'USD' | 'CVE';
  language: 'en' | 'pt' | 'es' | 'fr';
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  newsletter: boolean;
}

export interface NotificationSettings {
  propertyAlerts: boolean;
  priceChanges: boolean;
  newListings: boolean;
  marketUpdates: boolean;
  messages: boolean;
  viewingReminders: boolean;
  systemUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'agents_only';
  contactVisibility: 'public' | 'private' | 'verified_only';
  activityTracking: boolean;
  dataProcessing: boolean;
  marketingCommunications: boolean;
}

// Authentication request/response types
export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: PublicUser;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
  loginAttempts?: number;
  lockedUntil?: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  captcha?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: PublicUser;
  token?: string;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAllDevices?: boolean;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface ForgotPasswordRequest {
  identifier: string; // email or phone
  captcha?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Public user interface (without sensitive data)
export interface PublicUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  preferences?: UserPreferences;
  profile?: Omit<UserProfile, 'notifications' | 'privacy'>;
}

// JWT token payload
export interface CustomJWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  iat: number;
  exp: number;
  jti: string; // JWT ID for token tracking
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

// Security related interfaces
export interface SecurityLog {
  id: string;
  userId?: string;
  action: SecurityAction;
  ip: string;
  userAgent: string;
  location?: string;
  success: boolean;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type SecurityAction =
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register_attempt'
  | 'register_success'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'password_change'
  | 'email_verification'
  | 'phone_verification'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'rate_limit_exceeded';

export interface RateLimitInfo {
  windowMs: number;
  max: number;
  remaining: number;
  reset: Date;
  limit: number;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Session management
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  location?: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

// Authentication context types
export interface AuthContextType {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: (logoutAllDevices?: boolean) => Promise<void>;
  forgotPassword: (identifier: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<ResetPasswordResponse>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<ChangePasswordResponse>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  // Favorites functionality
  isFavorite: (propertyId: string) => boolean;
  addToFavorites: (propertyId: string) => Promise<void>;
  removeFromFavorites: (propertyId: string) => Promise<void>;
  // History functionality
  addToHistory: (propertyId: string) => Promise<void>;
}

// Component prop types
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'forgot-password';
  onSuccess?: (user: PublicUser) => void;
  redirectTo?: string;
}

export interface LoginFormProps {
  onSuccess?: (user: PublicUser) => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string;
}

export interface RegisterFormProps {
  onSuccess?: (user: PublicUser) => void;
  onSwitchToLogin?: () => void;
  isLoading?: boolean;
  error?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Input sanitization types
export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripTags?: boolean;
  encodeEntities?: boolean;
}

export interface SanitizedInput {
  original: string;
  sanitized: string;
  wasModified: boolean;
  removedContent?: string[];
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// Password validation
export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  requirements: Record<string, boolean>;
}

// Email/SMS verification
export interface VerificationCode {
  id: string;
  userId: string;
  code: string;
  type: 'email' | 'phone' | 'password_reset';
  expiresAt: string;
  attempts: number;
  verified: boolean;
  createdAt: string;
}
