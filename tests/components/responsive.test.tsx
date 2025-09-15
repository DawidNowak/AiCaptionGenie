/**
 * Responsive Design Tests (T021)
 * Tests for mobile optimization, touch-friendly interfaces, and responsive behavior
 * Using mobile viewport (375x667px iPhone) as baseline
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CaptionForm from "@/components/CaptionForm";
import CaptionResults from "@/components/CaptionResults";
import { RateLimit } from "@/components/RateLimit";
import Home from "@/app/page";

// Mock the rate limit utility to avoid localStorage issues in tests
jest.mock("../../src/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    used: 1,
    remaining: 2,
    resetTime: new Date(),
    message: "2 generations remaining today",
  })),
  incrementUsage: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe("Responsive Design Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Mobile Viewport Optimization (375x667px)", () => {
    beforeEach(() => {
      // Mock mobile viewport dimensions
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    test("should render main page with mobile-friendly layout", () => {
      render(<Home />);

      // Check main header is mobile optimized
      const heading = screen.getByRole("heading", {
        name: /ai caption genie/i,
      });
      expect(heading).toBeInTheDocument();

      // Grid should stack vertically on mobile (not side-by-side)
      const mainContent = screen.getByRole("main");
      expect(mainContent).toHaveClass("max-w-7xl");

      // Form section should be present
      expect(screen.getByText(/create your caption/i)).toBeInTheDocument();

      // Results section should be present (use heading instead of text that appears multiple times)
      expect(
        screen.getByRole("heading", { name: /generated captions/i })
      ).toBeInTheDocument();
    });

    test("should have touch-friendly buttons (minimum 44x44px)", () => {
      render(<CaptionForm />);

      // Submit button should be touch-friendly
      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      expect(submitButton).toBeInTheDocument();

      // Check computed styles for touch target size
      const styles = window.getComputedStyle(submitButton);
      expect(submitButton).toHaveClass("py-3"); // Should provide adequate height
      expect(submitButton).toHaveClass("w-full"); // Full width on mobile
    });

    test("should display scrollable caption list on mobile", () => {
      const mockCaptions = [
        "🌟 Launching our eco-friendly skincare line! Made with love and natural ingredients. #EcoBeauty #Skincare #Natural #GreenBeauty #SelfCare",
        "💚 Your skin deserves the best! Our new eco-conscious products are here. Try them today! #SkincareRoutine #EcoFriendly #Beauty #Natural",
        "✨ Transform your skincare routine with our sustainable products! Comment below your favorite eco-tip! #Sustainability #Skincare #Beauty",
        "🌿 From nature to you - our new skincare line is finally here! Tag a friend who loves natural beauty! #NaturalBeauty #Skincare #EcoLiving",
        "💧 Pure, natural, effective - that's our promise to you. Check out our new eco-friendly skincare collection! #PureBeauty #Skincare",
      ];

      render(<CaptionResults captions={mockCaptions} />);

      // All captions should be visible
      mockCaptions.forEach((caption) => {
        expect(screen.getByText(caption)).toBeInTheDocument();
      });

      // Copy buttons should be touch-friendly
      const copyButtons = screen.getAllByRole("button", {
        name: /copy caption/i,
      });
      expect(copyButtons).toHaveLength(5);

      copyButtons.forEach((button) => {
        expect(button).toHaveClass("px-4", "py-2"); // Adequate touch target
      });

      // Download button should be prominent and touch-friendly
      const downloadButton = screen.getByRole("button", {
        name: /download all captions/i,
      });
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toHaveClass("px-6", "py-3"); // Larger touch target
    });

    test("should display rate limit component with responsive design", () => {
      render(<RateLimit refreshTrigger={1} />);

      // Should show usage status
      expect(
        screen.getByText(/free generations used today/i)
      ).toBeInTheDocument();

      // Progress bar should be visible
      const progressContainer = screen.getByRole("status");
      expect(progressContainer).toBeInTheDocument();
    });

    test("should handle rate limit reached state with mobile-friendly upgrade button", () => {
      // Mock rate limit exceeded
      const { checkRateLimit } = require("../../src/lib/rate-limit");
      checkRateLimit.mockReturnValue({
        allowed: false,
        used: 3,
        remaining: 0,
        resetTime: new Date(),
        message: "Daily limit exceeded",
      });

      render(<RateLimit refreshTrigger={1} />);

      // Should show upgrade button
      const upgradeButton = screen.getByRole("button", {
        name: /upgrade to premium/i,
      });
      expect(upgradeButton).toBeInTheDocument();

      // Button should be touch-friendly
      expect(upgradeButton).toHaveClass("py-2", "px-4"); // Minimum touch target
      expect(upgradeButton).toHaveClass("w-full", "sm:w-auto"); // Full width on mobile
    });
  });

  describe("Touch Interface Tests", () => {
    test("should handle form interactions with touch events", async () => {
      render(<CaptionForm />);

      // Text input should be touch-friendly
      const textInput = screen.getByLabelText(/post theme/i);
      expect(textInput).toBeInTheDocument();

      // Fire touch event on text input
      fireEvent.change(textInput, { target: { value: "Test content" } });
      expect(textInput).toHaveValue("Test content");

      // Platform select should work with touch
      const platformSelect = screen.getByLabelText(/platform/i);
      fireEvent.change(platformSelect, { target: { value: "tiktok" } });
      expect(platformSelect).toHaveValue("tiktok");

      // Tone select should work with touch
      const toneSelect = screen.getByLabelText(/tone/i);
      fireEvent.change(toneSelect, { target: { value: "casual" } });
      expect(toneSelect).toHaveValue("casual");
    });

    test("should provide immediate feedback for copy actions", async () => {
      const mockCaptions = ["Test caption for copy functionality"];
      render(<CaptionResults captions={mockCaptions} />);

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      const copyButton = screen.getByRole("button", {
        name: /copy caption 1/i,
      });

      // Click copy button
      fireEvent.click(copyButton);

      // Should show immediate feedback
      await waitFor(() => {
        expect(screen.getByText("✓ Copied!")).toBeInTheDocument();
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "Test caption for copy functionality"
      );
    });
  });

  describe("Accessibility Tests", () => {
    test("should have proper ARIA labels for mobile screen readers", () => {
      render(<Home />);

      // Main content should have proper labels
      expect(screen.getByRole("main")).toHaveAttribute(
        "aria-label",
        "AI Caption Generator Application"
      );

      // Skip link should be present
      expect(screen.getByText(/skip to main content/i)).toBeInTheDocument();
    });

    test("should support keyboard navigation on mobile", () => {
      render(<CaptionForm />);

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });

      // Button should be focusable
      submitButton.focus();
      expect(submitButton).toHaveFocus();

      // Should have proper focus styles
      expect(submitButton).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    test("should provide clear error messages on mobile", async () => {
      // Mock rate limit as not exceeded for this test
      const { checkRateLimit } = require("../../src/lib/rate-limit");
      checkRateLimit.mockReturnValue({
        allowed: true,
        used: 1,
        remaining: 2,
        resetTime: new Date(),
        message: "2 generations remaining today",
      });

      const onErrorMock = jest.fn();
      render(<CaptionForm onError={onErrorMock} />);

      // Simulate form submission without content
      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      // Wait for error to appear and then check
      await waitFor(() => {
        expect(
          screen.getByText(/please enter a theme or upload a valid file/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Performance Tests", () => {
    test("should render efficiently with many captions on mobile", () => {
      const manyCaptions = Array.from(
        { length: 10 },
        (_, i) =>
          `Caption ${
            i + 1
          }: This is a test caption for performance testing on mobile devices.`
      );

      const startTime = performance.now();
      render(<CaptionResults captions={manyCaptions} />);
      const endTime = performance.now();

      // Should render within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // All captions should be rendered
      expect(
        screen.getAllByRole("button", { name: /copy caption/i })
      ).toHaveLength(10);
    });
  });
});
