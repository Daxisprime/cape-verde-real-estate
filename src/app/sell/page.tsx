"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostAdForm from "@/components/PostAdForm";
import { ArrowLeft } from "lucide-react";

export default function SellPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 mt-6 pb-20">
        {/* Close / Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-2 mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Create New Listing</h1>
          <p className="text-sm text-gray-500 mb-6">Post a property, item, or service to the marketplace.</p>
          <PostAdForm vendorId="vendor-1" />
        </div>
      </div>
    </div>
  );
}
