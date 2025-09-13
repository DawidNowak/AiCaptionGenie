/**
 * Contract Test for POST /api/upload
 * Validates file upload limits and response format for caption generation
 * Following TDD principles - this test MUST FAIL initially
 */

import { NextRequest } from 'next/server';
import { Platform, Tone } from '../../src/types';
import * as fileValidation from '../../src/lib/file-validation';
import * as openaiLib from '../../src/lib/openai';

// Mock the dependencies
jest.mock('../../src/lib/file-validation', () => ({
    validateFile: jest.fn()
}));

jest.mock('../../src/lib/openai', () => ({
    generateImageCaptions: jest.fn(),
    resetOpenAIClient: jest.fn()
}));

describe('POST /api/upload - Contract Test', () => {
    const mockValidateFile = fileValidation.validateFile as jest.MockedFunction<typeof fileValidation.validateFile>;
    const mockGenerateImageCaptions = openaiLib.generateImageCaptions as jest.MockedFunction<typeof openaiLib.generateImageCaptions>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reject files that exceed 10MB size limit', async () => {
        // Arrange - Mock file validation to return size error
        mockValidateFile.mockReturnValue({
            isValid: false,
            error: 'File must be under 10MB'
        });

        const formData = new FormData();
        formData.append('file', new File(['large content'.repeat(1000000)], 'large-image.jpg', { type: 'image/jpeg' }));
        formData.append('platform', Platform.INSTAGRAM);
        formData.append('tone', Tone.CASUAL);

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 400 with appropriate error message
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.error).toBe('File must be under 10MB');
        expect(mockValidateFile).toHaveBeenCalledWith(expect.any(File));
    });

    it('should reject unsupported file formats', async () => {
        // Arrange - Mock file validation to return format error
        mockValidateFile.mockReturnValue({
            isValid: false,
            error: 'File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.'
        });

        const formData = new FormData();
        formData.append('file', new File(['content'], 'document.pdf', { type: 'application/pdf' }));
        formData.append('platform', Platform.INSTAGRAM);
        formData.append('tone', Tone.PROFESSIONAL);

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 400 with appropriate error message
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.error).toBe('File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.');
        expect(mockValidateFile).toHaveBeenCalledWith(expect.any(File));
    });

    it('should accept valid files and return formatted captions', async () => {
        // Arrange - Mock successful file validation
        mockValidateFile.mockReturnValue({
            isValid: true,
            fileType: 'image'
        });

        // Mock successful Vision API response
        const mockCaptions = [
            "🌟 Captured this beautiful moment today! ✨ What's inspiring you right now? #Photography #Inspiration #Moment #Beautiful #ShareYourStory",
            "📸 Sometimes the best shots happen when you least expect them 💫 Tag someone who needs to see this! #UnexpectedMoments #Photography #TagSomeone #BestShots #SeeThis",
            "💖 This view never gets old! Nature always knows how to surprise us 🌿 Comment below your favorite nature spot! #NatureLovers #NeverGetsOld #Surprise #ViewsLikeThis #NaturePhotography",
            "✨ Finding beauty in everyday moments like this one 🎯 Double tap if you agree! #EverydayBeauty #FindingBeauty #DoubleTap #BeautyEverywhere #Moments",
            "🎨 When the lighting is just perfect 💡 Share your favorite time to shoot! #PerfectLighting #Photography #ShareYourFavorite #FavoriteTime #GoldenHour"
        ];

        mockGenerateImageCaptions.mockResolvedValue(mockCaptions);

        const formData = new FormData();
        formData.append('file', new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' }));
        formData.append('platform', Platform.INSTAGRAM);
        formData.append('tone', Tone.CASUAL);

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 200 with formatted captions
        expect(response.status).toBe(200);
        const responseData = await response.json();

        expect(responseData.captions).toHaveLength(5);
        expect(responseData.requestId).toBeDefined();
        expect(responseData.generatedAt).toBeDefined();
        expect(responseData.metadata.platform).toBe(Platform.INSTAGRAM);
        expect(responseData.metadata.tone).toBe(Tone.CASUAL);
        expect(responseData.metadata.contentType).toBe('image');

        // Verify all captions contain emojis, CTAs, and hashtags
        responseData.captions.forEach((caption: string) => {
            expect(caption).toMatch(/[🌟📸💖✨🎨💫🌿🎯💡]/); // Contains emojis
            expect(caption).toMatch(/(What's|Tag|Double tap|Comment|Share)/i); // Contains CTA
            expect(caption).toMatch(/#\w+/); // Contains hashtags
        });

        expect(mockValidateFile).toHaveBeenCalledWith(expect.any(File));
        expect(mockGenerateImageCaptions).toHaveBeenCalledWith(
            expect.objectContaining({
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            }),
            expect.any(File)
        );
    });

    it('should handle missing file in request', async () => {
        // Arrange - Create formData without file
        const formData = new FormData();
        formData.append('platform', Platform.LINKEDIN);
        formData.append('tone', Tone.PROFESSIONAL);

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 400 with missing file error
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.error).toBe('No file provided');
        expect(mockValidateFile).not.toHaveBeenCalled();
    });

    it('should handle missing platform or tone parameters', async () => {
        // Arrange - Mock successful file validation
        mockValidateFile.mockReturnValue({
            isValid: true,
            fileType: 'video'
        });

        const formData = new FormData();
        formData.append('file', new File(['video content'], 'test-video.mp4', { type: 'video/mp4' }));
        // Missing platform and tone

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 400 with validation error
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.error).toBe('Platform and tone are required');
    });

    it('should handle OpenAI Vision API errors gracefully', async () => {
        // Arrange - Mock successful file validation but failed AI processing
        mockValidateFile.mockReturnValue({
            isValid: true,
            fileType: 'image'
        });

        mockGenerateImageCaptions.mockRejectedValue(new Error('OpenAI API rate limit exceeded'));

        const formData = new FormData();
        formData.append('file', new File(['image content'], 'test-image.png', { type: 'image/png' }));
        formData.append('platform', Platform.TIKTOK);
        formData.append('tone', Tone.HUMOROUS);

        const request = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        // Act - Import and call the route handler
        const { POST } = await import('../../src/app/api/upload/route');
        const response = await POST(request);

        // Assert - Should return 503 with service unavailable error
        expect(response.status).toBe(503);
        const responseData = await response.json();
        expect(responseData.error).toBe('AI service temporarily unavailable. Please try again later.');
        expect(mockValidateFile).toHaveBeenCalledWith(expect.any(File));
        expect(mockGenerateImageCaptions).toHaveBeenCalled();
    });
});
