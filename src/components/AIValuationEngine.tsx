"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, Calculator, Sparkles, BarChart3, MapPin, Home, Calendar, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number;
  lotSize: number;
  yearBuilt: number;
  condition: string;
  location: string;
  island: string;
  propertyType: string;
  oceanView: boolean;
  beachAccess: boolean;
  pool: boolean;
  garage: boolean;
  solarPanels: boolean;
  modernKitchen: boolean;
  airConditioning: boolean;
  securitySystem: boolean;
}

interface AIValuation {
  estimatedValue: number;
  confidence: number;
  valuationRange: {
    low: number;
    high: number;
  };
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    similarity: number;
    area: number;
  }>;
  marketTrends: {
    priceChange6Months: number;
    priceChange1Year: number;
    marketVelocity: string;
    demandLevel: string;
  };
  factorAnalysis: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  aiInsights: string[];
}

interface AIValuationEngineProps {
  propertyId?: string;
  initialFeatures?: Partial<PropertyFeatures>;
}

export default function AIValuationEngine({ propertyId, initialFeatures }: AIValuationEngineProps) {
  const [features, setFeatures] = useState<PropertyFeatures>({
    bedrooms: initialFeatures?.bedrooms || 3,
    bathrooms: initialFeatures?.bathrooms || 2,
    area: initialFeatures?.area || 150,
    lotSize: initialFeatures?.lotSize || 300,
    yearBuilt: initialFeatures?.yearBuilt || 2015,
    condition: initialFeatures?.condition || "good",
    location: initialFeatures?.location || "Praia",
    island: initialFeatures?.island || "Santiago",
    propertyType: initialFeatures?.propertyType || "house",
    oceanView: initialFeatures?.oceanView || false,
    beachAccess: initialFeatures?.beachAccess || false,
    pool: initialFeatures?.pool || false,
    garage: initialFeatures?.garage || true,
    solarPanels: initialFeatures?.solarPanels || false,
    modernKitchen: initialFeatures?.modernKitchen || true,
    airConditioning: initialFeatures?.airConditioning || true,
    securitySystem: initialFeatures?.securitySystem || false
  });

  const [valuation, setValuation] = useState<AIValuation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);

  // Simulate AI/ML computation
  const calculateValuation = async () => {
    setIsCalculating(true);
    setCalculationProgress(0);

    // Simulate ML processing steps
    const steps = [
      "Analyzing property features...",
      "Processing market data...",
      "Running ML algorithms...",
      "Comparing with similar properties...",
      "Calculating market trends...",
      "Generating AI insights...",
      "Finalizing valuation..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCalculationProgress(((i + 1) / steps.length) * 100);
    }

    // AI/ML Valuation Algorithm (simplified simulation)
    const baseValue = calculateBaseValue(features);
    const locationMultiplier = getLocationMultiplier(features.island, features.location);
    const amenityBonus = calculateAmenityBonus(features);
    const conditionMultiplier = getConditionMultiplier(features.condition);
    const ageDepreciation = calculateAgeDepreciation(features.yearBuilt);

    const estimatedValue = Math.round(
      baseValue * locationMultiplier * conditionMultiplier * ageDepreciation + amenityBonus
    );

    const confidence = calculateConfidence(features);
    const variance = estimatedValue * (1 - confidence) * 0.15;

    const mockValuation: AIValuation = {
      estimatedValue,
      confidence: confidence * 100,
      valuationRange: {
        low: Math.round(estimatedValue - variance),
        high: Math.round(estimatedValue + variance)
      },
      comparables: generateComparables(features, estimatedValue),
      marketTrends: generateMarketTrends(features.island),
      factorAnalysis: generateFactorAnalysis(features),
      aiInsights: generateAIInsights(features, estimatedValue)
    };

    setValuation(mockValuation);
    setIsCalculating(false);
  };

  // ML Algorithm Functions (simplified)
  const calculateBaseValue = (features: PropertyFeatures): number => {
    // Base price per m² by island and property type
    const basePrices: Record<string, Record<string, number>> = {
      "Santiago": { house: 1200, apartment: 1000, villa: 1800 },
      "Sal": { house: 1500, apartment: 1200, villa: 2200 },
      "São Vicente": { house: 1100, apartment: 900, villa: 1600 },
      "Boa Vista": { house: 1300, apartment: 1100, villa: 1900 }
    };

    const basePrice = basePrices[features.island]?.[features.propertyType] || 1000;
    return features.area * basePrice;
  };

  const getLocationMultiplier = (island: string, location: string): number => {
    const multipliers: Record<string, number> = {
      "Santa Maria": 1.4, "Praia": 1.2, "Mindelo": 1.1, "Sal Rei": 1.3,
      "Espargos": 1.1, "Tarrafal": 1.0, "Assomada": 0.9
    };
    return multipliers[location] || 1.0;
  };

  const calculateAmenityBonus = (features: PropertyFeatures): number => {
    let bonus = 0;
    if (features.oceanView) bonus += 50000;
    if (features.beachAccess) bonus += 75000;
    if (features.pool) bonus += 30000;
    if (features.garage) bonus += 15000;
    if (features.solarPanels) bonus += 20000;
    if (features.modernKitchen) bonus += 10000;
    if (features.airConditioning) bonus += 8000;
    if (features.securitySystem) bonus += 12000;
    return bonus;
  };

  const getConditionMultiplier = (condition: string): number => {
    const multipliers: Record<string, number> = {
      "excellent": 1.1, "good": 1.0, "fair": 0.9, "poor": 0.75
    };
    return multipliers[condition] || 1.0;
  };

  const calculateAgeDepreciation = (yearBuilt: number): number => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearBuilt;
    return Math.max(0.7, 1 - (age * 0.008)); // 0.8% depreciation per year
  };

  const calculateConfidence = (features: PropertyFeatures): number => {
    let confidence = 0.8; // Base confidence

    // Boost confidence for complete data
    if (features.area > 0) confidence += 0.05;
    if (features.yearBuilt > 1980) confidence += 0.05;
    if (["Santiago", "Sal"].includes(features.island)) confidence += 0.1;

    return Math.min(0.95, confidence);
  };

  const generateComparables = (features: PropertyFeatures, estimatedValue: number) => {
    const variations = [-0.15, -0.08, 0.05, 0.12];
    return variations.map((variation, index) => ({
      address: `Property ${index + 1}, ${features.location}`,
      soldPrice: Math.round(estimatedValue * (1 + variation)),
      soldDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      similarity: Math.round((1 - Math.abs(variation)) * 100),
      area: features.area + Math.round((Math.random() - 0.5) * 50)
    }));
  };

  const generateMarketTrends = (island: string) => {
    const trends: Record<string, { priceChange6Months: number; priceChange1Year: number; marketVelocity: string; demandLevel: string }> = {
      "Santiago": { priceChange6Months: 3.2, priceChange1Year: 8.1, marketVelocity: "Moderate", demandLevel: "High" },
      "Sal": { priceChange6Months: 5.8, priceChange1Year: 14.2, marketVelocity: "Fast", demandLevel: "Very High" },
      "São Vicente": { priceChange6Months: 2.1, priceChange1Year: 5.9, marketVelocity: "Moderate", demandLevel: "Moderate" }
    };
    return trends[island] || { priceChange6Months: 2.5, priceChange1Year: 7.0, marketVelocity: "Moderate", demandLevel: "Moderate" };
  };

  const generateFactorAnalysis = (features: PropertyFeatures) => {
    const factors = [
      { factor: "Location", impact: 25, description: `Prime location in ${features.location}` },
      { factor: "Property Size", impact: 20, description: `${features.area}m² living space` },
      { factor: "Ocean Proximity", impact: features.oceanView ? 15 : 5, description: features.oceanView ? "Direct ocean views" : "No ocean views" },
      { factor: "Property Age", impact: 10, description: `Built in ${features.yearBuilt}` },
      { factor: "Amenities", impact: 12, description: "Modern amenities and features" },
      { factor: "Market Conditions", impact: 18, description: "Current market trends in Cape Verde" }
    ];
    return factors.sort((a, b) => b.impact - a.impact);
  };

  const generateAIInsights = (features: PropertyFeatures, estimatedValue: number) => {
    const insights = [];

    if (features.oceanView) {
      insights.push("🌊 Ocean view properties in Cape Verde show 15-25% premium over similar properties without views");
    }

    if (features.island === "Sal") {
      insights.push("✈️ Sal island properties benefit from strong tourism demand and international airport proximity");
    }

    if (features.yearBuilt > 2020) {
      insights.push("🏗️ Recently built properties command premium pricing due to modern construction standards");
    }

    if (features.pool) {
      insights.push("🏊 Swimming pools add significant value in Cape Verde's tropical climate market");
    }

    insights.push(`📈 Current market analysis suggests ${Math.random() > 0.5 ? 'appreciation' : 'stability'} in ${features.location} over next 12 months`);

    return insights;
  };

  const updateFeature = (key: keyof PropertyFeatures, value: boolean | number | string) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            AI Property Valuation Engine
            <Badge className="ml-2 bg-purple-100 text-purple-800">Powered by ML</Badge>
          </CardTitle>
          <p className="text-gray-600">
            Get an instant AI-powered property valuation using advanced machine learning algorithms and Cape Verde market data.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Features Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select value={features.bedrooms.toString()} onValueChange={(value) => updateFeature('bedrooms', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select value={features.bathrooms.toString()} onValueChange={(value) => updateFeature('bathrooms', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                type="number"
                value={features.area}
                onChange={(e) => updateFeature('area', parseInt(e.target.value))}
                placeholder="Living area"
              />
            </div>

            <div>
              <Label htmlFor="island">Island</Label>
              <Select value={features.island} onValueChange={(value) => updateFeature('island', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Santiago">Santiago</SelectItem>
                  <SelectItem value="Sal">Sal</SelectItem>
                  <SelectItem value="São Vicente">São Vicente</SelectItem>
                  <SelectItem value="Boa Vista">Boa Vista</SelectItem>
                  <SelectItem value="Santo Antão">Santo Antão</SelectItem>
                  <SelectItem value="Fogo">Fogo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={features.location} onValueChange={(value) => updateFeature('location', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Praia">Praia</SelectItem>
                  <SelectItem value="Santa Maria">Santa Maria</SelectItem>
                  <SelectItem value="Mindelo">Mindelo</SelectItem>
                  <SelectItem value="Sal Rei">Sal Rei</SelectItem>
                  <SelectItem value="Espargos">Espargos</SelectItem>
                  <SelectItem value="Tarrafal">Tarrafal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                type="number"
                value={features.yearBuilt}
                onChange={(e) => updateFeature('yearBuilt', parseInt(e.target.value))}
                placeholder="2020"
                min="1950"
                max="2025"
              />
            </div>
          </div>

          {/* Premium Features */}
          <div>
            <Label className="text-base font-semibold">Premium Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                { key: 'oceanView', label: 'Ocean View', icon: '🌊' },
                { key: 'beachAccess', label: 'Beach Access', icon: '🏖️' },
                { key: 'pool', label: 'Swimming Pool', icon: '🏊' },
                { key: 'garage', label: 'Garage', icon: '🚗' },
                { key: 'solarPanels', label: 'Solar Panels', icon: '☀️' },
                { key: 'modernKitchen', label: 'Modern Kitchen', icon: '🍳' },
                { key: 'airConditioning', label: 'A/C', icon: '❄️' },
                { key: 'securitySystem', label: 'Security', icon: '🔒' }
              ].map(feature => (
                <div key={feature.key}
                     className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                       features[feature.key as keyof PropertyFeatures]
                         ? 'border-purple-500 bg-purple-50'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => updateFeature(feature.key as keyof PropertyFeatures, !features[feature.key as keyof PropertyFeatures])}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-sm font-medium">{feature.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateValuation}
            disabled={isCalculating}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                AI Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Get AI Valuation
              </div>
            )}
          </Button>

          {/* Progress Bar */}
          {isCalculating && (
            <div className="space-y-2">
              <Progress value={calculationProgress} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Running machine learning algorithms...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valuation Results */}
      {valuation && (
        <div className="space-y-6">
          {/* Main Valuation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  AI Valuation Result
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {valuation.confidence.toFixed(1)}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-green-600">
                  €{valuation.estimatedValue.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  Range: €{valuation.valuationRange.low.toLocaleString()} - €{valuation.valuationRange.high.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Price per m²: €{Math.round(valuation.estimatedValue / features.area).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Value Factor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {valuation.factorAnalysis.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{factor.factor}</span>
                      <span className="text-blue-600 font-semibold">{factor.impact}%</span>
                    </div>
                    <Progress value={factor.impact} className="h-2" />
                    <p className="text-sm text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{valuation.marketTrends.priceChange6Months}%
                  </div>
                  <div className="text-sm text-gray-600">6 Month Change</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{valuation.marketTrends.priceChange1Year}%
                  </div>
                  <div className="text-sm text-gray-600">1 Year Change</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {valuation.marketTrends.marketVelocity}
                  </div>
                  <div className="text-sm text-gray-600">Market Velocity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {valuation.marketTrends.demandLevel}
                  </div>
                  <div className="text-sm text-gray-600">Demand Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                AI Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {valuation.aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparable Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-indigo-600" />
                Comparable Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {valuation.comparables.map((comp, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{comp.address}</div>
                      <div className="text-sm text-gray-600">{comp.area}m² • Sold {comp.soldDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">€{comp.soldPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{comp.similarity}% similar</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
