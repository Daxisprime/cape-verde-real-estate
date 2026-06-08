'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

// 9 High-Resolution scenery photos for each inhabited island of Cape Verde
const CV_9_ISLAND_IMAGES = [
  "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80", // 1. Santiago (Tropical Beach)
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80", // 2. Santo Antão (Mountain Valleys)
  "https://images.unsplash.com/photo-1462275646964-a0e3571f4f7c?w=1920&q=80", // 3. Fogo (Volcanic Landscape)
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", // 4. Boa Vista (Sandy Dunes Beach)
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1920&q=80", // 5. Sal (Crystal Ocean Waters)
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", // 6. São Vicente (Harbor Coastline)
  "https://images.unsplash.com/photo-1500259571355-332da5cb07aa?w=1920&q=80", // 7. São Nicolau (Rugged Terrain)
  "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1920&q=80", // 8. Maio (Peaceful Beach)
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80"  // 9. Brava (Scenic Landscape)
];

export default function HeroSection() {
  const [backgroundImage, setBackgroundImage] = useState(CV_9_ISLAND_IMAGES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Calculate a unique, stable number for each day of the calendar year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Modulo arithmetic cleanly loops from index 0 to 8 day-by-day
    const activeIndex = dayOfYear % CV_9_ISLAND_IMAGES.length;
    setBackgroundImage(CV_9_ISLAND_IMAGES[activeIndex]);
  }, []);

  const handleSearch = () => {
    router.push('/map');
  };

  return (
    <section
      className="relative w-full h-[75vh] min-h-[500px] flex items-center justify-center bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark film overlay for search box contrast */}
      <div className="absolute inset-0 bg-slate-950/40 z-0 backdrop-blur-[1px]" />

      {/* Main Landing Search Box Console Component */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center text-white space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
            Find Your Space in Cape Verde
          </h1>
          <p className="text-sm md:text-base text-gray-100 font-medium tracking-wide drop-shadow-sm">
            Discover houses, apartments, and commercial listings across 9 inhabited islands
          </p>
        </div>

        {/* Trulia-style input bar */}
        <div className="w-full bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-white/20 pointer-events-auto">
          <div className="flex-1 relative flex items-center">
            <MapPin className="absolute left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter island or neighborhood (e.g., Palmarejo, Sal)..."
              className="w-full pl-12 pr-4 py-3 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Search className="h-4 w-4" /> Search Properties
          </button>
        </div>
      </div>
    </section>
  );
}
