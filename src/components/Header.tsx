'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Store, PlusCircle, ChevronDown } from 'lucide-react';
import { mockProfiles } from '@/lib/mockProfiles';
import { useSearchMode } from '@/contexts/SearchModeContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searchMode } = useSearchMode();

  const isMarkets = searchMode === "markets";
  const vendor = mockProfiles[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-300 ${
      isMarkets
        ? "bg-[#2563EB] border-blue-700"
        : "bg-white border-gray-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - red dot centered between Pro and CV */}
          <div className="flex-1 lg:flex-none">
            <Link href="/" className="flex items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className={isMarkets ? "text-white" : "text-[#2563EB]"}>Pro</span>
                <span className="text-red-600 mx-[1px] inline-block align-middle text-lg">&#x2022;</span>
                <span className={isMarkets ? "text-white" : "text-[#2563EB]"}>CV</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link href="/map?type=buy" className={`font-medium transition-colors ${
              isMarkets ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-[#2563EB]"
            }`}>
              Buy
            </Link>
            <Link href="/map?type=rent" className={`font-medium transition-colors ${
              isMarkets ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-[#2563EB]"
            }`}>
              Rent
            </Link>
            <Link href="/sell" className={`font-medium transition-colors ${
              isMarkets ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-[#2563EB]"
            }`}>
              Sell
            </Link>
            <Link href="/map" className={`font-medium transition-colors ${
              isMarkets ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-[#2563EB]"
            }`}>
              Map
            </Link>
          </nav>

          {/* Right side: Profile Avatar Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 rounded-full border p-1 pr-3 hover:shadow-md transition-shadow ${
                  isMarkets ? "border-white/30" : "border-gray-200"
                }`}
              >
                <img
                  src={vendor.avatar_url}
                  alt={vendor.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                  isMarkets ? "text-white/70" : "text-gray-500"
                } ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{vendor.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{vendor.company}</p>
                  </div>
                  <Link
                    href="/my-store"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Store className="h-4 w-4 text-gray-400" />
                    My Store
                  </Link>
                  <Link
                    href="/sell"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 text-gray-400" />
                    Post an Ad
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen
                  ? <X className={`h-6 w-6 ${isMarkets ? "text-white" : ""}`} />
                  : <Menu className={`h-6 w-6 ${isMarkets ? "text-white" : ""}`} />
                }
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${isMarkets ? "border-white/20" : "border-gray-200"}`}>
            <div className="flex flex-col space-y-4">
              <Link href="/map?type=buy" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                Buy
              </Link>
              <Link href="/map?type=rent" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                Rent
              </Link>
              <Link href="/sell" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                Sell
              </Link>
              <Link href="/map" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                Map
              </Link>
              <Link href="/my-store" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                My Store
              </Link>
              <Link href="/sell" className={`font-medium ${isMarkets ? "text-white/80" : "text-gray-700 hover:text-[#2563EB]"}`} onClick={() => setIsMobileMenuOpen(false)}>
                Post an Ad
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
