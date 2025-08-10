import { PasswordSecurity, generateSecureId } from '@/lib/security';
import type { User, PublicUser, UserRole, SecurityLog, UserSession, VerificationCode } from '@/types/auth';

// Mock user database - In production, this would be replaced with a real database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@procv.cv',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-01',
    lastLogin: '2024-12-25',
    loginAttempts: 0,
    twoFactorEnabled: false,
    isActive: true,
    preferences: {
      currency: 'EUR',
      language: 'en',
      units: 'metric',
      theme: 'light',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      newsletter: true
    },
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Platform administrator',
      location: 'Praia, Santiago',
      languages: ['en', 'pt'],
      interests: ['real-estate', 'technology'],
      notifications: {
        propertyAlerts: true,
        priceChanges: true,
        newListings: true,
        marketUpdates: true,
        messages: true,
        viewingReminders: true,
        systemUpdates: true
      },
      privacy: {
        profileVisibility: 'private',
        contactVisibility: 'private',
        activityTracking: true,
        dataProcessing: true,
        marketingCommunications: false
      }
    }
  },
  {
    id: '2',
    email: 'agent@procv.cv',
    phone: '+238123456789',
    name: 'Maria Santos',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'agent',
    verified: true,
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-06-15',
    lastLogin: '2024-12-24',
    loginAttempts: 0,
    twoFactorEnabled: false,
    isActive: true,
    preferences: {
      currency: 'EUR',
      language: 'pt',
      units: 'metric',
      theme: 'light',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: true,
      newsletter: true
    },
    profile: {
      firstName: 'Maria',
      lastName: 'Santos',
      bio: 'Experienced real estate agent specializing in Cape Verde properties',
      location: 'Santa Maria, Sal',
      languages: ['pt', 'en', 'fr'],
      interests: ['real-estate', 'tourism', 'investment'],
      notifications: {
        propertyAlerts: true,
        priceChanges: true,
        newListings: true,
        marketUpdates: true,
        messages: true,
        viewingReminders: true,
        systemUpdates: true
      },
      privacy: {
        profileVisibility: 'public',
        contactVisibility: 'verified_only',
        activityTracking: true,
        dataProcessing: true,
        marketingCommunications: true
      }
    }
  }
];

// Security logs
let securityLogs: SecurityLog[] = [];

// User sessions
const userSessions: Map<string, UserSession> = new Map();

// Verification codes
const verificationCodes: Map<string, VerificationCode> = new Map();

// Initialize admin user with hashed password
async function initializeDatabase() {
  if (mockUsers[0].password === undefined) {
    const adminPassword = await PasswordSecurity.hash('admin123!@#');
    const agentPassword = await PasswordSecurity.hash('agent123!@#');

    mockUsers[0].password = adminPassword;
    mockUsers[1].password = agentPassword;
  }
}

// Initialize database on first import
initializeDatabase();

