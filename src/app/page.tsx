import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import RegionalListings from '@/components/RegionalListings';
import InfoSection from '@/components/InfoSection';
import MarketInsights from '@/components/MarketInsights';
import EstateAgentsDirectory from '@/components/EstateAgentsDirectory';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PropertyListings />
      <RegionalListings />
      <InfoSection />
      <MarketInsights />
      <EstateAgentsDirectory />
      <Footer />
    </div>
  );
}
