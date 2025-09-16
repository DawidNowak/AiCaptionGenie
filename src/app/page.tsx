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

  // Handle upgrade button click
  const handleUpgradeClick = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: "unlimited_plan",
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      setError("Failed to start upgrade process. Please try again.");
    }
  }, []);

  // Handle successful caption generation
  const handleCaptionsGenerated = useCallback((newCaptions: string[]) => {
    setCaptions(newCaptions);
    setError(""); // Clear any previous errors

    // Increment usage count after successful generation
    incrementUsage();

    // Trigger rate limit display refresh
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handle errors from caption generation
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setCaptions([]); // Clear previous captions on error

    // Trigger rate limit display refresh to show current status
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 text-sm font-medium"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
        aria-label="AI Caption Generator Application"
        role="main"
      >
        {/* Header Section - Mobile optimized */}
        <header className="text-center space-y-3 sm:space-y-4 px-2">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            AI Caption Genie
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Generate engaging social media captions with AI
          </p>
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            No account required • Privacy-first • 3 free generations daily
          </p>
        </header>

        {/* Rate Limit Display - Mobile optimized */}
        <div className="flex justify-center px-4">
          <RateLimit
            refreshTrigger={refreshTrigger}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>

        {/* Error Display - Mobile friendly */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 text-red-600"
            role="alert"
            aria-live="polite"
          >
            <p className="font-medium text-sm sm:text-base">Error</p>
            <p className="text-sm sm:text-base mt-1">{error}</p>
          </div>
        )}

        {/* Main Content Grid - Mobile-first responsive */}
        <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
          {/* Caption Form Section */}
          <section className="space-y-4 px-4" aria-labelledby="form-heading">
            <h2
              id="form-heading"
              className="text-xl sm:text-2xl font-semibold text-gray-900"
            >
              Create Your Caption
            </h2>
            <p className="text-sm text-gray-600">
              Describe your content or upload an image to generate engaging
              captions.
            </p>
            <CaptionForm
              onCaptionsGenerated={handleCaptionsGenerated}
              onError={handleError}
            />
          </section>

          {/* Results Section */}
          <section className="space-y-4 px-4" aria-labelledby="results-heading">
            <h2
              id="results-heading"
              className="text-xl sm:text-2xl font-semibold text-gray-900"
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
        <footer className="text-center pt-6 sm:pt-8 border-t border-gray-200 mx-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Your privacy matters: No data is stored or tracked. All processing
            happens locally.
          </p>
        </footer>
      </main>
    </div>
  );
}
