'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, LogOut, Settings, Heart, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import Link from 'next/link';

interface ClientOnlyHeaderControlsProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onChatOpen: () => void;
}

export default function ClientOnlyHeaderControls({
  onSignIn,
  onSignUp,
  onChatOpen
}: ClientOnlyHeaderControlsProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { totalUnreadCount } = useChat();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Prevent hydration mismatch - always render the same structure
  if (!isMounted) {
    return (
      <div className="hidden lg:flex items-center space-x-4">
        <Button variant="ghost" className="text-gray-700 h-auto p-1 px-2">
          <span className="flex items-center">
            <span className="text-lg mr-1">🇺🇸</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </span>
        </Button>
        <Button variant="outline" className="border-gray-300 text-gray-700 px-4">
          Sign In
        </Button>
        <Button className="bg-green-600 text-white px-4">
          Get Started
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center space-x-4">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-blue-600 font-medium h-auto p-1 px-2"
          >
            <span className="flex items-center">
              <span className="text-lg mr-1">{languages[currentLanguage].flag}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(languages).map(([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onSelect={() => setLanguage(code as keyof typeof languages)}
              className="cursor-pointer"
            >
              <span className="flex items-center">
                <span className="text-lg mr-3">{lang.flag}</span>
                <span className={currentLanguage === code ? 'font-semibold' : ''}>{lang.name}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isAuthenticated ? (
        <>
          {/* Authenticated User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user?.name || 'User'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="w-full cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="w-full cursor-pointer">
                  <Heart className="h-4 w-4 mr-2" />
                  Saved Properties
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/search-alerts" className="w-full cursor-pointer">
                  <Search className="h-4 w-4 mr-2" />
                  Search Alerts
                </Link>
              </DropdownMenuItem>

              {/* Admin-only menu items */}
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer text-purple-600">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/data-integration" className="w-full cursor-pointer text-purple-600">
                      <Search className="h-4 w-4 mr-2" />
                      Data Integration
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoading}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href="/list-property">List Property</Link>
          </Button>
        </>
      ) : (
        <>
          {/* Unauthenticated Buttons */}
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 px-4"
            onClick={onSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-4"
            onClick={onSignUp}
            disabled={isLoading}
          >
            Get Started
          </Button>
        </>
      )}
    </div>
  );
}
