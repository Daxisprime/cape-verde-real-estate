"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target, Zap, Brain, AlertTriangle, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, PieChart, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MarketPrediction {
  timeframe: '3months' | '6months' | '1year' | '2years' | '5years';
  priceChange: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;
}

interface InvestmentMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  unit: string;
  description: string;
  category: 'performance' | 'risk' | 'opportunity';
}

interface MarketSegment {
  segment: string;
  averagePrice: number;
  priceChange: number;
  salesVolume: number;
  volumeChange: number;
  daysOnMarket: number;
  investmentScore: number;
}

interface PropertyHotspot {
  area: string;
  island: string;
  appreciationRate: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
  investmentPotential: number;
  avgPrice: number;
  pricePerSqm: number;
  reasons: string[];
}

interface AdvancedAnalyticsDashboardProps {
  focusArea?: string;
  propertyType?: string;
}

export default function AdvancedAnalyticsDashboard({ focusArea = "all", propertyType = "all" }: AdvancedAnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '1year' | '2years' | '5years'>('1year');
  const [selectedIsland, setSelectedIsland] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Sample market predictions
  const marketPredictions: Record<string, MarketPrediction> = {
    '3months': {
      timeframe: '3months',
      priceChange: 2.3,
      confidence: 85,
      factors: [
        { name: 'Tourism Recovery', impact: 15, direction: 'positive' },
        { name: 'Foreign Investment', impact: 12, direction: 'positive' },
        { name: 'Interest Rates', impact: -8, direction: 'negative' },
        { name: 'Currency Stability', impact: 6, direction: 'positive' }
      ]
    },
    '6months': {
      timeframe: '6months',
      priceChange: 5.8,
      confidence: 78,
      factors: [
        { name: 'Infrastructure Projects', impact: 20, direction: 'positive' },
        { name: 'New Airport Expansion', impact: 18, direction: 'positive' },
        { name: 'Global Economic Conditions', impact: -10, direction: 'negative' },
        { name: 'Local Housing Demand', impact: 14, direction: 'positive' }
      ]
    },
    '1year': {
      timeframe: '1year',
      priceChange: 12.5,
      confidence: 72,
      factors: [
        { name: 'Resort Development', impact: 25, direction: 'positive' },
        { name: 'Digital Nomad Influx', impact: 20, direction: 'positive' },
        { name: 'Climate Change Impact', impact: -15, direction: 'negative' },
        { name: 'Government Incentives', impact: 18, direction: 'positive' }
      ]
    },
    '2years': {
      timeframe: '2years',
      priceChange: 28.4,
      confidence: 65,
      factors: [
        { name: 'Smart City Initiative', impact: 35, direction: 'positive' },
        { name: 'Green Energy Transition', impact: 22, direction: 'positive' },
        { name: 'Regional Competition', impact: -18, direction: 'negative' },
        { name: 'Population Growth', impact: 16, direction: 'positive' }
      ]
    },
    '5years': {
      timeframe: '5years',
      priceChange: 45.2,
      confidence: 58,
      factors: [
        { name: 'Climate Resilience Premium', impact: 40, direction: 'positive' },
        { name: 'Tech Hub Development', impact: 30, direction: 'positive' },
        { name: 'Water Scarcity Concerns', impact: -25, direction: 'negative' },
        { name: 'Sustainable Tourism', impact: 28, direction: 'positive' }
      ]
    }
  };

  const investmentMetrics: InvestmentMetric[] = [
    {
      id: 'roi',
      name: 'Average ROI',
      value: 8.4,
      change: 1.2,
      changeDirection: 'up',
      unit: '%',
      description: 'Annual return on investment',
      category: 'performance'
    },
    {
      id: 'appreciation',
      name: 'Price Appreciation',
      value: 14.2,
      change: 2.8,
      changeDirection: 'up',
      unit: '%',
      description: 'Year-over-year price increase',
      category: 'performance'
    },
    {
      id: 'rental-yield',
      name: 'Rental Yield',
      value: 6.8,
      change: 0.3,
      changeDirection: 'up',
      unit: '%',
      description: 'Annual rental income vs property value',
      category: 'performance'
    },
    {
      id: 'market-volatility',
      name: 'Market Volatility',
      value: 12.5,
      change: -1.8,
      changeDirection: 'down',
      unit: '%',
      description: 'Price volatility index',
      category: 'risk'
    },
    {
      id: 'liquidity',
      name: 'Market Liquidity',
      value: 76,
      change: 5,
      changeDirection: 'up',
      unit: 'index',
      description: 'Ease of buying/selling properties',
      category: 'risk'
    },
    {
      id: 'demand-supply',
      name: 'Demand/Supply Ratio',
      value: 1.8,
      change: 0.2,
      changeDirection: 'up',
      unit: 'ratio',
      description: 'Market demand relative to supply',
      category: 'opportunity'
    }
  ];

  const marketSegments: MarketSegment[] = [
    {
      segment: 'Luxury Villas',
      averagePrice: 850000,
      priceChange: 18.5,
      salesVolume: 45,
      volumeChange: 25,
      daysOnMarket: 89,
      investmentScore: 92
    },
    {
      segment: 'Beach Apartments',
      averagePrice: 320000,
      priceChange: 15.2,
      salesVolume: 128,
      volumeChange: 18,
      daysOnMarket: 62,
      investmentScore: 88
    },
    {
      segment: 'City Center',
      averagePrice: 185000,
      priceChange: 12.8,
      salesVolume: 234,
      volumeChange: 12,
      daysOnMarket: 45,
      investmentScore: 75
    },
    {
      segment: 'Tourism Zones',
      averagePrice: 420000,
      priceChange: 22.1,
      salesVolume: 89,
      volumeChange: 35,
      daysOnMarket: 38,
      investmentScore: 95
    },
    {
      segment: 'Residential Areas',
      averagePrice: 145000,
      priceChange: 8.9,
      salesVolume: 156,
      volumeChange: 8,
      daysOnMarket: 72,
      investmentScore: 68
    }
  ];

  const propertyHotspots: PropertyHotspot[] = [
    {
      area: 'Santa Maria',
      island: 'Sal',
      appreciationRate: 24.5,
      demandLevel: 'very-high',
      investmentPotential: 95,
      avgPrice: 420000,
      pricePerSqm: 2100,
      reasons: [
        'New luxury resort development announced',
        'International airport expansion completed',
        'Growing digital nomad community',
        'Limited beachfront supply'
      ]
    },
    {
      area: 'Mindelo Cultural District',
      island: 'São Vicente',
      appreciationRate: 18.2,
      demandLevel: 'high',
      investmentPotential: 88,
      avgPrice: 185000,
      pricePerSqm: 1250,
      reasons: [
        'UNESCO World Heritage application pending',
        'Cultural tourism boom',
        'Historic property renovation incentives',
        'Artist community growth'
      ]
    },
    {
      area: 'Praia Business District',
      island: 'Santiago',
      appreciationRate: 16.8,
      demandLevel: 'high',
      investmentPotential: 82,
      avgPrice: 245000,
      pricePerSqm: 1580,
      reasons: [
        'Government sector expansion',
        'New banking headquarters',
        'Infrastructure modernization',
        'Commercial district development'
      ]
    },
    {
      area: 'Chaves Beach',
      island: 'Boa Vista',
      appreciationRate: 28.9,
      demandLevel: 'very-high',
      investmentPotential: 90,
      avgPrice: 380000,
      pricePerSqm: 1900,
      reasons: [
        'Pristine beach development',
        'Eco-tourism focus',
        'Limited development permits',
        'Celebrity endorsements'
      ]
    }
  ];

  useEffect(() => {
    // Simulate AI analysis when component mounts
    runAIAnalysis();
  }, [selectedTimeframe, selectedIsland]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const steps = [
      "Gathering market data...",
      "Analyzing price trends...",
      "Processing economic indicators...",
      "Running ML prediction models...",
      "Calculating investment scores...",
      "Generating insights..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(((i + 1) / steps.length) * 100);
    }

    setIsAnalyzing(false);
  };

  const getDemandLevelColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvestmentScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentPrediction = marketPredictions[selectedTimeframe];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-6 w-6 mr-2 text-purple-600" />
                Advanced Market Analytics
                <Badge className="ml-2 bg-purple-100 text-purple-800">AI-Powered</Badge>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Real-time market intelligence with machine learning predictions for Cape Verde real estate
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedIsland} onValueChange={setSelectedIsland}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Island" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Islands</SelectItem>
                  <SelectItem value="santiago">Santiago</SelectItem>
                  <SelectItem value="sal">Sal</SelectItem>
                  <SelectItem value="sao-vicente">São Vicente</SelectItem>
                  <SelectItem value="boa-vista">Boa Vista</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
                <Zap className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">AI Analysis in Progress</div>
              <Progress value={analysisProgress} className="w-full" />
              <div className="text-sm text-gray-600">
                Processing {selectedIsland === 'all' ? 'all islands' : selectedIsland} market data...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {investmentMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-full ${
                  metric.category === 'performance' ? 'bg-green-100' :
                  metric.category === 'risk' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {metric.category === 'performance' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {metric.category === 'risk' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {metric.category === 'opportunity' && <Target className="h-4 w-4 text-blue-600" />}
                </div>
                <div className={`flex items-center text-sm ${
                  metric.changeDirection === 'up' ? 'text-green-600' :
                  metric.changeDirection === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {metric.changeDirection === 'up' && <ArrowUpRight className="h-3 w-3" />}
                  {metric.changeDirection === 'down' && <ArrowDownRight className="h-3 w-3" />}
                  {metric.changeDirection === 'up' && '+'}
                  {metric.change}{metric.unit}
                </div>
              </div>
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="predictions">Market Predictions</TabsTrigger>
              <TabsTrigger value="segments">Market Segments</TabsTrigger>
              <TabsTrigger value="hotspots">Investment Hotspots</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">AI Market Predictions</h3>
                  <Select value={selectedTimeframe} onValueChange={(value: '3months' | '6months' | '1year' | '2years' | '5years') => setSelectedTimeframe(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Prediction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Price Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-green-600">
                          +{currentPrediction.priceChange}%
                        </div>
                        <div className="text-gray-600">
                          Expected price change over {selectedTimeframe}
                        </div>
                        <div className="mt-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {currentPrediction.confidence}% Confidence
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">Key Factors:</div>
                        {currentPrediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{factor.name}</span>
                            <div className="flex items-center">
                              <div className={`text-sm font-medium ${
                                factor.direction === 'positive' ? 'text-green-600' :
                                factor.direction === 'negative' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {factor.direction === 'positive' && '+'}
                                {factor.impact}%
                              </div>
                              {factor.direction === 'positive' && <ArrowUpRight className="h-3 w-3 text-green-600 ml-1" />}
                              {factor.direction === 'negative' && <ArrowDownRight className="h-3 w-3 text-red-600 ml-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Investment Opportunity Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Investment Opportunity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-blue-600">
                          {Math.round(currentPrediction.confidence * 0.9)}
                        </div>
                        <div className="text-gray-600">Investment Score</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Based on 47 market indicators
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Market Growth</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Liquidity</span>
                            <span>78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Level</span>
                            <span>35%</span>
                          </div>
                          <Progress value={35} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="segments" className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Market Segment Analysis</h3>
                <div className="space-y-3">
                  {marketSegments.map((segment, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div>
                            <div className="font-semibold">{segment.segment}</div>
                            <div className="text-sm text-gray-600">
                              Investment Score: <span className={`font-medium ${getInvestmentScoreColor(segment.investmentScore)}`}>
                                {segment.investmentScore}
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="font-semibold">€{segment.averagePrice.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Avg Price</div>
                            <div className={`text-xs ${segment.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {segment.priceChange > 0 ? '+' : ''}{segment.priceChange}%
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="font-semibold">{segment.salesVolume}</div>
                            <div className="text-sm text-gray-600">Sales Volume</div>
                            <div className={`text-xs ${segment.volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {segment.volumeChange > 0 ? '+' : ''}{segment.volumeChange}%
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="font-semibold">{segment.daysOnMarket}</div>
                            <div className="text-sm text-gray-600">Days on Market</div>
                          </div>

                          <div className="text-center">
                            <Progress value={segment.investmentScore} className="w-full" />
                          </div>

                          <div className="text-center">
                            <Button size="sm" variant="outline">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hotspots" className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Investment Hotspots</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {propertyHotspots.map((hotspot, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{hotspot.area}</CardTitle>
                          <Badge className={getDemandLevelColor(hotspot.demandLevel)}>
                            {hotspot.demandLevel.replace('-', ' ')} demand
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">{hotspot.island} Island</div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              +{hotspot.appreciationRate}%
                            </div>
                            <div className="text-xs text-gray-600">Appreciation</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {hotspot.investmentPotential}
                            </div>
                            <div className="text-xs text-gray-600">Invest Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              €{hotspot.pricePerSqm}
                            </div>
                            <div className="text-xs text-gray-600">Per m²</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Key Growth Drivers:</div>
                          {hotspot.reasons.map((reason, i) => (
                            <div key={i} className="text-xs text-gray-600 flex items-start">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">AI-Generated Market Insights</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                        Market Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="font-semibold text-green-800 mb-2">🚀 Emerging Trend</div>
                        <div className="text-sm text-green-700">
                          Digital nomad influx driving 35% increase in long-term rental demand in Santa Maria and Mindelo.
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-2">💎 Value Opportunity</div>
                        <div className="text-sm text-blue-700">
                          Beachfront properties in Boa Vista showing 40% discount compared to Sal, with similar amenities and growth potential.
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="font-semibold text-purple-800 mb-2">🏗️ Development Pipeline</div>
                        <div className="text-sm text-purple-700">
                          €2.5B infrastructure investment announced for 2025-2027, focusing on renewable energy and smart city initiatives.
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                        Market Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="font-semibold text-red-800 mb-2">⚠️ Climate Risk</div>
                        <div className="text-sm text-red-700">
                          Sea level rise projections suggest 15% of coastal properties may face increased insurance costs by 2030.
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="font-semibold text-orange-800 mb-2">📊 Market Volatility</div>
                        <div className="text-sm text-orange-700">
                          Tourism-dependent areas showing higher price volatility (±18%) compared to residential markets (±8%).
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="font-semibold text-yellow-800 mb-2">🏦 Financing Changes</div>
                        <div className="text-sm text-yellow-700">
                          Central Bank policy changes may increase mortgage rates by 0.5-1.2% over next 12 months.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      AI Investment Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="font-semibold text-green-800 mb-2">BUY Signal</div>
                        <div className="text-sm text-green-700 mb-3">
                          Tourism-adjacent properties in Sal showing strong fundamentals with 85% confidence for 15%+ returns.
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          View Properties
                        </Button>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                        <div className="font-semibold text-yellow-800 mb-2">HOLD Signal</div>
                        <div className="text-sm text-yellow-700 mb-3">
                          Urban residential properties maintaining steady appreciation but limited upside potential.
                        </div>
                        <Button size="sm" variant="outline">
                          Monitor Market
                        </Button>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-2">RESEARCH Signal</div>
                        <div className="text-sm text-blue-700 mb-3">
                          Emerging markets in Santo Antão require deeper analysis for eco-tourism potential.
                        </div>
                        <Button size="sm" variant="outline">
                          Research Tools
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
