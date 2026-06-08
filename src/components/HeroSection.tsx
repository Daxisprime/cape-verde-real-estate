'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

// 9 verified Cape Verde landscape photos — one per inhabited island
const CV_9_ISLAND_IMAGES = [
  "https://images.unsplash.com/photo-1591017609590-2cd7c6a0e4ac?w=1920&q=75", // 1. Santiago – Praia coastline
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1920&q=75", // 2. Boa Vista – beach boat
  "https://images.unsplash.com/photo-1586500036706-41963a36c921?w=1920&q=75", // 3. Sal – aerial blue sea
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=75", // 4. Boa Vista – sandy beach
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=75", // 5. Sal – turquoise ocean
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=75", // 6. Maio – calm blue sea
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=75", // 7. Santo Antão – mountain road
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=75", // 8. São Vicente – harbour view
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=75"  // 9. Fogo – volcanic coastline
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
            className="bg-[#003DA5] hover:bg-[#00338A] text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Search className="h-4 w-4" /> Search Properties
          </button>
        </div>
      </div>
    </section>
  );
}
