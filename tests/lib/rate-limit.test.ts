/**
 * Test for rate limiting utility
 * Following TDD: This test should FAIL initially before implementation
 * @jest-environment jsdom
 */

import { 
  checkRateLimit, 
  incrementUsage, 
  getRemainingGenerations,
  resetRateLimit,
  UsageStatus 
} from '@/lib/rate-limit';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Rate Limiting Utility', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow usage when no prior history exists', () => {
      // This test will initially fail because checkRateLimit doesn't exist
      const status = checkRateLimit();

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(3);
      expect(status.used).toBe(0);
      expect(status.resetTime).toBeInstanceOf(Date);
    });

    it('should allow usage when under daily limit', () => {
      // Simulate existing usage of 1 generation today
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 1,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      const status = checkRateLimit();

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(2);
      expect(status.used).toBe(1);
    });

    it('should block usage when daily limit is reached', () => {
      // Simulate usage at daily limit
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 3,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      const status = checkRateLimit();

      expect(status.allowed).toBe(false);
      expect(status.remaining).toBe(0);
      expect(status.used).toBe(3);
      expect(status.message).toBe('Daily limit of 3 generations reached. Upgrade to premium for unlimited access.');
    });

    it('should reset count for new day', () => {
      // Simulate usage from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const usageData = {
        date: yesterdayStr,
        count: 3,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      const status = checkRateLimit();

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(3);
      expect(status.used).toBe(0);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('ai_caption_usage', 'invalid json');

      const status = checkRateLimit();

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(3);
      expect(status.used).toBe(0);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count and update localStorage', () => {
      const today = new Date().toISOString().split('T')[0];
      
      incrementUsage();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai_caption_usage',
        JSON.stringify({
          date: today,
          count: 1,
          limit: 3
        })
      );
    });

    it('should increment existing usage count', () => {
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 1,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      incrementUsage();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai_caption_usage',
        JSON.stringify({
          date: today,
          count: 2,
          limit: 3
        })
      );
    });
  });

  describe('getRemainingGenerations', () => {
    it('should return 3 for new users', () => {
      const remaining = getRemainingGenerations();
      expect(remaining).toBe(3);
    });

    it('should return correct remaining count', () => {
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 2,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      const remaining = getRemainingGenerations();
      expect(remaining).toBe(1);
    });

    it('should return 0 when limit is reached', () => {
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 3,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      const remaining = getRemainingGenerations();
      expect(remaining).toBe(0);
    });
  });

  describe('resetRateLimit', () => {
    it('should clear usage data from localStorage', () => {
      const today = new Date().toISOString().split('T')[0];
      const usageData = {
        date: today,
        count: 3,
        limit: 3
      };
      localStorageMock.setItem('ai_caption_usage', JSON.stringify(usageData));

      resetRateLimit();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ai_caption_usage');
    });
  });

  describe('midnight UTC reset', () => {
    it('should calculate correct reset time for next midnight UTC', () => {
      const status = checkRateLimit();
      const resetTime = status.resetTime;
      const now = new Date();
      
      // Reset time should be at midnight UTC
      expect(resetTime.getUTCHours()).toBe(0);
      expect(resetTime.getUTCMinutes()).toBe(0);
      expect(resetTime.getUTCSeconds()).toBe(0);
      expect(resetTime.getUTCMilliseconds()).toBe(0);
      
      // Should be in the future (next midnight)
      expect(resetTime.getTime()).toBeGreaterThan(now.getTime());
      
      // Should be within the next 24 hours
      const maxTime = now.getTime() + (24 * 60 * 60 * 1000);
      expect(resetTime.getTime()).toBeLessThanOrEqual(maxTime);
    });
  });

  describe('UsageStatus interface', () => {
    it('should have the correct structure', () => {
      const status: UsageStatus = {
        allowed: true,
        remaining: 3,
        used: 0,
        resetTime: new Date()
      };

      expect(status).toHaveProperty('allowed');
      expect(status).toHaveProperty('remaining');
      expect(status).toHaveProperty('used');
      expect(status).toHaveProperty('resetTime');
      expect(typeof status.allowed).toBe('boolean');
      expect(typeof status.remaining).toBe('number');
      expect(typeof status.used).toBe('number');
      expect(status.resetTime).toBeInstanceOf(Date);
    });
  });
});
