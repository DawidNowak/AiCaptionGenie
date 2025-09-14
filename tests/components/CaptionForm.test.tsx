/**
 * CaptionForm Component Tests
 * T010: Failing tests for main caption form component
 * Tests form rendering, input validation, and API call behavior
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Platform, Tone } from "../../src/types";
import CaptionForm from "@/components/CaptionForm";

// Mock the API calls
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock file validation
jest.mock("../../src/lib/file-validation", () => ({
  validateFile: jest.fn(),
}));

describe("CaptionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe("Form Rendering", () => {
    test("renders all required form elements", () => {
      render(<CaptionForm />);

      // Text input for theme
      expect(screen.getByLabelText(/post theme/i)).toBeInTheDocument();

      // File upload input
      expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument();

      // Platform dropdown
      expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Instagram")).toBeInTheDocument();

      // Tone dropdown
      expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Professional")).toBeInTheDocument();

      // Submit button
      expect(
        screen.getByRole("button", { name: /generate captions/i })
      ).toBeInTheDocument();
    });

    test("renders with mobile-friendly Tailwind CSS classes", () => {
      render(<CaptionForm />);

      const form = screen.getByRole("form");
      expect(form).toHaveClass("space-y-6");

      const textInput = screen.getByLabelText(/post theme/i);
      expect(textInput).toHaveClass("w-full", "px-3", "py-2");
    });

    test("includes proper ARIA labels for accessibility", () => {
      render(<CaptionForm />);

      expect(screen.getByLabelText("Post Theme")).toBeInTheDocument();
      expect(screen.getByLabelText("Upload File")).toBeInTheDocument();
      expect(screen.getByLabelText("Platform")).toBeInTheDocument();
      expect(screen.getByLabelText("Tone")).toBeInTheDocument();
    });
  });

  describe("Input Validation", () => {
    test("shows error when neither text nor file is provided", async () => {
      render(<CaptionForm />);

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a theme or upload a valid file/i)
        ).toBeInTheDocument();
      });
    });

    test("validates file format and size", async () => {
      const { validateFile } = require("../../src/lib/file-validation");
      validateFile.mockReturnValue({
        isValid: false,
        error:
          "File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.",
      });

      render(<CaptionForm />);

      const fileInput = screen.getByLabelText(/upload file/i);
      const invalidFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(
          screen.getByText(/file type not supported/i)
        ).toBeInTheDocument();
      });
    });

    test("accepts valid text input", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captions: ["Test caption 1", "Test caption 2"],
          requestId: "test-id",
          status: "success",
        }),
      });

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(/post theme/i);
      fireEvent.change(textInput, {
        target: { value: "Test post about eco-friendly products" },
      });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/generate",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: "Test post about eco-friendly products",
              platform: Platform.INSTAGRAM,
              tone: Tone.PROFESSIONAL,
            }),
          })
        );
      });
    });

    test("accepts valid file upload", async () => {
      const { validateFile } = require("../../src/lib/file-validation");
      validateFile.mockReturnValue({
        isValid: true,
        fileType: "image",
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captions: ["Image caption 1", "Image caption 2"],
          requestId: "test-id",
          status: "success",
        }),
      });

      render(<CaptionForm />);

      const fileInput = screen.getByLabelText(/upload file/i);
      const validFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/upload",
          expect.objectContaining({
            method: "POST",
            body: expect.any(FormData),
          })
        );
      });
    });
  });

  describe("Platform and Tone Selection", () => {
    test("allows selecting different platforms", () => {
      render(<CaptionForm />);

      const platformSelect = screen.getByLabelText(/platform/i);

      fireEvent.change(platformSelect, { target: { value: Platform.TIKTOK } });
      expect(platformSelect).toHaveValue(Platform.TIKTOK);

      fireEvent.change(platformSelect, {
        target: { value: Platform.LINKEDIN },
      });
      expect(platformSelect).toHaveValue(Platform.LINKEDIN);
    });

    test("allows selecting different tones", () => {
      render(<CaptionForm />);

      const toneSelect = screen.getByLabelText(/tone/i);

      fireEvent.change(toneSelect, { target: { value: Tone.CASUAL } });
      expect(toneSelect).toHaveValue(Tone.CASUAL);

      fireEvent.change(toneSelect, { target: { value: Tone.HUMOROUS } });
      expect(toneSelect).toHaveValue(Tone.HUMOROUS);
    });
  });

  describe("API Integration", () => {
    test("calls /api/generate for text input", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captions: ["Generated caption"],
          requestId: "test-id",
          status: "success",
        }),
      });

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(/post theme/i);
      fireEvent.change(textInput, { target: { value: "Test content" } });

      const platformSelect = screen.getByLabelText(/platform/i);
      fireEvent.change(platformSelect, {
        target: { value: Platform.LINKEDIN },
      });

      const toneSelect = screen.getByLabelText(/tone/i);
      fireEvent.change(toneSelect, { target: { value: Tone.CASUAL } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Test content",
            platform: Platform.LINKEDIN,
            tone: Tone.CASUAL,
          }),
        });
      });
    });

    test("calls /api/upload for file input", async () => {
      const { validateFile } = require("../../src/lib/file-validation");
      validateFile.mockReturnValue({
        isValid: true,
        fileType: "image",
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captions: ["File-based caption"],
          requestId: "test-id",
          status: "success",
        }),
      });

      render(<CaptionForm />);

      const fileInput = screen.getByLabelText(/upload file/i);
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/upload",
          expect.objectContaining({
            method: "POST",
            body: expect.any(FormData),
          })
        );
      });
    });

    test("handles API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "API service unavailable",
        }),
      });

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(/post theme/i);
      fireEvent.change(textInput, { target: { value: "Test content" } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/api service unavailable/i)
        ).toBeInTheDocument();
      });
    });

    test("handles network errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(/post theme/i);
      fireEvent.change(textInput, { target: { value: "Test content" } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    test("shows loading state during API call", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    captions: ["Test"],
                    requestId: "test",
                    status: "success",
                  }),
                }),
              100
            )
          )
      );

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(/post theme/i);
      fireEvent.change(textInput, { target: { value: "Test content" } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Form Reset", () => {
    test("resets form after successful submission", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captions: ["Generated caption"],
          requestId: "test-id",
          status: "success",
        }),
      });

      render(<CaptionForm />);

      const textInput = screen.getByLabelText(
        /post theme/i
      ) as HTMLInputElement;
      fireEvent.change(textInput, { target: { value: "Test content" } });

      const submitButton = screen.getByRole("button", {
        name: /generate captions/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(textInput.value).toBe("");
      });
    });
  });
});
