'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-1 lg:flex-none">
            <Link href="/" className="flex items-center">
              <span className="text-2xl sm:text-3xl font-bold">
                <span className="text-[#003DA5]">pro</span>
                <span className="text-red-600">•</span>
                <span className="text-[#003DA5]">cv</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link href="/buy" className="text-gray-700 hover:text-[#003DA5] font-medium transition-colors">
              Buy
            </Link>
            <Link href="/rent" className="text-gray-700 hover:text-[#003DA5] font-medium transition-colors">
              Rent
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-[#003DA5] font-medium transition-colors">
              Sell
            </Link>
            <Link href="/map" className="text-gray-700 hover:text-[#003DA5] font-medium transition-colors">
              Map
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/buy" className="text-gray-700 hover:text-[#003DA5] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Buy
              </Link>
              <Link href="/rent" className="text-gray-700 hover:text-[#003DA5] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Rent
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-[#003DA5] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Sell
              </Link>
              <Link href="/map" className="text-gray-700 hover:text-[#003DA5] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Map
              </Link>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">Sign In</Button>
                <Button className="flex-1">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
