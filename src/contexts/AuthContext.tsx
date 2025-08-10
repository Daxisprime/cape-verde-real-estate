"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SearchCriteria {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  bedrooms?: number;
  island?: string;
  beachDistance?: number;
  type?: string;
  maxPrice?: number;
}

interface AgentProfile {
  licenseNumber: string;
  company: string;
  bio: string;
  specialties: string[];
  languages: string[];
  serviceAreas: string[];
  contactMethods: {
    phone: boolean;
    email: boolean;
    whatsapp: boolean;
  };
}

interface ExtendedPreferences {
  currency: 'EUR' | 'CVE' | 'USD';
  language: 'en' | 'pt' | 'fr';
  theme?: 'light' | 'dark' | 'auto';
  measurementUnit?: 'metric' | 'imperial';
  notifications: {
    email: boolean;
    sms: boolean;
    newListings: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
  };
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  priceAlerts?: boolean;
  newListingAlerts?: boolean;
  priceChangeAlerts?: boolean;
  viewingReminders?: boolean;
  marketInsights?: boolean;
  agentMessages?: boolean;
  searchAlerts: Array<{
    id: string;
    name: string;
    criteria: SearchCriteria;
    frequency: 'daily' | 'weekly' | 'monthly';
    active: boolean;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role?: 'user' | 'agent' | 'admin';
  agentProfile?: AgentProfile;
  preferences: ExtendedPreferences;
  favorites: string[]; // Property IDs
  savedSearches: Array<{
    id: string;
    name: string;
    criteria: SearchCriteria;
    createdAt: string;
  }>;
  viewingHistory: Array<{
    propertyId: string;
    viewedAt: string;
  }>;
  inquiries: Array<{
    id: string;
    propertyId: string;
    agentId: string;
    message: string;
    status: 'pending' | 'responded' | 'closed';
    createdAt: string;
  }>;
  membershipLevel: 'basic' | 'premium' | 'vip';
  createdAt: string;
  lastLoginAt: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addToFavorites: (propertyId: string) => void;
  removeFromFavorites: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  saveSearch: (name: string, criteria: SearchCriteria) => void;
  deleteSavedSearch: (searchId: string) => void;
  addToViewingHistory: (propertyId: string) => void;
  createInquiry: (propertyId: string, agentId: string, message: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const mockUsers: { [email: string]: User & { password: string } } = {
  'demo@procv.com': {
    id: 'user-demo-001',
    email: 'demo@procv.com',
    password: 'demo123',
    name: 'Demo User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+238 999 0000',
    role: 'user',
    preferences: {
      currency: 'EUR',
      language: 'en',
      theme: 'light',
      measurementUnit: 'metric',
      notifications: {
        email: true,
        sms: false,
        newListings: true,
        priceAlerts: true,
        marketUpdates: false
      },
      emailNotifications: true,
      smsNotifications: false,
      priceAlerts: true,
      newListingAlerts: true,
      priceChangeAlerts: true,
      viewingReminders: true,
      marketInsights: false,
      agentMessages: true,
      searchAlerts: [
        {
          id: 'alert-001',
          name: 'Beachfront Villas Sal',
          criteria: { island: 'Sal', type: 'Villa', beachDistance: 100 },
          frequency: 'weekly',
          active: true
        }
      ]
    },
    favorites: ['cv-001', 'cv-004', 'cv-009'],
    savedSearches: [
      {
        id: 'search-001',
        name: 'Santiago Properties Under €300k',
        criteria: { island: 'Santiago', maxPrice: 300000 },
        createdAt: '2024-12-01T10:00:00Z'
      }
    ],
    viewingHistory: [
      { propertyId: 'cv-001', viewedAt: '2024-12-20T14:30:00Z' },
      { propertyId: 'cv-004', viewedAt: '2024-12-19T16:45:00Z' }
    ],
    inquiries: [
      {
        id: 'inquiry-001',
        propertyId: 'cv-001',
        agentId: 'agent-maria-santos',
        message: 'Interested in viewing this property. What are the available times?',
        status: 'responded',
        createdAt: '2024-12-18T09:15:00Z'
      }
    ],
    membershipLevel: 'premium',
    createdAt: '2024-11-01T00:00:00Z',
    lastLoginAt: '2024-12-20T08:30:00Z',
    verified: true
  }
};

// Storage helpers
const STORAGE_KEY = 'procv_user';
const SESSION_KEY = 'procv_session';

const saveUserToStorage = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  sessionStorage.setItem(SESSION_KEY, 'authenticated');
};

const removeUserFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEY);
    const sessionStr = sessionStorage.getItem(SESSION_KEY);

