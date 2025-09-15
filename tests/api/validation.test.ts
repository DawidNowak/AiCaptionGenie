/**
 * API Input Validation Tests - T020
 * Tests Zod schema validation for all API endpoints
 * Following TDD: These tests MUST FAIL initially before implementation
 */

import { NextRequest } from 'next/server';
import { POST as generatePost } from '@/app/api/generate/route';
import { POST as uploadPost } from '@/app/api/upload/route';
import { POST as checkoutPost } from '@/app/api/stripe/create-checkout/route';
import { POST as webhookPost } from '@/app/api/stripe/webhook/route';
import { Platform, Tone } from '@/types';

// Mock external dependencies
jest.mock('../../src/lib/openai', () => ({
    generateCaptions: jest.fn().mockResolvedValue([
        'Test caption #awesome',
        'Another test caption #great',
        'Third caption #amazing',
        'Fourth caption #fantastic',
        'Fifth caption #wonderful'
    ]),
    generateImageCaptions: jest.fn().mockResolvedValue([
        'Test image caption #photo',
        'Another image caption #picture',
        'Third image caption #visual',
        'Fourth image caption #snapshot',
        'Fifth image caption #moment'
    ])
}));

jest.mock('../../src/lib/file-validation', () => ({
    validateFile: jest.fn().mockReturnValue({
        isValid: true,
        error: null,
        fileType: 'image/jpeg'
    })
}));

jest.mock('../../src/lib/stripe', () => ({
    createCheckoutSession: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test'
    }),
    verifyWebhookEvent: jest.fn().mockReturnValue({
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } }
    })
}));

// Helper to create mock NextRequest
function createMockRequest(body: any, contentType = 'application/json'): NextRequest {
    const url = 'http://localhost:3000/api/test';

    if (contentType === 'multipart/form-data') {
        const formData = new FormData();
        if (body.file) formData.append('file', body.file);
        if (body.platform) formData.append('platform', body.platform);
        if (body.tone) formData.append('tone', body.tone);

        const request = new Request(url, {
            method: 'POST',
            body: formData
        });
        return request as NextRequest;
    }

    const request = new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: JSON.stringify(body)
    });
    return request as NextRequest;
}

describe('API Input Validation Tests', () => {
    describe('/api/generate validation', () => {
        it('should reject empty content', async () => {
            const request = createMockRequest({
                content: '',
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            });

            const response = await generatePost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Content is required');
        });

        it('should reject missing content', async () => {
            const request = createMockRequest({
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            });

            const response = await generatePost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Content is required');
        });

        it('should reject invalid platform', async () => {
            const request = createMockRequest({
                content: 'Test content',
                platform: 'invalid_platform',
                tone: Tone.CASUAL
            });

            const response = await generatePost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Platform must be one of: instagram, twitter, facebook, linkedin, tiktok');
        });

        it('should reject invalid tone', async () => {
            const request = createMockRequest({
                content: 'Test content',
                platform: Platform.INSTAGRAM,
                tone: 'invalid_tone'
            });

            const response = await generatePost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Tone must be one of: professional, casual, humorous, inspirational, promotional');
        });

        it('should accept valid input', async () => {
            const request = createMockRequest({
                content: 'Valid test content',
                platform: Platform.INSTAGRAM,
                tone: Tone.CASUAL
            });

            const response = await generatePost(request);
            expect(response.status).toBe(200);
        });
    });

    describe('/api/upload validation', () => {
        it('should reject missing file', async () => {
            const formData = new FormData();
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);
            // No file added

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: { get: jest.fn().mockReturnValue('test-user-agent') }
            } as unknown as NextRequest;

            const response = await uploadPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('File is required');
        });

        it('should reject missing platform', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('tone', Tone.CASUAL);
            // No platform added

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: { get: jest.fn().mockReturnValue('test-user-agent') }
            } as unknown as NextRequest;

            const response = await uploadPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Platform must be one of: instagram, twitter, facebook, linkedin, tiktok');
        });

        it('should reject missing tone', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('platform', Platform.INSTAGRAM);
            // No tone added

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: { get: jest.fn().mockReturnValue('test-user-agent') }
            } as unknown as NextRequest;

            const response = await uploadPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Tone must be one of: professional, casual, humorous, inspirational, promotional');
        });

        it('should accept valid input', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('platform', Platform.INSTAGRAM);
            formData.append('tone', Tone.CASUAL);

            const request = {
                formData: jest.fn().mockResolvedValue(formData),
                headers: { get: jest.fn().mockReturnValue('test-user-agent') }
            } as unknown as NextRequest;

            const response = await uploadPost(request);
            if (response.status !== 200) {
                const errorData = await response.json();
                console.log('Upload error:', errorData);
            }
            expect(response.status).toBe(200);
        });
    });

    describe('/api/stripe/create-checkout validation', () => {
        it('should reject empty plan ID', async () => {
            const request = createMockRequest({
                planId: ''
            });

            const response = await checkoutPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Plan ID is required');
        });

        it('should reject missing plan ID', async () => {
            const request = createMockRequest({});

            const response = await checkoutPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Plan ID is required');
        });

        it('should reject invalid success URL if provided', async () => {
            const request = createMockRequest({
                planId: 'valid_plan',
                successUrl: 'not-a-url'
            });

            const response = await checkoutPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('url');
        });

        it('should accept valid input', async () => {
            const request = createMockRequest({
                planId: 'valid_plan_id'
            });

            const response = await checkoutPost(request);
            expect(response.status).toBe(200);
        });
    });

    describe('/api/stripe/webhook validation', () => {
        it('should reject missing signature', async () => {
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                body: 'test webhook payload'
            }) as NextRequest;

            const response = await webhookPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Missing webhook signature');
        });

        it('should reject empty payload', async () => {
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                headers: { 'stripe-signature': 'test_signature' },
                body: ''
            }) as NextRequest;

            const response = await webhookPost(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Webhook payload is required');
        });

        it('should accept valid webhook with signature', async () => {
            const request = new Request('http://localhost:3000/api/stripe/webhook', {
                method: 'POST',
                headers: { 'stripe-signature': 'valid_signature' },
                body: 'valid webhook payload'
            }) as NextRequest;

            const response = await webhookPost(request);
            expect(response.status).toBe(200);
        });
    });
});
