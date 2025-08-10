'use client';

import { Button } from '@/components/ui/button';
import { Calculator, Users } from 'lucide-react';

interface SellPageClientProps {
  children?: React.ReactNode;
}

export function SellHeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <Button
        className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg"
        onClick={() => {
          // Scroll to valuation form
          const valuationForm = document.querySelector('.bg-white.rounded-2xl.p-6.shadow-2xl');
          valuationForm?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <Calculator className="mr-2 h-5 w-5" />
        Get Free Valuation
      </Button>
      <Button
        variant="outline"
        className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg"
        onClick={() => {
          // Scroll to agents section
          const agentsSection = document.querySelector('h2:contains("Top-Rated Estate Agents")');
          agentsSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <Users className="mr-2 h-5 w-5" />
        Find an Agent
      </Button>
    </div>
  );
}

export function ValuationButton() {
  return (
    <Button
      className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
      onClick={(e) => {
        e.preventDefault();
        // Mock valuation result
        const estimatedValue = Math.floor(Math.random() * 200000) + 150000;
        alert(`Property valuation estimate: €${estimatedValue.toLocaleString()}\n\nA detailed report will be sent to your email within 24 hours.`);
      }}
    >
      Get Instant Valuation
    </Button>
  );
}
