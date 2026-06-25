'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Store, PlusCircle, ChevronDown, Search, LogOut, Home, MapPin, Tag, DollarSign, ShoppingBag, User } from 'lucide-react';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage, languages as langConfig, LanguageCode } from '@/contexts/LanguageContext';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const {
    searchMode, setSearchMode,
    isResultsViewActive, setIsResultsViewActive,
    headerSearchQuery, setHeaderSearchQuery,
    listingType, setListingType,
  } = useSearchMode();
  const { isAuthenticated, profile, signOut: supabaseSignOut, user } = useSupabaseAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const isMarkets = searchMode === "markets";

  function classifySearchIntent(input: string): "realestate" | "markets" | null {
    const q = input.toLowerCase();
    const isRealEstate = q.includes('pent') || q.includes('apart') || q.includes('casa') || q.includes('vivenda') || q.includes('quarto') || q.includes('terreno') || q.includes('villa') || q.includes('house') || q.includes('moradia') || q.includes('flat') || q.includes('duplex') || q.includes('studio') || q.includes('bedroom') || q.includes('rent') || q.includes('apto') || q.includes('andar') || q.includes('plot') || q.includes('land') || q.includes('condo') || q.includes('townhouse') || /t[1-4]/i.test(q);
    const isMarketIntent = q.includes('ceme') || q.includes('martelo') || q.includes('carro') || q.includes('iphone') || q.includes('bonnet') || q.includes('roupa') || q.includes('tijolo') || q.includes('hamm') || q.includes('drill') || q.includes('paint') || q.includes('furni') || q.includes('sofa') || q.includes('fridge') || q.includes('plumb') || q.includes('electri') || q.includes('phone') || q.includes('moto') || q.includes('shoe') || q.includes('cloth') || q.includes('tool') || q.includes('block') || q.includes('tile') || q.includes('car ') || q.includes('tv ') || (q.endsWith('car') && q.length <= 5) || (q.endsWith('tv') && q.length <= 4);
    if (isRealEstate && !isMarketIntent) return "realestate";
    if (isMarketIntent && !isRealEstate) return "markets";
    return null;
  }

  function handleSearchChange(value: string) {
    setHeaderSearchQuery(value);
    if (value.length >= 2) {
      const intent = classifySearchIntent(value);
      if (intent && intent !== searchMode) {
        setSearchMode(intent);
      }
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const intent = classifySearchIntent(headerSearchQuery);
    if (intent && intent !== searchMode) {
      setSearchMode(intent);
    }
    setIsResultsViewActive(true);
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSignOut() {
    supabaseSignOut();
    setIsProfileOpen(false);
    setIsResultsViewActive(false);
    setHeaderSearchQuery("");
    setSearchMode("realestate");
  }

  const tabsElement = (
    <nav className="hidden sm:flex items-center gap-1">
      <button
        onClick={() => setSearchMode("realestate")}
        className="relative px-3 py-1.5 text-sm font-medium transition-all"
      >
        <span className={
          isMarkets
            ? "text-white/60 hover:text-white"
            : "text-slate-800"
        }>
          {t.realEstate}
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
          {t.markets}
        </span>
        {isMarkets && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
        )}
      </button>
    </nav>
  );

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-300 ${
      isMarkets
        ? "bg-[#2563EB] border-blue-700"
        : "bg-white border-gray-200"
    }`}>
      <div className="w-full flex items-center px-4 h-16 relative">
        {/* LEFT: Burger + Logo + (Search when results active) */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
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
                  {t.home}
                </Link>
                <button
                  onClick={() => {
                    setSearchMode("realestate");
                    setListingType("buy");
                    setIsResultsViewActive(true);
                    setIsNavOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Tag className="h-4 w-4 text-gray-400" />
                  {t.buy}
                </button>
                <button
                  onClick={() => {
                    setSearchMode("realestate");
                    setListingType("rent");
                    setIsResultsViewActive(true);
                    setIsNavOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {t.rent}
                </button>
                <Link
                  href="/sell"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 text-gray-400" />
                  {t.sell}
                </Link>
                <Link
                  href="/map"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {t.map}
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  Marketplace
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link
                    href="/my-store"
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Store className="h-4 w-4 text-gray-400" />
                    {t.myStore}
                  </Link>
                  <Link
                    href="/sell"
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                    {t.postAd}
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

          {/* Search bar - only when results view active */}
          {isResultsViewActive && (
            <form onSubmit={handleFormSubmit} className="hidden sm:block w-44 md:w-52 lg:w-60 ml-3 flex-shrink min-w-0">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isMarkets ? "text-white/50" : "text-gray-400"
                }`} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={headerSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-full text-sm outline-none transition ${
                    isMarkets
                      ? "bg-white/15 border border-white/20 text-white placeholder-white/50 focus:bg-white/25 focus:border-white/50"
                      : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </div>
            </form>
          )}
        </div>

        {/* CENTER: Tabs when home view (absolute center positioning) */}
        {!isResultsViewActive && (
          <div className="absolute left-1/2 -translate-x-1/2">
            {tabsElement}
          </div>
        )}

        {/* RIGHT: (Tabs when results active) + Language Selector + Profile */}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          {isResultsViewActive && tabsElement}

          {/* Language Selector Button Track */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-full bg-gray-100/80 p-0.5">
            {(Object.keys(langConfig) as LanguageCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-full transition-all ${
                  currentLanguage === code
                    ? isMarkets
                      ? "bg-white text-[#2563EB] shadow-sm"
                      : "bg-[#2563EB] text-white shadow-sm"
                    : isMarkets
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {langConfig[code].label}
              </button>
            ))}
          </div>

          {/* Profile Avatar - FAR RIGHT */}
          <div className="relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 rounded-full border p-1 pr-3 hover:shadow-md transition-shadow ${
                    isMarkets ? "border-white/30" : "border-gray-200"
                  }`}
                >
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0044FF] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                    isMarkets ? "text-white/70" : "text-gray-500"
                  } ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/my-store"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Store className="h-4 w-4 text-gray-400" />
                      {t.myStore}
                    </Link>
                    <Link
                      href="/sell"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <PlusCircle className="h-4 w-4 text-gray-400" />
                      {t.postAd}
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4 text-red-400" />
                        {t.signOut}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/auth"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isMarkets
                    ? "bg-white text-[#0044FF] hover:bg-white/90"
                    : "bg-[#0044FF] text-white hover:bg-[#0033CC]"
                }`}
              >
                {t.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: search bar when results active */}
      {isResultsViewActive && (
        <form onSubmit={handleFormSubmit} className="sm:hidden px-4 pb-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isMarkets ? "text-white/50" : "text-gray-400"
            }`} />
            <input
              ref={mobileInputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder={t.searchPlaceholder}
              value={headerSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-full text-sm outline-none transition ${
                isMarkets
                  ? "bg-white/15 border border-white/20 text-white placeholder-white/50"
                  : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
        </form>
      )}

      {/* Mobile mode tabs + language selector */}
      <div className="sm:hidden flex items-center justify-center gap-1 px-4 pb-2">
        <button
          onClick={() => setSearchMode("realestate")}
          className="relative px-3 py-1 text-xs font-medium transition-all"
        >
          <span className={
            isMarkets
              ? "text-white/60"
              : "text-slate-800"
          }>
            {t.realEstate}
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
            {t.markets}
          </span>
          {isMarkets && (
            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
          )}
        </button>

        <div className="flex items-center gap-0.5 rounded-full bg-gray-100/80 p-0.5 ml-2">
          {(Object.keys(langConfig) as LanguageCode[]).map((code) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full transition-all ${
                currentLanguage === code
                  ? isMarkets
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "bg-[#2563EB] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {langConfig[code].label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
