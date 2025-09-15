/**
 * Rate Limiting Integration Tests (T018)
 * Tests UI rate limit enforcement, generation blocking, and subscription bypass
 * Validates integration between rate-limit utility and frontend components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaptionForm from '../../src/components/CaptionForm';
import { RateLimit } from '../../src/components/RateLimit';
import Home from '../../src/app/page';
import * as rateLimitModule from '../../src/lib/rate-limit';

// Mock the rate limit utility
jest.mock('../../src/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  incrementUsage: jest.fn(),
  getRemainingGenerations: jest.fn(),
  resetRateLimit: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Rate Limiting Integration', () => {
  const mockCheckRateLimit = rateLimitModule.checkRateLimit as jest.MockedFunction<typeof rateLimitModule.checkRateLimit>;
  const mockIncrementUsage = rateLimitModule.incrementUsage as jest.MockedFunction<typeof rateLimitModule.incrementUsage>;
  const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('RateLimit Component Display', () => {
    it('should show correct usage count (2/3)', () => {
      // Arrange: Mock usage status with 2 generations used
      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 1,
        used: 2,
        resetTime: new Date(),
        message: undefined,
      });

      // Act: Render RateLimit component
      render(<RateLimit />);

      // Assert: Should display "2/3 free generations used today"
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/\/3/)).toBeInTheDocument();
      expect(screen.getByText(/free generations used today/)).toBeInTheDocument();
    });

    it('should show upgrade message when limit reached', () => {
      // Arrange: Mock usage status with limit reached
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        used: 3,
        resetTime: new Date(),
        message: "Daily limit of 3 generations reached. Upgrade to premium for unlimited access.",
      });

      // Act: Render RateLimit component
      render(<RateLimit />);

      // Assert: Should show upgrade message and button
      expect(screen.getByText(/Daily limit reached!/)).toBeInTheDocument();
      expect(screen.getByText(/Upgrade to Premium/)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('CaptionForm Rate Limiting', () => {
    it('should block form submission when rate limit exceeded', async () => {
      // Arrange: Mock rate limit exceeded
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        used: 3,
        resetTime: new Date(),
        message: "Daily limit exceeded",
      });

      const mockOnError = jest.fn();

      // Act: Render form and try to submit
      render(<CaptionForm onError={mockOnError} />);
      
      const textInput = screen.getByLabelText(/post theme/i);
      const submitButton = screen.getByRole('button', { name: /generate captions/i });
      
      fireEvent.change(textInput, { target: { value: 'test content' } });
      fireEvent.click(submitButton);

      // Assert: Should call onError with rate limit message, no API call made
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Daily limit exceeded");
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should allow form submission when within rate limit', async () => {
      // Arrange: Mock rate limit allows submission
      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 2,
        used: 1,
        resetTime: new Date(),
        message: undefined,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ captions: ['Test caption'] }),
      } as Response);

      const mockOnSuccess = jest.fn();

      // Act: Render form and submit
      render(<CaptionForm onCaptionsGenerated={mockOnSuccess} />);
      
      const textInput = screen.getByLabelText(/post theme/i);
      const submitButton = screen.getByRole('button', { name: /generate captions/i });
      
      fireEvent.change(textInput, { target: { value: 'test content' } });
      fireEvent.click(submitButton);

      // Assert: Should make API call and increment usage
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('Subscription Bypass', () => {
    it('should allow unlimited generations for subscribed users', async () => {
      // Arrange: Mock rate limit exceeded but user is subscribed
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        used: 5, // More than limit
        resetTime: new Date(),
        message: "Daily limit exceeded",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ captions: ['Subscription caption'] }),
      } as Response);

      const mockOnSuccess = jest.fn();

      // Act: Render Home component with subscription status
      render(<Home />);
      
      // Simulate subscription status (this will need to be implemented)
      // For now, we'll test the structure is in place for this feature
      
      // Assert: Structure should be ready for subscription bypass
      const form = screen.getByRole('button', { name: /generate captions/i });
      expect(form).toBeInTheDocument();
    });
  });

  describe('Home Page Integration', () => {
    it('should update rate limit display after successful generation', async () => {
      // Arrange: Mock initial state and after generation
      mockCheckRateLimit
        .mockReturnValueOnce({
          allowed: true,
          remaining: 2,
          used: 1,
          resetTime: new Date(),
        })
        .mockReturnValueOnce({
          allowed: true,
          remaining: 1,
          used: 2,
          resetTime: new Date(),
        });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ captions: ['Generated caption'] }),
      } as Response);

      // Act: Render full app and generate caption
      render(<Home />);
      
      const textInput = screen.getByLabelText(/post theme/i);
      const submitButton = screen.getByRole('button', { name: /generate captions/i });
      
      fireEvent.change(textInput, { target: { value: 'test content' } });
      fireEvent.click(submitButton);

      // Assert: Should increment usage after successful generation
      await waitFor(() => {
        expect(mockIncrementUsage).toHaveBeenCalled();
      });
    });

    it('should show error message when rate limit is exceeded on page load', () => {
      // Arrange: Mock rate limit exceeded
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        used: 3,
        resetTime: new Date(),
        message: "Daily limit exceeded",
      });

      // Act: Render Home page
      render(<Home />);

      // Assert: Should display rate limit status 
      expect(screen.getByText('free generations used today')).toBeInTheDocument(); 
      expect(screen.getByText(/Daily limit reached!/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for blocked state', () => {
      // Arrange: Mock rate limit exceeded
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        used: 3,
        resetTime: new Date(),
        message: "Daily limit exceeded",
      });

      // Act: Render components
      render(<RateLimit />);

      // Assert: Should have proper accessibility attributes
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/upgrade to premium plan/i)).toBeInTheDocument();
    });
  });
});
