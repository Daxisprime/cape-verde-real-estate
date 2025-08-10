"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, TrendingUp, BookOpen, Users, Home, Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InfoSection() {
  const { t } = useLanguage();

  const infoCards = [
    {
      icon: Bell,
      title: t.propertyAlerts,
      description: "Sign up for an account and receive property alerts when new properties match your search criteria.",
      buttonText: "Sign Up Now",
      color: "text-red-500"
    },
    {
      icon: TrendingUp,
      title: t.marketTrends,
      description: "Find the value of any property in Cape Verde and track market trends across all islands.",
      buttonText: "View Market Data",
      color: "text-green-500"
    },
    {
      icon: BookOpen,
      title: t.propertyGuides,
      description: "Get all the information you need when buying a property in Cape Verde with our comprehensive guides.",
      buttonText: "View Property Guides",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: t.findAgents,
      description: "Connect with trusted estate agents across Cape Verde's islands to help you find your perfect property.",
      buttonText: "Search Agents",
      color: "text-purple-500"
    },
    {
      icon: Home,
      title: t.propertyValuation,
      description: "Get a free property valuation for your Cape Verde property using our automated valuation tools.",
      buttonText: "Get Valuation",
      color: "text-orange-500"
    },
    {
      icon: Calculator,
      title: t.mortgageCalculator,
      description: "Calculate your mortgage payments and affordability for properties in Cape Verde.",
      buttonText: "Calculate Now",
      color: "text-indigo-500"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.discoverTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.discoverSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {infoCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {card.description}
                </p>
                <Button variant="outline" className="w-full">
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
