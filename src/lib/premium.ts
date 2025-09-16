/**
 * Premium subscription utilities for AI Caption Genie
 * Handles localStorage-based premium tokens for anonymous users
 * Following constitution: user-centric simplicity, privacy-first
 */

export interface PremiumStatus {
    isPremium: boolean;
    expiresAt?: Date;
    sessionId?: string;
    daysRemaining?: number;
}

interface PremiumToken {
    sessionId: string;
    expiresAt: string; // ISO string for localStorage compatibility
    createdAt: string;
}

// Constants
const PREMIUM_STORAGE_KEY = 'ai_caption_premium';
const PREMIUM_DURATION_DAYS = 30; // Monthly subscription

/**
 * Store premium token in localStorage after successful payment
 */
export function storePremiumToken(sessionId: string): void {
    try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000));

        const token: PremiumToken = {
            sessionId,
            expiresAt: expiresAt.toISOString(),
            createdAt: now.toISOString()
        };

        localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(token));
    } catch (error) {
        console.error('Failed to store premium token:', error);
    }
}

/**
 * Get premium token from localStorage
 */
function getPremiumToken(): PremiumToken | null {
    try {
        const stored = localStorage.getItem(PREMIUM_STORAGE_KEY);
        if (!stored) {
            return null;
        }

        return JSON.parse(stored) as PremiumToken;
    } catch (error) {
        console.warn('Premium token corrupted, removing:', error);
        removePremiumToken();
        return null;
    }
}

/**
 * Check if user has valid premium subscription
 */
export function checkPremiumStatus(): PremiumStatus {
    const token = getPremiumToken();

    if (!token) {
        return { isPremium: false };
    }

    const now = new Date();
    const expiresAt = new Date(token.expiresAt);

    // Check if token has expired
    if (now > expiresAt) {
        removePremiumToken();
        return { isPremium: false };
    }

    // Calculate days remaining
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

    return {
        isPremium: true,
        expiresAt,
        sessionId: token.sessionId,
        daysRemaining
    };
}

/**
 * Remove premium token (useful for logout or expiration)
 */
export function removePremiumToken(): void {
    try {
        localStorage.removeItem(PREMIUM_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to remove premium token:', error);
    }
}

/**
 * Check if user is premium (simple boolean check)
 */
export function isPremiumUser(): boolean {
    return checkPremiumStatus().isPremium;
}

/**
 * Get premium expiration date as a formatted string
 */
export function getPremiumExpirationString(): string | null {
    const status = checkPremiumStatus();

    if (!status.isPremium || !status.expiresAt) {
        return null;
    }

    return status.expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get premium status for display in UI
 */
export function getPremiumDisplayInfo(): {
    isPremium: boolean;
    message: string;
    daysRemaining?: number;
} {
    const status = checkPremiumStatus();

    if (!status.isPremium) {
        return {
            isPremium: false,
            message: 'Free tier - 3 generations per day'
        };
    }

    const daysText = status.daysRemaining === 1 ? 'day' : 'days';

    return {
        isPremium: true,
        message: `Premium active - ${status.daysRemaining} ${daysText} remaining`,
        daysRemaining: status.daysRemaining
    };
}
