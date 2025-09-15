/**
 * Test for enhanced caption object handling in CaptionResults
 * Verifies the component can handle both string and EnhancedCaption objects
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CaptionResults from "@/components/CaptionResults";

// Mock enhanced caption object (matches API response format)
const mockEnhancedCaption = {
  id: "cap_123",
  text: "Amazing sunset vibes! 🌅 What's your favorite time of day? #sunset #nature #photography",
  callToAction: "What's your favorite time of day?",
  hashtags: ["sunset", "nature", "photography"],
  platform: "instagram",
  tone: "casual",
  emojiCount: 1,
  characterCount: 89,
};

describe("CaptionResults - Enhanced Caption Support", () => {
  it("should render enhanced caption objects correctly", () => {
    const enhancedCaptions = [mockEnhancedCaption];

    render(<CaptionResults captions={enhancedCaptions} />);

    // Should display the text from the enhanced caption object
    expect(screen.getByText(/Amazing sunset vibes!/)).toBeInTheDocument();
    expect(
      screen.getByText(/What's your favorite time of day/)
    ).toBeInTheDocument();
  });

  it("should handle mixed array of strings and enhanced caption objects", () => {
    const mixedCaptions = [
      "Simple string caption with emoji 😊",
      mockEnhancedCaption,
    ];

    render(<CaptionResults captions={mixedCaptions} />);

    // Should display both the string caption and enhanced caption text
    expect(
      screen.getByText(/Simple string caption with emoji/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Amazing sunset vibes!/)).toBeInTheDocument();
  });

  it("should maintain backward compatibility with string arrays", () => {
    const stringCaptions = ["First caption 🎉", "Second caption with #hashtag"];

    render(<CaptionResults captions={stringCaptions} />);

    // Should display string captions as before
    expect(screen.getByText(/First caption 🎉/)).toBeInTheDocument();
    expect(
      screen.getByText(/Second caption with #hashtag/)
    ).toBeInTheDocument();
  });
});
