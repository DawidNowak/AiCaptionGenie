/**
 * Premium functionality tests
 * Tests the localStorage-based premium system
 */

import {
    storePremiumToken,
    checkPremiumStatus,
    isPremiumUser,
    removePremiumToken,
    getPremiumDisplayInfo
} from '@/lib/premium';

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

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Premium functionality', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    describe('storePremiumToken', () => {
        it('should store premium token with expiration', () => {
            const sessionId = 'cs_test_123';
            storePremiumToken(sessionId);

            const status = checkPremiumStatus();
            expect(status.isPremium).toBe(true);
            expect(status.sessionId).toBe(sessionId);
            expect(status.expiresAt).toBeInstanceOf(Date);
            expect(status.daysRemaining).toBeGreaterThan(25); // Should be around 30 days
        });
    });

    describe('checkPremiumStatus', () => {
        it('should return false for non-premium user', () => {
            const status = checkPremiumStatus();
            expect(status.isPremium).toBe(false);
            expect(status.sessionId).toBeUndefined();
            expect(status.expiresAt).toBeUndefined();
        });

        it('should return true for valid premium user', () => {
            storePremiumToken('cs_test_123');
            const status = checkPremiumStatus();
            expect(status.isPremium).toBe(true);
        });

        it('should return false for expired premium user', () => {
            // Store a token manually with past expiration
            const expiredToken = {
                sessionId: 'cs_test_expired',
                expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() // 31 days ago
            };

            localStorageMock.setItem('ai_caption_premium', JSON.stringify(expiredToken));

            const status = checkPremiumStatus();
            expect(status.isPremium).toBe(false);

            // Should clean up expired token
            expect(localStorageMock.getItem('ai_caption_premium')).toBeNull();
        });
    });

    describe('isPremiumUser', () => {
        it('should return false for non-premium user', () => {
            expect(isPremiumUser()).toBe(false);
        });

        it('should return true for premium user', () => {
            storePremiumToken('cs_test_123');
            expect(isPremiumUser()).toBe(true);
        });
    });

    describe('getPremiumDisplayInfo', () => {
        it('should return free tier message for non-premium user', () => {
            const info = getPremiumDisplayInfo();
            expect(info.isPremium).toBe(false);
            expect(info.message).toBe('Free tier - 3 generations per day');
        });

        it('should return premium message for premium user', () => {
            storePremiumToken('cs_test_123');
            const info = getPremiumDisplayInfo();
            expect(info.isPremium).toBe(true);
            expect(info.message).toContain('Premium active');
            expect(info.message).toContain('days remaining');
            expect(info.daysRemaining).toBeGreaterThan(25);
        });
    });

    describe('removePremiumToken', () => {
        it('should remove premium token', () => {
            storePremiumToken('cs_test_123');
            expect(isPremiumUser()).toBe(true);

            removePremiumToken();
            expect(isPremiumUser()).toBe(false);
        });
    });
});
