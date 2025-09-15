/**
 * Comprehensive Error Handling Tests for API Routes
 * T019: Tests error responses for generate, upload, create-checkout, and webhook routes
 * Validates user-friendly error messages and consistent error formats
 */

import { NextRequest } from 'next/server';
import { POST as generatePost } from '@/app/api/generate/route';
import { POST as uploadPost } from '@/app/api/upload/route';
import { POST as checkoutPost } from '@/app/api/stripe/create-checkout/route';
import { POST as webhookPost } from '@/app/api/stripe/webhook/route';

// Mock dependencies
jest.mock('../../src/lib/openai', () => ({
    generateCaptions: jest.fn(),
    generateImageCaptions: jest.fn()
}));

jest.mock('../../src/lib/file-validation', () => ({
    validateFile: jest.fn()
}));

jest.mock('../../src/lib/stripe', () => ({
    createCheckoutSession: jest.fn(),
    verifyWebhookEvent: jest.fn()
}));

// Import mocked functions for test control
import * as openaiLib from '@/lib/openai';
import * as fileValidationLib from '@/lib/file-validation';
import * as stripeLib from '@/lib/stripe';
import { Platform, Tone } from '@/types';

const mockGenerateCaptions = openaiLib.generateCaptions as jest.MockedFunction<typeof openaiLib.generateCaptions>;
const mockGenerateImageCaptions = openaiLib.generateImageCaptions as jest.MockedFunction<typeof openaiLib.generateImageCaptions>;
const mockValidateFile = fileValidationLib.validateFile as jest.MockedFunction<typeof fileValidationLib.validateFile>;
const mockCreateCheckoutSession = stripeLib.createCheckoutSession as jest.MockedFunction<typeof stripeLib.createCheckoutSession>;
const mockVerifyWebhookEvent = stripeLib.verifyWebhookEvent as jest.MockedFunction<typeof stripeLib.verifyWebhookEvent>;

