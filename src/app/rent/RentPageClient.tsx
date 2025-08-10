'use client';

import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export function MoreFiltersButton() {
  return (
    <Button
      variant="outline"
      className="mb-4 sm:mb-0 text-gray-700 border-gray-300"
      onClick={() => {
        alert('Advanced filters coming soon! Use the dropdowns above for now.');
      }}
    >
      <Filter className="mr-2 h-4 w-4" />
      More Filters
    </Button>
  );
}

export function SearchRentalsButton() {
  return (
    <Button
      className="bg-green-600 hover:bg-green-700 px-8"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('Searching rental properties with your criteria...');
      }}
    >
      <Search className="mr-2 h-4 w-4" />
      Search Rentals
    </Button>
  );
}
