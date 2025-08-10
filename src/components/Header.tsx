'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Menu, X, User, LogOut, Settings, Heart, Search, Globe, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import AuthModal from '@/components/AuthModal';
import ChatInterface from '@/components/chat/ChatInterface';
import ClientOnlyHeaderControls from '@/components/ClientOnlyHeaderControls';

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { totalUnreadCount } = useChat();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Browser notification permission for chat
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasNotificationPermission(true);
      } else if (Notification.permission === 'default') {
        // Request permission for authenticated users
        Notification.requestPermission().then((permission) => {
          setHasNotificationPermission(permission === 'granted');
        });
      }
    }
  }, [isAuthenticated]);

  const handleSignIn = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const propTechItems = [
    { href: '/ai-valuation', label: 'AI Valuation' },
    { href: '/vr-tours', label: 'VR Tours' },
    { href: '/mobile-app', label: 'Mobile App' },
    { href: '/blockchain', label: 'Blockchain' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/proptech-revolution', label: 'PropTech Revolution' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'border-b border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Static structure to prevent hydration issues */}
          <div className="flex-1 lg:flex-none">
            <div className="flex justify-center lg:justify-start">
              <Link href="/" className="flex items-center">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <span className="text-blue-600">pro</span>
                  <span className="text-red-600">•</span>
                  <span className="text-blue-600">cv</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Static classes */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link
              href="/buy"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Buy
            </Link>
            <Link
              href="/rent"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Rent
            </Link>
            <Link
              href="/sell"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Sell
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600 font-medium h-auto p-0"
                >
                  <span className="flex items-center">
                    <span className="text-orange-500 mr-2">⚡</span>
                    PropTech
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {propTechItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="w-full cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/calculators"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Calculators
            </Link>
            <Link
              href="/advice"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Advice
            </Link>
          </nav>

          {/* Mobile Menu Button - Static classes */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Action Buttons */}
          <ClientOnlyHeaderControls
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onChatOpen={() => setIsChatOpen(true)}
          />
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/buy"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Buy
              </Link>
              <Link
                href="/rent"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rent
              </Link>
              <Link
                href="/sell"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sell
              </Link>

              {/* Mobile PropTech Items */}
              <div className="pl-4 space-y-2">
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <span className="text-orange-500 mr-2">⚡</span>
                  PropTech
                </div>
                {propTechItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-gray-600 hover:text-blue-600 text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/calculators"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculators
              </Link>
              <Link
                href="/advice"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Advice
              </Link>

              {/* Mobile Language Selector */}
              <div className={`space-y-2 ${!isMounted ? 'opacity-0 pointer-events-none' : ''}`} suppressHydrationWarning>
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Language
                </div>
                <div className="pl-6 space-y-2">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code as keyof typeof languages);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full text-left text-sm transition-colors ${
                        currentLanguage === code
                          ? 'text-blue-600 font-semibold'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <span className="text-base mr-3">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className={`pt-4 space-y-2 ${!isMounted ? 'opacity-0 pointer-events-none' : ''}`} suppressHydrationWarning>
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsChatOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {totalUnreadCount > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </span>
                      )}
                    </Button>
                    <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Heart className="h-4 w-4 mr-2" />
                        Saved Properties
                      </Button>
                    </Link>

                    {/* Admin-only mobile menu items */}
                    {user?.role === 'admin' && (
                      <>
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start text-purple-600 border-purple-200">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        </Link>
                        <Link href="/admin/data-integration" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start text-purple-600 border-purple-200">
                            <Search className="h-4 w-4 mr-2" />
                            Data Integration
                          </Button>
                        </Link>
                      </>
                    )}

                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Link href="/list-property" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        List Property
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700"
                      onClick={handleSignIn}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Sign In'}
                    </Button>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleSignUp}
                      disabled={isLoading}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        onSuccess={handleAuthSuccess}
      />

      {/* Chat Interface */}
      {isChatOpen && (
        <ChatInterface
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </header>
  );
}
