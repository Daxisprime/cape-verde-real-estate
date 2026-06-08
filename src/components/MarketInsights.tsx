"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Target, MapPin, Calendar, Euro, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MarketInsights() {
  const { t } = useLanguage();

  const marketData = [
    {
      island: "Santiago",
      avgPrice: 185000,
      priceChange: 12.5,
      saleVolume: 456,
      hotspots: ["Praia City Center", "Achada Santo António", "Palmarejo"],
      investment: "High",
      description: "Strong capital growth driven by government and business center status"
    },
    {
      island: "Sal",
      avgPrice: 320000,
      priceChange: 18.2,
      saleVolume: 234,
      hotspots: ["Santa Maria", "Espargos Airport Area", "Costa da Fragata"],
      investment: "Very High",
      description: "Tourism boom driving luxury beachfront property demand"
    },
    {
      island: "São Vicente",
      avgPrice: 156000,
      priceChange: 8.7,
      saleVolume: 167,
      hotspots: ["Mindelo Cultural District", "Monte Verde", "Baía das Gatas"],
      investment: "Medium",
      description: "Cultural capital with steady growth in historic properties"
    },
    {
      island: "Boa Vista",
      avgPrice: 280000,
      priceChange: 22.1,
      saleVolume: 89,
      hotspots: ["Sal Rei", "Chaves Beach", "Santa Mónica"],
      investment: "Very High",
      description: "Fastest growing market with major resort developments"
    },
    {
      island: "Santo Antão",
      avgPrice: 95000,
      priceChange: 5.3,
      saleVolume: 45,
      hotspots: ["Porto Novo", "Ribeira Grande", "Paúl Valley"],
      investment: "Low",
      description: "Eco-tourism potential with affordable mountain properties"
    },
    {
      island: "Fogo",
      avgPrice: 125000,
      priceChange: 7.8,
      saleVolume: 23,
      hotspots: ["São Filipe", "Chã das Caldeiras", "Mosteiros"],
      investment: "Medium",
      description: "Unique volcanic landscape attracting niche investors"
    }
  ];

  const insights = [
    {
      title: "Tourism Recovery Drives Growth",
      titlePt: "Recuperação do Turismo Impulsiona Crescimento",
      titleCv: "Rekuperasãu di Turismu Ta Impulsa Kresimentu",
      date: "January 2025",
      category: "Market Trend",
      categoryPt: "Tendência do Mercado",
      categoryCv: "Tendénsia di Merkadu",
      summary: "Cape Verde's property market showing strong recovery with tourism returning to pre-pandemic levels. Beach properties leading the surge.",
      summaryPt: "Mercado imobiliário de Cabo Verde mostra forte recuperação com turismo retornando aos níveis pré-pandemia. Propriedades na praia lideram o aumento.",
      summaryCv: "Merkadu imobiliáriu di Kabu Verdi ta mostra rekuperasãu forti ku turismu ta volta pa nível di antes pandemia. Propriedadi na praia ta lidera aumentu."
    },
    {
      title: "Foreign Investment Incentives",
      titlePt: "Incentivos ao Investimento Estrangeiro",
      titleCv: "Insentivo pa Investimentu Stranjer",
      date: "December 2024",
      category: "Government Policy",
      categoryPt: "Política Governamental",
      categoryCv: "Polítika Guvernamental",
      summary: "New government incentives for foreign property investors include reduced taxes and simplified residency procedures.",
      summaryPt: "Novos incentivos governamentais para investidores estrangeiros incluem impostos reduzidos e procedimentos de residência simplificados.",
      summaryCv: "Novu insentivo guvernamental pa investidor stranjer ta inklui impostu reduzidu i prosedimentu di residénsia simplifikadu."
    },
    {
      title: "Sustainable Development Focus",
      titlePt: "Foco no Desenvolvimento Sustentável",
      titleCv: "Foku na Disenvolvimentu Sustentavel",
      date: "November 2024",
      category: "Development",
      categoryPt: "Desenvolvimento",
      categoryCv: "Disenvolvimentu",
      summary: "Increased demand for eco-friendly properties as Cape Verde commits to renewable energy and sustainable tourism.",
      summaryPt: "Aumento da demanda por propriedades ecológicas enquanto Cabo Verde se compromete com energia renovável e turismo sustentável.",
      summaryCv: "Aumentu di demanda pa propriedadi ekolójiku enkuantu Kabu Verdi ta kompromete ku enerji renovavel i turismu sustentavel."
    }
  ];

  const { currentLanguage } = useLanguage();

  const getInsightTitle = (insight: typeof insights[0]) => {
    switch (currentLanguage) {
      case 'pt': return insight.titlePt;
      case 'cv': return insight.titleCv;
      default: return insight.title;
    }
  };

  const getInsightCategory = (insight: typeof insights[0]) => {
    switch (currentLanguage) {
      case 'pt': return insight.categoryPt;
      case 'cv': return insight.categoryCv;
      default: return insight.category;
    }
  };

  const getInsightSummary = (insight: typeof insights[0]) => {
    switch (currentLanguage) {
      case 'pt': return insight.summaryPt;
      case 'cv': return insight.summaryCv;
      default: return insight.summary;
    }
  };

  const getInvestmentColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'bg-green-500';
      case 'High': return 'bg-blue-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cape Verde Property Market Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest market trends, investment opportunities, and property data across all islands
          </p>
        </div>

        {/* Key Market Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">€205k</h3>
              <p className="text-gray-600">Average Property Price</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-semibold">+14.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">1,847</h3>
              <p className="text-gray-600">Properties Sold (2024)</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-semibold">+28%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">67%</h3>
              <p className="text-gray-600">Foreign Buyers</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-semibold">+5%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">6.8%</h3>
              <p className="text-gray-600">Avg. Rental Yield</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-semibold">+0.3%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Island Market Data */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Island-by-Island Market Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {marketData.map((island, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{island.island}</h3>
                    <Badge className={`${getInvestmentColor(island.investment)} text-white`}>
                      {island.investment}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg. Price:</span>
                      <span className="font-semibold">€{island.avgPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">YoY Growth:</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-semibold text-green-500">+{island.priceChange}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sales Volume:</span>
                      <span className="font-semibold">{island.saleVolume}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-2">Hot Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {island.hotspots.map((spot, spotIndex) => (
                          <Badge key={spotIndex} variant="outline" className="text-xs">
                            {spot}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 italic">{island.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Insights & News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Latest Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getInsightTitle(insight)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{getInsightCategory(insight)}</Badge>
                      <span className="text-sm text-gray-500">{insight.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {getInsightSummary(insight)}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                    Read Full Report →
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Opportunities */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Invest?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              <Target className="h-5 w-5 mr-2" />
              Investment Properties
            </Button>
            <Button size="lg" variant="outline">
              <BarChart3 className="h-5 w-5 mr-2" />
              Market Reports
            </Button>
          </div>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Get personalized investment advice from our market experts and discover the best opportunities across Cape Verde's growing property market.
          </p>
        </div>
      </div>
    </section>
  );
}
