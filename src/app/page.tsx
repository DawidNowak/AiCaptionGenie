/**
 * Main Page Layout for AI Caption Genie (T013)
 * Integrates CaptionForm, CaptionResults, and RateLimit components
 * Implements state management with React hooks and responsive design
 * Follows constitution: user-centric simplicity, privacy-first, mobile-friendly
 */

"use client";

import React, { useState, useCallback } from "react";
import CaptionForm from "@/components/CaptionForm";
import CaptionResults from "@/components/CaptionResults";
import { RateLimit } from "@/components/RateLimit";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";

export default function Home() {
  // State management for captions and errors
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false); // TODO: Get from subscription status

  // Handle successful caption generation
  const handleCaptionsGenerated = useCallback((newCaptions: string[]) => {
    setCaptions(newCaptions);
    setError(""); // Clear any previous errors

    // Increment usage count after successful generation
    incrementUsage();
    
    // Trigger rate limit display refresh
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle errors from caption generation
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setCaptions([]); // Clear previous captions on error
    
    // Trigger rate limit display refresh to show current status
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="max-w-4xl mx-auto space-y-8"
        aria-label="AI Caption Generator Application"
        role="main"
      >
        {/* Header Section */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            AI Caption Genie
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate engaging social media captions with AI
          </p>
          <p className="text-sm text-gray-500">
            No account required • Privacy-first • 3 free generations daily
          </p>
        </header>

        {/* Rate Limit Display */}
        <div className="flex justify-center">
          <RateLimit refreshTrigger={refreshTrigger} isSubscribed={isSubscribed} />
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600"
            role="alert"
            aria-live="polite"
          >
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Caption Form Section */}
          <section className="space-y-4" aria-labelledby="form-heading">
            <h2
              id="form-heading"
              className="text-2xl font-semibold text-gray-900"
            >
              Create Your Caption
            </h2>
            <p className="text-sm text-gray-600">
              Describe your content or upload an image/video to generate
              engaging captions.
            </p>
            <CaptionForm
              onCaptionsGenerated={handleCaptionsGenerated}
              onError={handleError}
              isSubscribed={isSubscribed}
            />
          </section>

          {/* Results Section */}
          <section className="space-y-4" aria-labelledby="results-heading">
            <h2
              id="results-heading"
              className="text-2xl font-semibold text-gray-900"
            >
              Generated Captions
            </h2>
            <p className="text-sm text-gray-600">
              Your AI-generated captions will appear here. Copy with one click!
            </p>
            <CaptionResults captions={captions} />
          </section>
        </div>

        {/* Footer with privacy message */}
        <footer className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Your privacy matters: No data is stored or tracked. All processing
            happens locally.
          </p>
        </footer>
      </main>
    </div>
  );
}
