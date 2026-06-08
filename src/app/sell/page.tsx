"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import PostAdForm from "@/components/PostAdForm";
import { Calculator, TrendingUp, MapPin, BarChart3 } from "lucide-react";
import { CAPE_VERDE_ISLANDS } from "@/lib/supabase";

const PRICE_PER_SQM: Record<string, { min: number; max: number }> = {
  Santiago: { min: 45000, max: 120000 },
  "Sao Vicente": { min: 55000, max: 150000 },
  Sal: { min: 70000, max: 200000 },
  "Boa Vista": { min: 60000, max: 180000 },
  Fogo: { min: 30000, max: 80000 },
  "Santo Antao": { min: 25000, max: 70000 },
  Maio: { min: 25000, max: 60000 },
  Brava: { min: 20000, max: 55000 },
  "Sao Nicolau": { min: 20000, max: 50000 },
};

export default function SellPage() {
  const [valIsland, setValIsland] = useState("");
  const [valSize, setValSize] = useState("");
  const [valuation, setValuation] = useState<{ min: number; max: number } | null>(null);

  const calculateValuation = () => {
    const size = parseFloat(valSize);
    const rates = PRICE_PER_SQM[valIsland];
    if (!size || !rates) return;
    setValuation({ min: Math.round(rates.min * size), max: Math.round(rates.max * size) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 mt-6 items-start pb-20">
        {/* LEFT COLUMN: Valuation + Market Insights */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Free Valuation Calculator */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-[#2563EB]" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Free Valuation</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Island / Zone</label>
                  <select
                    value={valIsland}
                    onChange={(e) => { setValIsland(e.target.value); setValuation(null); }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                  >
                    <option value="">Select island...</option>
                    {CAPE_VERDE_ISLANDS.map((island) => (
                      <option key={island} value={island}>{island}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Size (m&sup2;)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={valSize}
                    onChange={(e) => { setValSize(e.target.value); setValuation(null); }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                  />
                </div>

                <button
                  onClick={calculateValuation}
                  disabled={!valIsland || !valSize}
                  className="w-full py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Calculate Estimate
                </button>

                {valuation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Estimated market value</p>
                    <p className="text-lg font-black text-gray-900">
                      {valuation.min.toLocaleString()} &ndash; {valuation.max.toLocaleString()} <span className="text-sm font-medium text-gray-500">CVE</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Based on {valIsland} market rates per m&sup2;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Market Insights Block */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Market Insights</h2>
              </div>

              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p>Praia property demand is up <span className="font-semibold text-emerald-600">+12%</span> this quarter with diaspora buyers driving luxury segment growth.</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p>Sal and Boa Vista rental yields averaging <span className="font-semibold text-[#2563EB]">7.2% annually</span> for tourist-zone apartments.</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p>Listings with photos sell <span className="font-semibold text-gray-900">3x faster</span> than text-only ads. Add at least 3 images to maximize reach.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: PostAdForm Upload Wizard */}
        <main className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Create New Listing</h1>
            <p className="text-sm text-gray-500 mb-6">Post a property, item, or service to the marketplace.</p>
            <PostAdForm vendorId="vendor-1" />
          </div>
        </main>
      </div>
    </div>
  );
}
