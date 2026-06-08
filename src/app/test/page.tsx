"use client";

import { useState, useEffect } from "react";

export default function TestPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [testData, setTestData] = useState("Loading...");

  useEffect(() => {
    setIsMounted(true);
    setTestData("Component mounted successfully!");
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Test Page...</h1>
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">ProCV Debug Test Page</h1>

        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mounting Test</h2>
            <p className="text-green-600 font-medium">{testData}</p>
            <p className="text-sm text-gray-600 mt-2">
              isMounted: {isMounted ? "✅ true" : "❌ false"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Mapbox Token:</strong> {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? "✅ Present" : "❌ Missing"}</p>
              <p><strong>Window Object:</strong> {typeof window !== 'undefined' ? "✅ Available" : "❌ Not Available"}</p>
              <p><strong>Navigator:</strong> {typeof navigator !== 'undefined' ? "✅ Available" : "❌ Not Available"}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <div className="space-y-2">
              <button onClick={() => window.location.href = '/'} className="block text-blue-600 hover:underline text-left">← Back to Homepage</button>
              <button onClick={() => window.location.href = '/map'} className="block text-blue-600 hover:underline text-left">→ Go to Map Page</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Component Status</h2>
            <div className="text-sm space-y-1">
              <p>✅ React hooks working</p>
              <p>✅ useState working</p>
              <p>✅ useEffect working</p>
              <p>✅ CSS classes applied</p>
              <p>✅ Tailwind CSS working</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
