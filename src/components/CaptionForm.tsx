/**
 * CaptionForm Component - Main caption generation form
 * T010: Main caption form component with input validation and API integration
 * Handles text input, file upload, platform/tone selection with validation
 */

"use client";

import React, { useState, useRef } from "react";
import { Platform, Tone } from "@/types";
import { validateFile } from "@/lib/file-validation";
import { checkRateLimit } from "@/lib/rate-limit";

interface CaptionFormProps {
  onCaptionsGenerated?: (captions: string[]) => void;
  onError?: (error: string) => void;
  isSubscribed?: boolean; // For subscription bypass
}

const CaptionForm: React.FC<CaptionFormProps> = ({
  onCaptionsGenerated,
  onError,
  isSubscribed = false,
}) => {
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.INSTAGRAM);
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTextContent("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.isValid) {
        setSelectedFile(file);
        setError("");
      } else {
        setError(validation.error || "Invalid file");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Check rate limit before proceeding (unless user is subscribed)
    if (!isSubscribed) {
      const rateLimitStatus = checkRateLimit();
      if (!rateLimitStatus.allowed) {
        const errorMessage = rateLimitStatus.message || "Daily limit exceeded";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        return;
      }
    }

    // Validation: either text content or file must be provided
    if (!textContent.trim() && !selectedFile) {
      setError("Please enter a theme or upload a valid file");
      return;
    }

    // Additional file validation if file is selected
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.isValid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }

    setIsLoading(true);

    try {
      let response;

      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("platform", platform);
        formData.append("tone", tone);
        if (textContent.trim()) {
          formData.append("content", textContent.trim());
        }

        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        // Handle text input
        response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: textContent.trim(),
            platform,
            tone,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.error || "Generation failed");
      }

      // Success - call callback with captions
      if (onCaptionsGenerated && data.captions) {
        onCaptionsGenerated(data.captions);
      }

      // Reset form on success
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 md:p-6"
        role="form"
      >
        {/* Error Display */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* Text Input */}
        <div>
          <label
            htmlFor="post-theme"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Post Theme
          </label>
          <textarea
            id="post-theme"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Describe your post theme (e.g., 'launching eco-friendly skincare line, targeting millennials')"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            rows={3}
            disabled={isLoading}
            aria-describedby="theme-help"
          />
          <p id="theme-help" className="mt-1 text-xs text-gray-500">
            Describe what your post is about to generate relevant captions
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload File
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/quicktime"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            disabled={isLoading}
            aria-describedby="file-help"
          />
          <p id="file-help" className="mt-1 text-xs text-gray-500">
            Support: JPEG, PNG, GIF, MP4, MOV (max 10MB)
          </p>
        </div>

        {/* Platform and Tone Selection - Mobile-first responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Platform Selection */}
          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
              aria-describedby="platform-help"
            >
              <option value={Platform.INSTAGRAM}>Instagram</option>
              <option value={Platform.TIKTOK}>TikTok</option>
              <option value={Platform.LINKEDIN}>LinkedIn</option>
              <option value={Platform.TWITTER}>Twitter</option>
              <option value={Platform.FACEBOOK}>Facebook</option>
            </select>
            <p id="platform-help" className="mt-1 text-xs text-gray-500">
              Choose your target platform
            </p>
          </div>

          {/* Tone Selection */}
          <div>
            <label
              htmlFor="tone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
              aria-describedby="tone-help"
            >
              <option value={Tone.PROFESSIONAL}>Professional</option>
              <option value={Tone.CASUAL}>Casual</option>
              <option value={Tone.HUMOROUS}>Humorous</option>
              <option value={Tone.INSPIRATIONAL}>Inspirational</option>
              <option value={Tone.PROMOTIONAL}>Promotional</option>
            </select>
            <p id="tone-help" className="mt-1 text-xs text-gray-500">
              Select your desired tone
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base"
          aria-describedby="submit-help"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Captions"
          )}
        </button>
        <p id="submit-help" className="text-xs text-center text-gray-500">
          Either enter a theme or upload a file to generate captions
        </p>
      </form>
    </div>
  );
};

export default CaptionForm;
