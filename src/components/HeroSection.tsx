"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Filter, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AdvancedSearchModal, { SearchFilters } from "@/components/AdvancedSearchModal";
import PropertyComparison from "@/components/PropertyComparison";

// Dynamically import WorkingSearch to prevent hydration mismatch
const WorkingSearch = dynamic(() => import("@/components/WorkingSearch"), {
  ssr: false,
  loading: () => (
    <div className="relative h-12 w-full bg-white rounded-lg">
      <div className="flex items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            placeholder="Search for an Island, City or Area"
            className="pl-10 pr-4 h-12 text-gray-900 placeholder:text-gray-500 bg-white border border-white focus:border-white focus:ring-1 focus:ring-white"
            disabled
          />
        </div>
        <Button
          variant="ghost"
          className="bg-transparent text-gray-600 px-3 h-10 ml-2 rounded-md shadow-none relative before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gray-300"
          disabled
        >
          <MapPin className="h-4 w-4 mr-1 stroke-current" />
          Map
        </Button>
      </div>
    </div>
  )
});

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("buy");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const tabs = [
    { id: "buy", label: t.buy },
    { id: "rent", label: t.rent },
    { id: "developments", label: t.developments },
    { id: "agents", label: t.agents },
    { id: "sold-prices", label: t.soldPrices }
  ];

  const handleAdvancedSearch = (filters: SearchFilters) => {
    console.log("Advanced search filters:", filters);
    // Implement search logic here
    // You could navigate to a search results page or update the current page
  };

  const handleQuickSearch = () => {
    // Navigate to buy page with search parameters
    router.push('/buy?search=active');
  };

  const handleMapClick = () => {
    router.push('/map');
  };

  const getHeroTitle = () => {
    switch (activeTab) {
      case "buy":
        return "Find Property for Sale in Cape Verde";
      case "rent":
        return "Find Property for Rent in Cape Verde";
      case "developments":
        return "Find New Developments in Cape Verde";
      case "agents":
        return "Find Estate Agents in Cape Verde";
      case "sold-prices":
        return "Find Sold Prices in Cape Verde";
      default:
        return "Find Property for Sale in Cape Verde";
    }
  };

  return (
    <>
      <section
        className="relative bg-cover bg-center bg-no-repeat min-h-[600px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-light md:font-bold text-white mb-4">
                {getHeroTitle()}
              </h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6 px-4">
              <div className="flex bg-black bg-opacity-30 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-4 lg:px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                      activeTab === tab.id
                        ? "bg-red-600 text-white"
                        : "text-white hover:bg-white hover:bg-opacity-20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Form - Unified Blue Container */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-blue-600 border-blue-700 text-white rounded-lg shadow-lg">
                <div className="px-4 py-4">
                  {/* Main Search Row */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 rounded-lg">
                      {/* Search Input - Functional WorkingSearch */}
                      <div className="flex-1 relative">
                        <WorkingSearch
                          placeholder={t.heroSearchPlaceholder}
                          onLocationSelect={(location) => {
                            console.log('Location selected:', location);
                            router.push('/map');
                          }}
                          onSearch={(query) => {
                            console.log('Search performed:', query);
                            router.push('/map');
                          }}
                          onMapClick={handleMapClick}
                          className="h-12 w-full"
                          showMapButton={true}
                        />
                      </div>

                      {/* Search Button */}
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white px-6 h-12 rounded-lg"
                        onClick={handleQuickSearch}
                      >
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Property Filters - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <Select>
                      <SelectTrigger className="bg-white text-gray-900 border-white">
                        <SelectValue placeholder={t.propertyType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">{t.house}</SelectItem>
                        <SelectItem value="apartment">{t.apartment}</SelectItem>
                        <SelectItem value="townhouse">{t.townhouse}</SelectItem>
                        <SelectItem value="land">{t.land}</SelectItem>
                        <SelectItem value="commercial">{t.commercial}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="bg-white text-gray-900 border-white">
                        <SelectValue placeholder={t.minPrice} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">€50,000</SelectItem>
                        <SelectItem value="100000">€100,000</SelectItem>
                        <SelectItem value="150000">€150,000</SelectItem>
                        <SelectItem value="200000">€200,000</SelectItem>
                        <SelectItem value="300000">€300,000</SelectItem>
                        <SelectItem value="500000">€500,000</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="bg-white text-gray-900 border-white">
                        <SelectValue placeholder={t.maxPrice} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100000">€100,000</SelectItem>
                        <SelectItem value="200000">€200,000</SelectItem>
                        <SelectItem value="300000">€300,000</SelectItem>
                        <SelectItem value="500000">€500,000</SelectItem>
                        <SelectItem value="1000000">€1,000,000</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="bg-white text-gray-900 border-white">
                        <SelectValue placeholder={t.bedrooms} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Advanced Options */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="link"
                      className="text-white p-0 hover:text-gray-200"
                      onClick={() => setIsAdvancedSearchOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {t.moreFilters} +
                    </Button>
                    <Button
                      variant="link"
                      className="text-white p-0 hover:text-gray-200"
                      onClick={() => setIsComparisonOpen(true)}
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Compare Properties
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />

      {/* Property Comparison Modal */}
      <PropertyComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </>
  );
}
