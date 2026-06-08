import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import Footer from '@/components/Footer';

// Cape Verde Real Estate Platform - v3.0.0 - Optimized Mobile Performance
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PropertyListings />
      <Footer />
    </div>
  );
}
