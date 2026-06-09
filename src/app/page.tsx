import React from 'react';
import HomeContent from '@/components/HomeContent';
import { SearchModeProvider } from '@/contexts/SearchModeContext';

export default function HomePage() {
  return (
    <SearchModeProvider>
      <HomeContent />
    </SearchModeProvider>
  );
}
