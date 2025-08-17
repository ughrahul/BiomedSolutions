"use client";

import { useEffect, useState } from "react";
import { createClientSupabase } from "@/lib/supabase";

export default function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkMode = () => {
      // Check if demo banner is explicitly disabled
      const disableBanner = process.env.NEXT_PUBLIC_DISABLE_DEMO_BANNER === 'true';
      if (disableBanner) {
        setIsDemoMode(false);
        setShowBanner(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const hasProperConfig = !(
        !supabaseUrl ||
        !supabaseKey ||
        supabaseUrl.includes("placeholder") ||
        supabaseKey.includes("placeholder")
      );

      const supabase = createClientSupabase();
      const isDemo = !hasProperConfig || supabase === null;

      setIsDemoMode(isDemo);
      setShowBanner(isDemo);
    };

    checkMode();
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">🎭 Running in Demo Mode</p>
            <p className="text-xs opacity-90">
              This is a demonstration with sample data. For full functionality,
              set up Full Database Mode.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/FULL_DATABASE_SETUP.md"
            className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition-colors"
          >
            Setup Guide
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
