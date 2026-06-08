import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import Footer from '@/components/Footer';
import { SearchModeProvider } from '@/contexts/SearchModeContext';

export default function HomePage() {
  return (
    <SearchModeProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <HeroSection />
        <PropertyListings />
        <Footer />
      </div>
    </SearchModeProvider>
  );
}