    if (userStr && sessionStr === 'authenticated') {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const savedUser = getUserFromStorage();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Update storage when user changes
  useEffect(() => {
    if (user) {
      saveUserToStorage(user);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = mockUsers[email.toLowerCase()];
    if (!mockUser || mockUser.password !== password) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = mockUser;
    const loginUser = {
      ...userWithoutPassword,
      lastLoginAt: new Date().toISOString()
    };

    setUser(loginUser);
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (mockUsers[email.toLowerCase()]) {
      setIsLoading(false);
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role: 'user',
      preferences: {
        currency: 'EUR',
        language: 'en',
        theme: 'light',
        measurementUnit: 'metric',
        notifications: {
          email: true,
          sms: false,
          newListings: true,
          priceAlerts: false,
          marketUpdates: false
        },
        emailNotifications: true,
        smsNotifications: false,
        priceAlerts: false,
        newListingAlerts: true,
        priceChangeAlerts: false,
        viewingReminders: true,
        marketInsights: false,
        agentMessages: true,
        searchAlerts: []
      },
      favorites: [],
      savedSearches: [],
      viewingHistory: [],
      inquiries: [],
      membershipLevel: 'basic',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      verified: false
    };

    // Add to mock database
    mockUsers[email.toLowerCase()] = { ...newUser, password };

    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update mock database
    if (mockUsers[user.email]) {
      mockUsers[user.email] = { ...mockUsers[user.email], ...updates };
    }

    setIsLoading(false);
  };

  const addToFavorites = (propertyId: string) => {
    if (!user) return;

    const updatedFavorites = [...user.favorites];
    if (!updatedFavorites.includes(propertyId)) {
      updatedFavorites.push(propertyId);
      updateProfile({ favorites: updatedFavorites });
    }
  };

  const removeFromFavorites = (propertyId: string) => {
    if (!user) return;

    const updatedFavorites = user.favorites.filter(id => id !== propertyId);
    updateProfile({ favorites: updatedFavorites });
  };

  const isFavorite = (propertyId: string): boolean => {
    return user?.favorites.includes(propertyId) ?? false;
  };

  const saveSearch = (name: string, criteria: SearchCriteria) => {
    if (!user) return;

    const newSearch = {
      id: `search-${Date.now()}`,
      name,
      criteria,
      createdAt: new Date().toISOString()
    };

    const updatedSearches = [...user.savedSearches, newSearch];
    updateProfile({ savedSearches: updatedSearches });
  };

  const deleteSavedSearch = (searchId: string) => {
    if (!user) return;

    const updatedSearches = user.savedSearches.filter(search => search.id !== searchId);
    updateProfile({ savedSearches: updatedSearches });
  };

  const addToViewingHistory = (propertyId: string) => {
    if (!user) return;

    const newView = {
      propertyId,
      viewedAt: new Date().toISOString()
    };

    // Remove existing view of same property and add new one
    const updatedHistory = [
      newView,
      ...user.viewingHistory.filter(view => view.propertyId !== propertyId)
    ].slice(0, 50); // Keep only last 50 views

    updateProfile({ viewingHistory: updatedHistory });
  };

  const createInquiry = async (propertyId: string, agentId: string, message: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newInquiry = {
      id: `inquiry-${Date.now()}`,
      propertyId,
      agentId,
      message,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    const updatedInquiries = [...user.inquiries, newInquiry];
    await updateProfile({ inquiries: updatedInquiries });

    setIsLoading(false);
  };

  const resendVerification = async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real app, this would send email
    console.log('Verification email sent to:', user.email);

    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real app, this would send reset email
    console.log('Password reset email sent to:', email);

    setIsLoading(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = mockUsers[user.email];
    if (!mockUser || mockUser.password !== currentPassword) {
      setIsLoading(false);
      throw new Error('Current password is incorrect');
    }

    // Update password in mock database
    mockUsers[user.email].password = newPassword;

    setIsLoading(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    saveSearch,
    deleteSavedSearch,
    addToViewingHistory,
    createInquiry,
    resendVerification,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
