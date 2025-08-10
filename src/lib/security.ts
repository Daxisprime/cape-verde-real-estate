import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import validator from 'validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type {
  CustomJWTPayload,
  ValidationResult,
  ValidationError,
  PasswordStrength,
  PasswordRequirements,
  SanitizedInput,
  SanitizationOptions
} from '@/types/auth';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const SALT_ROUNDS = 12;

// Create a DOM window for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Password requirements
const PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    'password',
    '12345678',
    'qwerty',
    'admin',
    'test',
    'user'
  ]
};

/**
 * Password Security Functions
 */
export class PasswordSecurity {
  static async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  static validateStrength(password: string): PasswordStrength {
    const requirements = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      maxLength: password.length <= PASSWORD_REQUIREMENTS.maxLength,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notForbidden: !PASSWORD_REQUIREMENTS.forbiddenPatterns.some(pattern =>
        password.toLowerCase().includes(pattern.toLowerCase())
      )
    };

    const passed = Object.values(requirements).filter(Boolean).length;
    const total = Object.keys(requirements).length;
    const score = Math.round((passed / total) * 100);

    let level: PasswordStrength['level'] = 'very-weak';
    if (score >= 90) level = 'strong';
    else if (score >= 75) level = 'good';
    else if (score >= 60) level = 'fair';
    else if (score >= 40) level = 'weak';

    const feedback: string[] = [];
    if (!requirements.minLength) feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    if (!requirements.hasUppercase) feedback.push('Password must contain uppercase letters');
    if (!requirements.hasLowercase) feedback.push('Password must contain lowercase letters');
    if (!requirements.hasNumbers) feedback.push('Password must contain numbers');
    if (!requirements.hasSpecialChars) feedback.push('Password must contain special characters');
    if (!requirements.notForbidden) feedback.push('Password contains forbidden patterns');

    return {
      score,
      level,
      feedback,
      requirements
    };
  }

  static generate(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

/**
 * JWT Token Management
 */
export class TokenManager {
  private static textEncoder = new TextEncoder();

  static async createAccessToken(payload: Omit<CustomJWTPayload, 'iat' | 'exp' | 'jti'>): Promise<string> {
    const secret = this.textEncoder.encode(JWT_SECRET);
    const jti = crypto.randomUUID();

    const jwt = await new SignJWT({ ...payload, jti })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // Access token expires in 15 minutes
      .sign(secret);

    return jwt;
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const secret = this.textEncoder.encode(JWT_REFRESH_SECRET);
    const tokenId = crypto.randomUUID();

    const jwt = await new SignJWT({ userId, tokenId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Refresh token expires in 7 days
      .sign(secret);

    return jwt;
  }

  static async verifyAccessToken(token: string): Promise<CustomJWTPayload | null> {
    try {
      const secret = this.textEncoder.encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload as unknown as CustomJWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
    try {
      const secret = this.textEncoder.encode(JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload as { userId: string; tokenId: string };
    } catch (error) {
      return null;
    }
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

/**
 * Input Validation and Sanitization
 */
export class InputSecurity {
  static sanitizeHTML(input: string, options: SanitizationOptions = {}): SanitizedInput {
    const original = input;

    const config = {
      ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: options.allowedAttributes ? Object.keys(options.allowedAttributes) : ['class', 'id'],
      KEEP_CONTENT: !options.stripTags
    };

    const sanitized = purify.sanitize(original, config);

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      removedContent: original !== sanitized ? [original.replace(sanitized, '')] : undefined
    };
  }

  static sanitizeText(input: string): string {
    // Remove any HTML tags and decode entities
    const withoutTags = input.replace(/<[^>]*>/g, '');
    const decoded = validator.unescape(withoutTags);
    return decoded.trim();
  }

  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED'
      });
    } else {
      // Sanitize email
      const sanitized = this.sanitizeText(email);

      if (!validator.isEmail(sanitized)) {
        errors.push({
          field: 'email',
          message: 'Please enter a valid email address',
          code: 'INVALID_FORMAT'
        });
      }

      if (sanitized.length > 254) {
        errors.push({
          field: 'email',
          message: 'Email address is too long',
          code: 'TOO_LONG'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePhone(phone: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!phone) {
      errors.push({
        field: 'phone',
        message: 'Phone number is required',
        code: 'REQUIRED'
      });
    } else {
      // Sanitize phone number
      const sanitized = this.sanitizeText(phone);

      if (!validator.isMobilePhone(sanitized, 'any')) {
        errors.push({
          field: 'phone',
          message: 'Please enter a valid phone number',
          code: 'INVALID_FORMAT'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!password) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'REQUIRED'
      });
      return { isValid: false, errors };
    }

    const strength = PasswordSecurity.validateStrength(password);

    if (strength.score < 60) {
      errors.push({
        field: 'password',
        message: 'Password is too weak',
        code: 'WEAK_PASSWORD'
      });
    }

    strength.feedback.forEach(feedback => {
      errors.push({
        field: 'password',
        message: feedback,
        code: 'PASSWORD_REQUIREMENT'
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateName(name: string, fieldName: string = 'name'): ValidationResult {
    const errors: ValidationError[] = [];

    if (!name) {
      errors.push({
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
        code: 'REQUIRED'
      });
    } else {
      const sanitized = this.sanitizeText(name);

      if (sanitized.length < 2) {
        errors.push({
          field: fieldName,
          message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`,
          code: 'TOO_SHORT'
        });
      }

      if (sanitized.length > 50) {
        errors.push({
          field: fieldName,
          message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than 50 characters`,
          code: 'TOO_LONG'
        });
      }

      if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
        errors.push({
          field: fieldName,
          message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} contains invalid characters`,
          code: 'INVALID_CHARACTERS'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Rate Limiting Utilities
 */
export class RateLimiter {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();

  static isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  }

  static getRemainingAttempts(key: string, maxAttempts: number = 5): number {
    const record = this.attempts.get(key);
    if (!record) return maxAttempts;
    return Math.max(0, maxAttempts - record.count);
  }

  static getResetTime(key: string): number | null {
    const record = this.attempts.get(key);
    return record ? record.resetTime : null;
  }

  static clearAttempts(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Security Headers
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Generate secure random codes
 */
export function generateSecureCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }

  return code;
}

/**
 * Generate secure UUID
 */
export function generateSecureId(): string {
  return crypto.randomUUID();
}

/**
 * Timing safe comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfIp) {
    return cfIp;
  }

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
