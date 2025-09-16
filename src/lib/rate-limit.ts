/**
 * Rate Limiting Utility for AI Caption Genie
 * Tracks 3 free generations per day via localStorage with midnight UTC reset
 * Premium users get unlimited access
 */

import { isPremiumUser, checkPremiumStatus } from '@/lib/premium';

export interface UsageStatus {
  allowed: boolean;
  remaining: number;
  used: number;
  resetTime: Date;
  message?: string;
  isPremium?: boolean;
}

interface UsageData {
  date: string;
  count: number;
  limit: number;
}

// Constants
const STORAGE_KEY = 'ai_caption_usage';
const DAILY_LIMIT = 3;

/**
 * Get the current date in YYYY-MM-DD format (UTC)
 */
function getCurrentDateUTC(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get the next midnight UTC as a Date object
 */
function getNextMidnightUTC(): Date {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow;
}

/**
 * Get usage data from localStorage
 */
function getUsageData(): UsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        date: getCurrentDateUTC(),
        count: 0,
        limit: DAILY_LIMIT
      };
    }

    const data = JSON.parse(stored) as UsageData;

    // Check if it's a new day, reset if so
    if (data.date !== getCurrentDateUTC()) {
      return {
        date: getCurrentDateUTC(),
        count: 0,
        limit: DAILY_LIMIT
      };
    }

    return data;
  } catch (error) {
    // Handle corrupted data by resetting
    console.warn('Rate limit data corrupted, resetting:', error);
    return {
      date: getCurrentDateUTC(),
      count: 0,
      limit: DAILY_LIMIT
    };
  }
}

/**
 * Save usage data to localStorage
 */
function saveUsageData(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save usage data:', error);
  }
}

/**
 * Check if user can make another request
 */
export function checkRateLimit(): UsageStatus {
  // Check premium status first
  const premiumStatus = checkPremiumStatus();

  if (premiumStatus.isPremium) {
    return {
      allowed: true,
      remaining: 999, // Unlimited for premium users
      used: 0,
      resetTime: getNextMidnightUTC(),
      isPremium: true,
      message: `Premium active - unlimited generations`
    };
  }

  // Free tier rate limiting
  const data = getUsageData();
  const remaining = Math.max(0, data.limit - data.count);
  const allowed = remaining > 0;

  return {
    allowed,
    remaining,
    used: data.count,
    resetTime: getNextMidnightUTC(),
    isPremium: false,
    message: allowed ? undefined : `Daily limit of ${data.limit} generations reached. Upgrade to premium for unlimited access.`
  };
}

/**
 * Increment usage count after successful generation
 * Only increments for free tier users
 */
export function incrementUsage(): void {
  // Don't increment usage for premium users
  if (isPremiumUser()) {
    return;
  }

  const data = getUsageData();
  data.count += 1;
  saveUsageData(data);
}

/**
 * Get remaining generations for the current day
 */
export function getRemainingGenerations(): number {
  const data = getUsageData();
  return Math.max(0, data.limit - data.count);
}

/**
 * Reset rate limit data (useful for testing or admin functions)
 */
export function resetRateLimit(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}