describe('Error Handling - API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('/api/generate', () => {
        it('should return user-friendly error for missing content', async () => {
            // Arrange
            const requestBody = {
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
                // content is missing
            };

            const request = new Request('http://localhost:3000/api/generate', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Act
            const response = await generatePost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toContain('Content is required');
        });

        it('should return user-friendly error for invalid platform', async () => {
            // Arrange
            const requestBody = {
                content: 'Test content',
                platform: 'invalid_platform',
                tone: Tone.CASUAL
            };

            const request = new Request('http://localhost:3000/api/generate', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Act
            const response = await generatePost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toContain('Platform must be one of: instagram, twitter, facebook, linkedin, tiktok');
        });

        it('should return user-friendly error for OpenAI API errors', async () => {
            // Arrange
            const requestBody = {
                content: 'Test content',
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            };

            const request = new Request('http://localhost:3000/api/generate', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            mockGenerateCaptions.mockRejectedValue(new Error('Failed to generate captions'));

            // Act
            const response = await generatePost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(503);
            expect(responseData.error).toBe('AI service temporarily unavailable');
        });

        it('should return user-friendly error for OpenAI configuration errors', async () => {
            // Arrange
            const requestBody = {
                content: 'Test content',
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            };

            const request = new Request('http://localhost:3000/api/generate', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            mockGenerateCaptions.mockRejectedValue(new Error('OpenAI API key is not configured'));

            // Act
            const response = await generatePost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(503);
            expect(responseData.error).toBe('AI service not configured');
        });
    });

    describe('/api/upload', () => {
        it('should return user-friendly error for missing file', async () => {
            // Arrange
            const formData = new FormData();
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);
            // file is missing

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            // Act
            const response = await uploadPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('No file provided');
        });

        it('should return user-friendly error for file validation failures - size limit', async () => {
            // Arrange
            const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            // Mock file validation to return size error
            mockValidateFile.mockReturnValue({
                isValid: false,
                error: 'File must be under 10MB'
            });

            // Act
            const response = await uploadPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('File must be under 10MB');
        });

        it('should return user-friendly error for file validation failures - unsupported format', async () => {
            // Arrange
            const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            // Mock file validation to return format error
            mockValidateFile.mockReturnValue({
                isValid: false,
                error: 'File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.'
            });

            // Act
            const response = await uploadPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.');
        });

        it('should return user-friendly error for OpenAI Vision API errors', async () => {
            // Arrange
            const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            // Mock successful file validation
            mockValidateFile.mockReturnValue({
                isValid: true,
                fileType: 'image'
            });

            // Mock OpenAI Vision API rate limit error
            mockGenerateImageCaptions.mockRejectedValue(new Error('rate limit exceeded'));

            // Act
            const response = await uploadPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(503);
            expect(responseData.error).toBe('AI service temporarily unavailable. Please try again later.');
        });

        it('should return user-friendly error for missing platform/tone', async () => {
            // Arrange
            const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            // platform and tone are missing

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            // Act
            const response = await uploadPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Platform and tone are required');
        });
    });

    describe('/api/stripe/create-checkout', () => {
        it('should return user-friendly error for missing planId', async () => {
            // Arrange
            const requestBody = {
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
                // planId is missing
            };

            const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Act
            const response = await checkoutPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('planId is required');
        });

        it('should return user-friendly error for invalid subscription plan', async () => {
            // Arrange
            const requestBody = {
                planId: 'invalid_plan_id',
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            };

            const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Mock Stripe error for invalid plan
            mockCreateCheckoutSession.mockRejectedValue(new Error('Invalid plan ID: invalid_plan_id'));

            // Act
            const response = await checkoutPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Invalid plan ID');
        });

        it('should return user-friendly error for Stripe API errors', async () => {
            // Arrange
            const requestBody = {
                planId: 'valid_plan_id',
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            };

            const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Mock Stripe API key error
            mockCreateCheckoutSession.mockRejectedValue(new Error('Stripe API key is required'));

            // Act
            const response = await checkoutPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(500);
            expect(responseData.error).toBe('Payment service unavailable');
        });

        it('should return user-friendly error for malformed JSON', async () => {
            // Arrange
            const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
                method: 'POST',
                body: 'invalid json{',
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            // Act
            const response = await checkoutPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Invalid JSON in request body');
        });
    });

    describe('/api/stripe/webhook', () => {
        it('should return user-friendly error for missing webhook signature', async () => {
            // Arrange
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                body: 'webhook payload',
                headers: { 'Content-Type': 'application/json' }
                // stripe-signature header is missing
            }) as NextRequest;

            // Act
            const response = await webhookPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Missing webhook signature');
        });

        it('should return user-friendly error for invalid webhook signature', async () => {
            // Arrange
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                body: 'webhook payload',
                headers: {
                    'Content-Type': 'application/json',
                    'stripe-signature': 'invalid_signature'
                }
            }) as NextRequest;

            // Mock webhook signature verification failure
            mockVerifyWebhookEvent.mockImplementation(() => {
                throw new Error('Webhook signature verification failed');
            });

            // Act
            const response = await webhookPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Invalid webhook signature');
        });

        it('should handle internal server errors gracefully', async () => {
            // Arrange
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                body: 'webhook payload',
                headers: {
                    'Content-Type': 'application/json',
                    'stripe-signature': 'valid_signature'
                }
            }) as NextRequest;

            // Mock unexpected error
            mockVerifyWebhookEvent.mockImplementation(() => {
                throw new Error('Unexpected internal error');
            });

            // Act
            const response = await webhookPost(request);
            const responseData = await response.json();

            // Assert
            expect(response.status).toBe(500);
            expect(responseData.error).toBe('Internal server error');
        });
    });

    describe('Error Format Consistency', () => {
        it('should return consistent error format across all routes', async () => {
            // Test that all routes return { error: "message" } format

            // Test generate route
            const generateRequest = new Request('http://localhost:3000/api/generate', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            const generateResponse = await generatePost(generateRequest);
            const generateData = await generateResponse.json();
            expect(generateData).toHaveProperty('error');
            expect(typeof generateData.error).toBe('string');

            // Test upload route
            const uploadRequest = {
                formData: jest.fn().mockResolvedValue(new FormData()),
                headers: {
                    get: jest.fn().mockReturnValue('test-user-agent')
                }
            } as unknown as NextRequest;

            const uploadResponse = await uploadPost(uploadRequest);
            const uploadData = await uploadResponse.json();
            expect(uploadData).toHaveProperty('error');
            expect(typeof uploadData.error).toBe('string');

            // Test checkout route
            const checkoutRequest = new Request('http://localhost:3000/api/stripe/create-checkout', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' }
            }) as NextRequest;

            const checkoutResponse = await checkoutPost(checkoutRequest);
            const checkoutData = await checkoutResponse.json();
            expect(checkoutData).toHaveProperty('error');
            expect(typeof checkoutData.error).toBe('string');

            // Test webhook route
            const webhookRequest = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                body: 'payload'
            }) as NextRequest;

            const webhookResponse = await webhookPost(webhookRequest);
            const webhookData = await webhookResponse.json();
            expect(webhookData).toHaveProperty('error');
            expect(typeof webhookData.error).toBe('string');
        });
    });
});
