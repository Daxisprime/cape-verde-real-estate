"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegionalListings() {
  const { t } = useLanguage();

  const islands = [
    {
      name: "Santiago",
      cities: ["Praia", "Assomada", "Tarrafal", "São Domingos", "Ribeira Grande de Santiago"],
      description: "The largest island and political center"
    },
    {
      name: "São Vicente",
      cities: ["Mindelo", "Baía das Gatas", "Calhau", "São Pedro"],
      description: "Cultural capital with vibrant music scene"
    },
    {
      name: "Sal",
      cities: ["Espargos", "Santa Maria", "Palmeira", "Pedra de Lume"],
      description: "Tourist paradise with beautiful beaches"
    },
    {
      name: "Fogo",
      cities: ["São Filipe", "Mosteiros", "Chã das Caldeiras", "Cova Figueira"],
      description: "Volcanic island with unique landscapes"
    },
    {
      name: "Boa Vista",
      cities: ["Sal Rei", "Povoação Velha", "João Galego", "Cabeça dos Tarafes"],
      description: "Desert island with pristine beaches"
    },
    {
      name: "Santo Antão",
      cities: ["Porto Novo", "Ribeira Grande", "Paúl", "Ponta do Sol"],
      description: "Mountainous island perfect for hiking"
    },
    {
      name: "Maio",
      cities: ["Vila do Maio", "Calheta", "Morro", "Pedro Vaz"],
      description: "Quiet island with traditional charm"
    },
    {
      name: "São Nicolau",
      cities: ["Ribeira Brava", "Tarrafal de São Nicolau", "Carriçal", "Juncalinho"],
      description: "Historic island with colonial architecture"
    },
    {
      name: "Brava",
      cities: ["Nova Sintra", "Fajã de Água", "Furna", "Nossa Senhora do Monte"],
      description: "The flower island, smallest inhabited island"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.regionalTitle}
          </h2>
          <p className="text-blue-100 text-lg">
            {t.regionalSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {islands.map((island, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {island.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {island.description}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {island.cities.map((city, cityIndex) => (
                    <Link
                      key={cityIndex}
                      href={`/for-sale/${island.name.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Trends */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-6 lg:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t.propertyTrends}
              </h3>
              <p className="text-gray-600 mb-4">
                Stay updated with the latest property market trends across Cape Verde islands.
                Track price movements, popular areas, and investment opportunities.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.avgPropertyPrice}</span>
                  <span className="font-semibold text-green-600">€185,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.priceGrowth}</span>
                  <span className="font-semibold text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.mostPopularIsland}</span>
                  <span className="font-semibold text-blue-600">Santiago</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
                <div className="text-gray-600">{t.propertiesListed}</div>
                <div className="text-sm text-gray-500 mt-2">{t.acrossAllIslands}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
