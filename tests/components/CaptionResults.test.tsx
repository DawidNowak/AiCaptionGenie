/**
 * CaptionResults Component Tests
 * Following TDD principles for T011
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CaptionResults from "@/components/CaptionResults";

// Mock the clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock the anchor element click for download
const mockClick = jest.fn();
HTMLAnchorElement.prototype.click = mockClick;

describe("CaptionResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Empty State", () => {
    it('should display "No captions yet" message when captions array is empty', () => {
      render(<CaptionResults captions={[]} />);

      expect(screen.getByText("No captions yet")).toBeInTheDocument();
      expect(screen.queryByText("Download All")).not.toBeInTheDocument();
    });

    it('should display "No captions yet" message when captions prop is undefined', () => {
      render(<CaptionResults captions={undefined} />);

      expect(screen.getByText("No captions yet")).toBeInTheDocument();
    });
  });

  describe("Caption Display", () => {
    const mockCaptions = [
      "Test caption 1 😊 Comment below! #test #caption",
      "Test caption 2 🚀 Tag a friend! #social #media",
      "Test caption 3 💯 Share your thoughts! #engagement #content",
    ];

    it("should render list of captions with copy buttons", () => {
      render(<CaptionResults captions={mockCaptions} />);

      mockCaptions.forEach((caption) => {
        expect(screen.getByText(caption)).toBeInTheDocument();
      });

      const copyButtons = screen.getAllByText("Copy");
      expect(copyButtons).toHaveLength(mockCaptions.length);
    });

    it("should display Download All button when captions exist", () => {
      render(<CaptionResults captions={mockCaptions} />);

      expect(screen.getByText("📥 Download All Captions")).toBeInTheDocument();
    });

    it("should have mobile-friendly responsive layout", () => {
      render(<CaptionResults captions={mockCaptions} />);

      const container = screen.getByRole("list");
      expect(container).toHaveClass("space-y-3", "sm:space-y-4");
    });
  });

  describe("Copy Functionality", () => {
    const mockCaptions = [
      "Test caption 1 😊 Comment below! #test #caption",
      "Test caption 2 🚀 Tag a friend! #social #media",
    ];

    it("should copy caption text to clipboard when copy button is clicked", async () => {
      mockWriteText.mockResolvedValue(undefined);

      render(<CaptionResults captions={mockCaptions} />);

      const copyButtons = screen.getAllByText("Copy");
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(mockCaptions[0]);
      });
    });

    it("should show feedback when copy is successful", async () => {
      mockWriteText.mockResolvedValue(undefined);

      render(<CaptionResults captions={mockCaptions} />);

      const copyButtons = screen.getAllByText("Copy");
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("✓ Copied!")).toBeInTheDocument();
      });
    });

    it("should handle copy errors gracefully", async () => {
      mockWriteText.mockRejectedValue(new Error("Clipboard error"));

      render(<CaptionResults captions={mockCaptions} />);

      const copyButtons = screen.getAllByText("Copy");
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("✗ Failed")).toBeInTheDocument();
      });
    });
  });

  describe("Download Functionality", () => {
    const mockCaptions = [
      "Test caption 1 😊 Comment below! #test #caption",
      "Test caption 2 🚀 Tag a friend! #social #media",
      "Test caption 3 💯 Share your thoughts! #engagement #content",
    ];

    it("should create and download text file when Download All is clicked", async () => {
      render(<CaptionResults captions={mockCaptions} />);

      const downloadButton = screen.getByText("📥 Download All Captions");
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(
          expect.any(Blob)
        );
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it("should create blob with correct content format", async () => {
      render(<CaptionResults captions={mockCaptions} />);

      const downloadButton = screen.getByText("📥 Download All Captions");
      fireEvent.click(downloadButton);

      await waitFor(() => {
        const blobCall = (global.URL.createObjectURL as jest.Mock).mock
          .calls[0][0];
        expect(blobCall).toBeInstanceOf(Blob);
        expect(blobCall.type).toBe("text/plain");
      });
    });

    it("should cleanup URL after download", async () => {
      render(<CaptionResults captions={mockCaptions} />);

      const downloadButton = screen.getByText("📥 Download All Captions");
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mocked-url");
      });
    });
  });

  describe("Accessibility", () => {
    const mockCaptions = [
      "Test caption 1 😊 Comment below! #test #caption",
      "Test caption 2 🚀 Tag a friend! #social #media",
    ];

    it("should have proper ARIA labels for copy buttons", () => {
      render(<CaptionResults captions={mockCaptions} />);

      const copyButtons = screen.getAllByLabelText(
        /Copy caption \d+ to clipboard/
      );
      expect(copyButtons).toHaveLength(mockCaptions.length);
    });

    it("should have proper ARIA label for download button", () => {
      render(<CaptionResults captions={mockCaptions} />);

      expect(
        screen.getByLabelText("Download all captions as text file")
      ).toBeInTheDocument();
    });

    it("should have proper list semantics", () => {
      render(<CaptionResults captions={mockCaptions} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(mockCaptions.length);
    });
  });
});
