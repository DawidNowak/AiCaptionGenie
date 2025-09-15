/**
 * CaptionResults Component
 * Displays generated captions with copy and download functionality
 * Implements T011 requirements following TDD principles
 *
 * Features:
 * - Responsive grid layout for mobile and desktop
 * - One-click copy to clipboard with visual feedback
 * - Download all captions as text file
 * - Accessibility compliant with ARIA labels
 * - Privacy-first: no data stored or tracked
 */

import React, { useState } from "react";

// Enhanced caption interface for API responses
interface EnhancedCaption {
  id: string;
  text: string;
  callToAction: string;
  hashtags: string[];
  platform: string;
  tone: string;
  emojiCount: number;
  characterCount: number;
}

interface CaptionResultsProps {
  /** Array of caption strings or enhanced caption objects to display */
  captions?: (string | EnhancedCaption)[];
}

/**
 * Helper function to extract caption text from either string or enhanced caption object
 */
const getCaptionText = (caption: string | EnhancedCaption): string => {
  if (typeof caption === "string") {
    return caption;
  }
  return caption.text;
};

const CaptionResults: React.FC<CaptionResultsProps> = ({ captions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyError, setCopyError] = useState<number | null>(null);

  // Show empty state if no captions - user-centric simplicity
  if (!captions || captions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6 sm:py-8 px-4">
        <p className="text-base sm:text-lg">No captions yet</p>
        <p className="text-sm mt-2">Generate some captions to see them here!</p>
      </div>
    );
  }

  /**
   * Copy caption to clipboard with user feedback
   * Privacy-first: uses browser API, no external services
   */
  const handleCopy = async (caption: string, index: number) => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedIndex(index);
      setCopyError(null);

      // Reset feedback after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.warn("Copy failed:", error);
      setCopyError(index);
      setCopiedIndex(null);

      // Reset error after 2 seconds
      setTimeout(() => {
        setCopyError(null);
      }, 2000);
    }
  };

  /**
   * Download all captions as plain text file
   * Privacy-first: client-side only, no server communication
   */
  const handleDownloadAll = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const content = captions.map(getCaptionText).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `captions-${timestamp}.txt`;
    link.click();

    // Cleanup to prevent memory leaks
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Caption List - Mobile-first responsive design with scrollable layout */}
      <div className="max-h-[70vh] overflow-y-auto">
        <ul
          role="list"
          className="space-y-3 sm:space-y-4"
          aria-label="Generated captions"
        >
          {captions.map((caption, index) => (
            <li
              key={index}
              role="listitem"
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col space-y-3">
                {/* Caption Text - Mobile optimized */}
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                  {getCaptionText(caption)}
                </p>

                {/* Copy Button with Visual Feedback - Touch friendly */}
                <button
                  onClick={() => handleCopy(getCaptionText(caption), index)}
                  aria-label={`Copy caption ${index + 1} to clipboard`}
                  className={`self-start px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-sm font-medium min-h-[44px] min-w-[80px] ${
                    copiedIndex === index
                      ? "bg-green-500 text-white ring-green-500"
                      : copyError === index
                      ? "bg-red-500 text-white ring-red-500"
                      : "bg-blue-500 text-white hover:bg-blue-600 ring-blue-500 active:bg-blue-700"
                  }`}
                  disabled={copiedIndex === index || copyError === index}
                >
                  {copiedIndex === index
                    ? "✓ Copied!"
                    : copyError === index
                    ? "✗ Failed"
                    : "Copy"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Download All Button - Touch friendly and prominent */}
      <div className="mt-6 sm:mt-8 text-center border-t border-gray-200 pt-4 sm:pt-6">
        <button
          onClick={handleDownloadAll}
          aria-label="Download all captions as text file"
          className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-base min-h-[44px]"
        >
          📥 Download All Captions
        </button>
        <p className="text-xs text-gray-500 mt-2 px-2">
          Downloads as captions-{new Date().toISOString().split("T")[0]}.txt
        </p>
      </div>
    </div>
  );
};

export default CaptionResults;
