/**
 * Rate Limit Component for AI Caption Genie
 * Displays usage count and upgrade message when limit reached
 * Shows premium status for premium users
 * Designed for <30s user comprehension per constitution
 */

import React, { useEffect, useState } from "react";
import { checkRateLimit, type UsageStatus } from "@/lib/rate-limit";
import { getPremiumDisplayInfo } from "@/lib/premium";

interface RateLimitProps {
  refreshTrigger?: number; // Trigger re-check when this changes
  onUpgradeClick?: () => void; // Callback for upgrade button
}

export function RateLimit({ refreshTrigger, onUpgradeClick }: RateLimitProps) {
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [premiumInfo, setPremiumInfo] = useState<{
    isPremium: boolean;
    message: string;
    daysRemaining?: number;
  } | null>(null);

  useEffect(() => {
    const status = checkRateLimit();
    const premium = getPremiumDisplayInfo();
    setUsageStatus(status);
    setPremiumInfo(premium);
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Show loading state to prevent layout shift
  if (!usageStatus || !premiumInfo) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 w-full max-w-sm sm:max-w-md">
        <div className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // Premium user display
  if (premiumInfo.isPremium) {
    return (
      <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200 w-full max-w-sm sm:max-w-md">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <div className="text-sm font-medium text-green-700">
            ✨ Premium Active
          </div>
        </div>
        <div className="text-xs sm:text-sm text-green-600">
          {premiumInfo.message}
        </div>
        <div className="text-xs text-green-500 mt-1">
          Unlimited caption generations
        </div>
      </div>
    );
  }

  const { allowed, used, remaining } = usageStatus;
  const totalLimit = used + remaining;

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 w-full max-w-sm sm:max-w-md">
      {/* Usage Counter - Always visible for transparency */}
      <div
        role="status"
        aria-live="polite"
        className="text-xs sm:text-sm font-medium text-gray-700 mb-3"
      >
        <span className="text-blue-600">{used}</span>
        <span className="text-gray-500">/{totalLimit}</span>
        <span className="ml-2">free generations used today</span>
      </div>

      {/* Progress Bar for Visual Clarity */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            used === totalLimit ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ width: `${(used / totalLimit) * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Upgrade Message - Only when limit reached */}
      {!allowed && (
        <div className="space-y-3">
          <div
            role="alert"
            className="text-xs sm:text-sm text-amber-800 bg-amber-50 p-2 sm:p-3 rounded-md border border-amber-200"
          >
            <strong>Daily limit reached!</strong> You've used all 3 free
            generations today. Upgrade to a paid plan for unlimited access.
          </div>
          <button
            type="button"
            onClick={onUpgradeClick}
            aria-label="Upgrade to premium plan for unlimited caption generations"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 min-h-[44px]"
          >
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}
