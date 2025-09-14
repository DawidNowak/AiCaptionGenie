/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as rateLimitLib from "../../src/lib/rate-limit";
import { RateLimit } from "@/components/RateLimit";

// Mock the rate limit utility
jest.mock("../../src/lib/rate-limit");
const mockCheckRateLimit = jest.mocked(rateLimitLib.checkRateLimit);

describe("RateLimit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays current usage count when under limit", () => {
    // Arrange: Mock rate limit check for user with 2/3 generations used
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 1,
      used: 2,
      resetTime: new Date("2025-09-15T00:00:00.000Z"),
    });

    // Act: Render component
    render(<RateLimit />);

    // Assert: Should display usage count
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/3")).toBeInTheDocument();
    expect(screen.getByText("free generations used today")).toBeInTheDocument();
    expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
  });

  it("displays upgrade message when limit is reached", () => {
    // Arrange: Mock rate limit check for user at limit
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      used: 3,
      resetTime: new Date("2025-09-15T00:00:00.000Z"),
      message:
        "Daily limit of 3 generations reached. Upgrade to premium for unlimited access.",
    });

    // Act: Render component
    render(<RateLimit />);

    // Assert: Should display upgrade message and button
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("/3")).toBeInTheDocument();
    expect(screen.getByText("free generations used today")).toBeInTheDocument();
    expect(screen.getByText(/Daily limit reached!/)).toBeInTheDocument();
    expect(
      screen.getByText(/You've used all 3 free generations today/)
    ).toBeInTheDocument();

    const upgradeButton = screen.getByRole("button", {
      name: /upgrade to premium/i,
    });
    expect(upgradeButton).toBeInTheDocument();
    expect(upgradeButton).toHaveAttribute(
      "aria-label",
      "Upgrade to premium plan for unlimited caption generations"
    );
  });

  it("displays zero usage for new users", () => {
    // Arrange: Mock rate limit check for new user
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 3,
      used: 0,
      resetTime: new Date("2025-09-15T00:00:00.000Z"),
    });

    // Act: Render component
    render(<RateLimit />);

    // Assert: Should display zero usage
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/3")).toBeInTheDocument();
    expect(screen.getByText("free generations used today")).toBeInTheDocument();
    expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    // Arrange: Mock rate limit check for user at limit
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      used: 3,
      resetTime: new Date("2025-09-15T00:00:00.000Z"),
      message:
        "Daily limit of 3 generations reached. Upgrade to premium for unlimited access.",
    });

    // Act: Render component
    render(<RateLimit />);

    // Assert: Check accessibility attributes
    const usageStatus = screen.getByRole("status");
    expect(usageStatus).toBeInTheDocument();
    expect(usageStatus).toHaveAttribute("aria-live", "polite");

    const alertMessage = screen.getByRole("alert");
    expect(alertMessage).toBeInTheDocument();

    const upgradeButton = screen.getByRole("button", {
      name: /upgrade to premium/i,
    });
    expect(upgradeButton).toHaveAttribute(
      "aria-label",
      "Upgrade to premium plan for unlimited caption generations"
    );
  });

  it("calls checkRateLimit on mount", () => {
    // Arrange: Mock rate limit check
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 2,
      used: 1,
      resetTime: new Date("2025-09-15T00:00:00.000Z"),
    });

    // Act: Render component
    render(<RateLimit />);

    // Assert: Should call rate limit check
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
  });
});
