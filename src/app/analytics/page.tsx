"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Advanced Market Analytics
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              AI-powered market intelligence with machine learning predictions and comprehensive investment insights for Cape Verde real estate
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdvancedAnalyticsDashboard />
      </div>

      <Footer />
    </div>
  );
}
