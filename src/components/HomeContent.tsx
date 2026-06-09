'use client';

import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import ResultsFilterStrip from '@/components/ResultsFilterStrip';
import ResultsSplitView from '@/components/ResultsSplitView';
import Footer from '@/components/Footer';
import { useSearchMode } from '@/contexts/SearchModeContext';

export default function HomeContent() {
  const { isResultsViewActive } = useSearchMode();

  if (isResultsViewActive) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <ResultsFilterStrip />
        <ResultsSplitView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PropertyListings />
      <Footer />
    </div>
  );
}