export class UserDatabase {
  // User operations
  static async findUserByEmail(email: string): Promise<User | null> {
    const user = mockUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async findUserByPhone(phone: string): Promise<User | null> {
    const user = mockUsers.find(u => u.phone === phone);
    return user || null;
  }

  static async findUserByIdentifier(identifier: string): Promise<User | null> {
    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');

    if (isEmail) {
      return this.findUserByEmail(identifier);
    } else {
      return this.findUserByPhone(identifier);
    }
  }

  static async findUserById(id: string): Promise<User | null> {
    const user = mockUsers.find(u => u.id === id);
    return user || null;
  }

  static async createUser(userData: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User> {
    const hashedPassword = await PasswordSecurity.hash(userData.password);

    const newUser: User = {
      id: generateSecureId(),
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      name: `${userData.firstName} ${userData.lastName}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      verified: false,
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
      loginAttempts: 0,
      twoFactorEnabled: false,
      isActive: true,
      preferences: {
        currency: 'EUR',
        language: 'en',
        units: 'metric',
        theme: 'light',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        newsletter: false
      },
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        notifications: {
          propertyAlerts: true,
          priceChanges: true,
          newListings: true,
          marketUpdates: false,
          messages: true,
          viewingReminders: true,
          systemUpdates: false
        },
        privacy: {
          profileVisibility: 'private',
          contactVisibility: 'private',
          activityTracking: true,
          dataProcessing: true,
          marketingCommunications: false
        }
      }
    };

    mockUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return null;
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }

  static async updateLoginAttempts(userId: string, attempts: number, lockedUntil?: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (user) {
      await this.updateUser(userId, {
        loginAttempts: attempts,
        lockedUntil
      });
    }
  }

  static async updateLastLogin(userId: string, ip?: string, userAgent?: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (user) {
      await this.updateUser(userId, {
        lastLogin: new Date().toISOString(),
        ipAddress: ip,
        userAgent
      });
    }
  }

  static toPublicUser(user: User): PublicUser {
    const { password, loginAttempts, lockedUntil, ipAddress, userAgent, ...publicUser } = user;
    return {
      ...publicUser,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        bio: user.profile.bio,
        location: user.profile.location,
        dateOfBirth: user.profile.dateOfBirth,
        languages: user.profile.languages,
        interests: user.profile.interests
      } : undefined
    };
  }

  // Security logging
  static async logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<void> {
    const log: SecurityLog = {
      id: generateSecureId(),
      timestamp: new Date().toISOString(),
      ...event
    };

    securityLogs.push(log);

    // Keep only last 1000 logs to prevent memory issues
    if (securityLogs.length > 1000) {
      securityLogs = securityLogs.slice(-1000);
    }
  }

  static async getSecurityLogs(userId?: string, limit: number = 100): Promise<SecurityLog[]> {
    let logs = securityLogs;

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Session management
  static async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    ip: string,
    userAgent: string
  ): Promise<UserSession> {
    const session: UserSession = {
      id: generateSecureId(),
      userId,
      token,
      refreshToken,
      ip,
      userAgent,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      isActive: true
    };

    userSessions.set(session.id, session);
    return session;
  }

  static async findSessionByToken(token: string): Promise<UserSession | null> {
    for (const session of userSessions.values()) {
      if (session.token === token && session.isActive) {
        return session;
      }
    }
    return null;
  }

  static async findSessionByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    for (const session of userSessions.values()) {
      if (session.refreshToken === refreshToken && session.isActive) {
        return session;
      }
    }
    return null;
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    const session = userSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
    }
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    const session = userSessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  static async invalidateUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    for (const session of userSessions.values()) {
      if (session.userId === userId && session.id !== exceptSessionId) {
        session.isActive = false;
      }
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [sessionId, session] of userSessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        userSessions.delete(sessionId);
      }
    }
  }

  // Verification codes
  static async createVerificationCode(
    userId: string,
    type: 'email' | 'phone' | 'password_reset'
  ): Promise<VerificationCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const verificationCode: VerificationCode = {
      id: generateSecureId(),
      userId,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      attempts: 0,
      verified: false,
      createdAt: new Date().toISOString()
    };

    verificationCodes.set(verificationCode.id, verificationCode);
    return verificationCode;
  }

  static async findVerificationCode(code: string, type: string): Promise<VerificationCode | null> {
    for (const verification of verificationCodes.values()) {
      if (verification.code === code && verification.type === type && !verification.verified) {
        if (new Date(verification.expiresAt) > new Date()) {
          return verification;
        }
      }
    }
    return null;
  }

  static async verifyCode(codeId: string): Promise<boolean> {
    const verification = verificationCodes.get(codeId);
    if (verification && !verification.verified && new Date(verification.expiresAt) > new Date()) {
      verification.verified = true;
      return true;
    }
    return false;
  }

  static async incrementCodeAttempts(codeId: string): Promise<void> {
    const verification = verificationCodes.get(codeId);
    if (verification) {
      verification.attempts++;
    }
  }

  // Utility methods
  static async userExists(email?: string, phone?: string): Promise<boolean> {
    if (email) {
      const user = await this.findUserByEmail(email);
      if (user) return true;
    }

    if (phone) {
      const user = await this.findUserByPhone(phone);
      if (user) return true;
    }

    return false;
  }

  static async isUserLocked(user: User): Promise<boolean> {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  static async lockUser(userId: string, lockDurationMs: number = 15 * 60 * 1000): Promise<void> {
    const lockUntil = new Date(Date.now() + lockDurationMs).toISOString();
    await this.updateUser(userId, { lockedUntil: lockUntil });
  }

  static async unlockUser(userId: string): Promise<void> {
    await this.updateUser(userId, {
      lockedUntil: undefined,
      loginAttempts: 0
    });
  }

  // Development helper methods
  static async getAllUsers(): Promise<PublicUser[]> {
    return mockUsers.map(user => this.toPublicUser(user));
  }

  static async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    locked: number;
    byRole: Record<UserRole, number>;
  }> {
    const now = new Date();
    const stats = {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.isActive).length,
      verified: mockUsers.filter(u => u.verified).length,
      locked: mockUsers.filter(u => u.lockedUntil && new Date(u.lockedUntil) > now).length,
      byRole: {
        user: 0,
        agent: 0,
        admin: 0,
        superadmin: 0
      } as Record<UserRole, number>
    };

    mockUsers.forEach(user => {
      stats.byRole[user.role]++;
    });

    return stats;
  }
}
