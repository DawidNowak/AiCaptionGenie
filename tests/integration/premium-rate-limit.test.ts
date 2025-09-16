/**
 * Integration test for premium and rate limiting
 * Tests the complete flow of premium features
 */

import { checkRateLimit, incrementUsage, resetRateLimit } from '@/lib/rate-limit';
import { storePremiumToken, removePremiumToken, isPremiumUser } from '@/lib/premium';

// Mock localStorage for testing
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Premium and Rate Limiting Integration', () => {
    beforeEach(() => {
        localStorageMock.clear();
        resetRateLimit();
    });

    it('should enforce rate limits for free users', () => {
        // Free user - should have limits
        expect(isPremiumUser()).toBe(false);

        // Initially allowed
        let status = checkRateLimit();
        expect(status.allowed).toBe(true);
        expect(status.remaining).toBe(3);
        expect(status.isPremium).toBe(false);

        // Use all 3 generations
        incrementUsage();
        incrementUsage();
        incrementUsage();

        // Should now be blocked
        status = checkRateLimit();
        expect(status.allowed).toBe(false);
        expect(status.remaining).toBe(0);
        expect(status.message).toContain('Daily limit of 3 generations reached');
    });

    it('should bypass rate limits for premium users', () => {
        // Activate premium
        storePremiumToken('cs_test_premium_123');
        expect(isPremiumUser()).toBe(true);

        // Premium user - should have unlimited access
        let status = checkRateLimit();
        expect(status.allowed).toBe(true);
        expect(status.remaining).toBe(999); // Unlimited
        expect(status.isPremium).toBe(true);
        expect(status.message).toContain('Premium active - unlimited generations');

        // Should not increment usage for premium users
        incrementUsage();
        incrementUsage();
        incrementUsage();

        // Should still be allowed
        status = checkRateLimit();
        expect(status.allowed).toBe(true);
        expect(status.remaining).toBe(999);
    });

    it('should return to rate limiting when premium expires', () => {
        // Start as premium
        storePremiumToken('cs_test_premium_123');
        expect(checkRateLimit().allowed).toBe(true);
        expect(checkRateLimit().isPremium).toBe(true);

        // Remove premium
        removePremiumToken();
        expect(isPremiumUser()).toBe(false);

        // Should now be subject to rate limits
        let status = checkRateLimit();
        expect(status.allowed).toBe(true);
        expect(status.remaining).toBe(3);
        expect(status.isPremium).toBe(false);

        // Use up free generations
        incrementUsage();
        incrementUsage();
        incrementUsage();

        // Should be blocked
        status = checkRateLimit();
        expect(status.allowed).toBe(false);
    });

    it('should preserve free tier usage when upgrading to premium', () => {
        // Use 2 free generations
        incrementUsage();
        incrementUsage();

        let status = checkRateLimit();
        expect(status.used).toBe(2);
        expect(status.remaining).toBe(1);

        // Upgrade to premium
        storePremiumToken('cs_test_upgrade_123');

        // Should now have unlimited access
        status = checkRateLimit();
        expect(status.allowed).toBe(true);
        expect(status.isPremium).toBe(true);
        expect(status.remaining).toBe(999);

        // Using more generations should not affect rate limit
        incrementUsage();
        incrementUsage();
        incrementUsage();

        status = checkRateLimit();
        expect(status.allowed).toBe(true);
    });
});
