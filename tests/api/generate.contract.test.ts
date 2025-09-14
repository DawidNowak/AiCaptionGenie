/**
 * Contract Test for POST /api/generate
 * Validates request/response flow for caption generation
 * Following TDD principles - this test MUST FAIL initially
 */

import { NextRequest } from 'next/server';
import { Platform, Tone, CaptionRequest } from '@/types';
import * as openaiLib from '@/lib/openai';

// Mock the OpenAI library
jest.mock('../../src/lib/openai', () => ({
    generateCaptions: jest.fn(),
    generateImageCaptions: jest.fn(),
    resetOpenAIClient: jest.fn()
}));

describe('POST /api/generate - Contract Test', () => {
    const mockGenerateCaptions = openaiLib.generateCaptions as jest.MockedFunction<typeof openaiLib.generateCaptions>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate complete request/response flow for text input', async () => {
        // Arrange - Mock OpenAI response with properly formatted captions
        const mockCaptions = [
            "🌟 Just discovered this amazing new product! Can't wait to share my thoughts with you all 💭 #ProductReview #Discovery #NewFinds #Excited #ShareYourThoughts",
            "✨ Product review time! This little gem has been a game-changer in my daily routine 🔄 What's your latest discovery? #GameChanger #DailyRoutine #ProductLove #LifeHacks #TellMeYours",
            "💫 Found something special today and I'm absolutely loving it! 💖 Drop a comment if you want the details 👇 #SpecialFind #LovingIt #ProductDetails #CommentBelow #ShareTheLove",
            "🎯 New product alert! This has exceeded all my expectations 📈 Who else loves finding hidden gems? #ProductAlert #ExceedsExpectations #HiddenGems #ProductHunt #LoveFinds",
            "🚀 Game-changing discovery! This product is everything I didn't know I needed ⭐ #GameChanger #Discovery #Needed #ProductReview #Everything"
        ];

        mockGenerateCaptions.mockResolvedValue(mockCaptions);

        // Arrange - Create valid request payload
        const validRequest: CaptionRequest = {
            content: "A new product I'm testing for review",
            platform: Platform.INSTAGRAM,
            tone: Tone.CASUAL
        };

        const requestBody = JSON.stringify(validRequest);
        const request = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - This will fail because the endpoint doesn't exist yet (TDD)
        // Import the route handler (this will fail initially)
        const { POST } = await import('@/app/api/generate/route');
        const response = await POST(request);

        // Assert - Validate response structure
        expect(response.status).toBe(200);

        const responseData = await response.json();

        // Validate response matches contract
        expect(responseData).toHaveProperty('requestId');
        expect(responseData).toHaveProperty('captions');
        expect(responseData).toHaveProperty('processingTime');
        expect(responseData).toHaveProperty('tokensUsed');
        expect(responseData).toHaveProperty('timestamp');
        expect(responseData).toHaveProperty('status', 'success');
        expect(responseData).toHaveProperty('remainingGenerations');

        // Validate captions array
        expect(Array.isArray(responseData.captions)).toBe(true);
        expect(responseData.captions.length).toBeGreaterThanOrEqual(5);
        expect(responseData.captions.length).toBeLessThanOrEqual(10);

        // Validate each caption has required properties
        responseData.captions.forEach((caption: any) => {
            expect(caption).toHaveProperty('id');
            expect(caption).toHaveProperty('text');
            expect(caption).toHaveProperty('callToAction');
            expect(caption).toHaveProperty('hashtags');
            expect(caption).toHaveProperty('platform', Platform.INSTAGRAM);
            expect(caption).toHaveProperty('tone', Tone.CASUAL);
            expect(caption).toHaveProperty('emojiCount');
            expect(caption).toHaveProperty('characterCount');

            // Validate text content requirements
            expect(typeof caption.text).toBe('string');
            expect(caption.text.length).toBeGreaterThan(0);

            // Validate emojis are present
            expect(caption.emojiCount).toBeGreaterThanOrEqual(1);

            // Validate hashtags array
            expect(Array.isArray(caption.hashtags)).toBe(true);
            expect(caption.hashtags.length).toBeGreaterThanOrEqual(3);
            expect(caption.hashtags.length).toBeLessThanOrEqual(5);

            // Validate call-to-action exists
            expect(typeof caption.callToAction).toBe('string');
            expect(caption.callToAction.length).toBeGreaterThan(0);
        });

        // Verify OpenAI was called with correct parameters
        expect(mockGenerateCaptions).toHaveBeenCalledWith({
            content: "A new product I'm testing for review",
            platform: Platform.INSTAGRAM,
            tone: Tone.CASUAL
        });
    });

    it('should handle professional tone for LinkedIn platform', async () => {
        // Arrange - Mock professional LinkedIn captions
        const mockLinkedInCaptions = [
            "Excited to share insights from my latest product evaluation 📊 The results demonstrate significant value proposition for modern workflows. #ProductAnalysis #Innovation #WorkflowOptimization #ProfessionalGrowth #BusinessInsights",
            "Professional review: This solution addresses key market needs with exceptional execution ⚡ Looking forward to discussing implementation strategies. #ProfessionalReview #MarketSolutions #Implementation #Strategy #BusinessSolutions"
        ];

        mockGenerateCaptions.mockResolvedValue(mockLinkedInCaptions);

        const professionalRequest: CaptionRequest = {
            content: "Enterprise software evaluation results",
            platform: Platform.LINKEDIN,
            tone: Tone.PROFESSIONAL
        };

        const requestBody = JSON.stringify(professionalRequest);
        const request = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act
        const { POST } = await import('@/app/api/generate/route');
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);

        const responseData = await response.json();
        expect(responseData.status).toBe('success');
        expect(responseData.captions.length).toBeGreaterThanOrEqual(2);

        // Verify platform and tone are correctly set
        responseData.captions.forEach((caption: any) => {
            expect(caption.platform).toBe(Platform.LINKEDIN);
            expect(caption.tone).toBe(Tone.PROFESSIONAL);
        });
    });

    it('should return error for invalid request payload', async () => {
        // Arrange - Invalid request (missing required fields)
        const invalidRequest = {
            content: "Some content"
            // Missing platform and tone
        };

        const requestBody = JSON.stringify(invalidRequest);
        const request = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act
        const { POST } = await import('@/app/api/generate/route');
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(400);

        const responseData = await response.json();
        expect(responseData).toHaveProperty('error');
        expect(typeof responseData.error).toBe('string');
    });
});
