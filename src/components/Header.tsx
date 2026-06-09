'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Store, PlusCircle, ChevronDown, Search, LogOut, Home, MapPin, Tag, DollarSign, ShoppingBag } from 'lucide-react';
import { mockProfiles } from '@/lib/mockProfiles';
import { useSearchMode } from '@/contexts/SearchModeContext';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const {
    searchMode, setSearchMode,
    isResultsViewActive, setIsResultsViewActive,
    headerSearchQuery, setHeaderSearchQuery,
  } = useSearchMode();

  const isMarkets = searchMode === "markets";
  const vendor = mockProfiles[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogoClick() {
    setIsResultsViewActive(false);
    setHeaderSearchQuery("");
    setSearchMode("realestate");
    setIsNavOpen(false);
  }

  function handleSignOut() {
    setIsProfileOpen(false);
    setIsResultsViewActive(false);
    setHeaderSearchQuery("");
    setSearchMode("realestate");
  }

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-300 ${
      isMarkets
        ? "bg-[#2563EB] border-blue-700"
        : "bg-white border-gray-200"
    }`}>
      <div className="w-full flex items-center justify-between px-4 h-16">
        {/* LEFT: Burger + Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger */}
          <div className="relative flex-shrink-0" ref={navRef}>
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isMarkets
                  ? "text-white hover:bg-white/10"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Navigation menu"
            >
              {isNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {isNavOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                <Link
                  href="/"
                  onClick={handleLogoClick}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home className="h-4 w-4 text-gray-400" />
                  Home
                </Link>
                <Link
                  href="/map?type=buy"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Tag className="h-4 w-4 text-gray-400" />
                  Buy
                </Link>
                <Link
                  href="/map?type=rent"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  Rent
                </Link>
                <Link
                  href="/sell"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 text-gray-400" />
                  Sell
                </Link>
                <Link
                  href="/map"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Map
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link
                    href="/my-store"
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Store className="h-4 w-4 text-gray-400" />
                    My Store
                  </Link>
                  <Link
                    href="/sell"
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                    Post an Ad
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center flex-shrink-0">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
              <span className={isMarkets ? "text-white" : "text-[#2563EB]"}>pro</span>
              <span className="text-red-600 inline-block" style={{ verticalAlign: 'middle', lineHeight: 0, fontSize: '0.7em', margin: '0 1px' }}>&#x2022;</span>
              <span className={isMarkets ? "text-white" : "text-[#2563EB]"}>cv</span>
            </span>
          </Link>

          {/* CENTER-LEFT: Search bar */}
          {isResultsViewActive && (
            <div className="hidden sm:block w-44 md:w-52 lg:w-60 ml-3 flex-shrink min-w-0">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isMarkets ? "text-white/50" : "text-gray-400"
                }`} />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-full text-sm outline-none transition ${
                    isMarkets
                      ? "bg-white/15 border border-white/20 text-white placeholder-white/50 focus:bg-white/25 focus:border-white/50"
                      : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Mode Tabs + Profile */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mode text links - ALWAYS visible, flat, no borders/backgrounds */}
          <nav className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setSearchMode("realestate")}
              className="relative px-3 py-1.5 text-sm font-medium transition-all"
            >
              <span className={
                isMarkets
                  ? (!isMarkets ? "text-white" : "text-white/60 hover:text-white")
                  : (!isMarkets ? "text-slate-800" : "text-slate-400 hover:text-slate-700")
              }>
                Real Estate
              </span>
              {!isMarkets && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSearchMode("markets")}
              className="relative px-3 py-1.5 text-sm font-medium transition-all"
            >
              <span className={
                isMarkets
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-700"
              }>
                Markets
              </span>
              {isMarkets && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </nav>

          {/* Profile Avatar - FAR RIGHT */}
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
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: search + mode tabs (below main bar) */}
      {isResultsViewActive && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isMarkets ? "text-white/50" : "text-gray-400"
            }`} />
            <input
              type="text"
              placeholder="Search location..."
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-full text-sm outline-none transition ${
                isMarkets
                  ? "bg-white/15 border border-white/20 text-white placeholder-white/50"
                  : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
        </div>
      )}

      {/* Mobile mode tabs - always visible */}
      <div className="sm:hidden flex items-center gap-1 px-4 pb-2">
        <button
          onClick={() => setSearchMode("realestate")}
          className="relative px-3 py-1 text-xs font-medium transition-all"
        >
          <span className={
            isMarkets
              ? "text-white/60"
              : "text-slate-800"
          }>
            Real Estate
          </span>
          {!isMarkets && (
            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2563EB] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setSearchMode("markets")}
          className="relative px-3 py-1 text-xs font-medium transition-all"
        >
          <span className={
            isMarkets
              ? "text-white"
              : "text-slate-400"
          }>
            Markets
          </span>
          {isMarkets && (
            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
