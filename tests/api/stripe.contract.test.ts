/**
 * Contract Test for POST /api/stripe/create-checkout
 * Validates request/response flow for Stripe checkout session creation
 * Following TDD principles - this test MUST FAIL initially
 */

import { NextRequest } from 'next/server';

// Mock the Stripe library - using any to avoid type conflicts during test development
jest.mock('../../src/lib/stripe', () => ({
    createCheckoutSession: jest.fn()
}));

// Define Stripe-related types for the test
interface StripeCheckoutRequest {
    planId: string;
    successUrl?: string;
    cancelUrl?: string;
}

interface StripeCheckoutResponse {
    sessionId: string;
    url: string;
}

describe('POST /api/stripe/create-checkout - Contract Test', () => {
    // Get the mocked function with proper typing
    const mockCreateCheckoutSession = jest.fn();

    beforeAll(() => {
        // Mock the stripe lib import
        jest.doMock('../../src/lib/stripe', () => ({
            createCheckoutSession: mockCreateCheckoutSession
        }));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateCheckoutSession.mockClear();
    });

    it('should validate complete request/response flow for checkout session creation', async () => {
        // Arrange - Mock Stripe response with session details
        const mockSessionResponse = {
            sessionId: 'cs_test_1234567890abcdef',
            url: 'https://checkout.stripe.com/pay/cs_test_1234567890abcdef#fidkdWxOYHwnPyd1blppbHNgWjA0YmNmS2pPYnNsZXVLZEZINGhJQjc3VEltNX1QQnJiZFJLNDBLQGQ8M25Xa2JDNmZWQnJNdnA2Zkh8MjU0QTFgdDM3YWJxQ2xnVjFWUE0zY0BuN2Q3Qjd2QTBFSzJkRUFOX1BKdCcpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgKSdpZGxqcF98ZSc%2FJ2BrZGlnYCc%3D'
        };

        mockCreateCheckoutSession.mockResolvedValue(mockSessionResponse);

        // Arrange - Create valid request payload
        const validRequest: StripeCheckoutRequest = {
            planId: 'unlimited_plan',
            successUrl: 'http://localhost:3000/success',
            cancelUrl: 'http://localhost:3000/cancel'
        };

        const requestBody = JSON.stringify(validRequest);
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler (this will fail initially)
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate response structure and data
        expect(response.status).toBe(200);

        const responseData: StripeCheckoutResponse = await response.json();
        expect(responseData).toHaveProperty('sessionId');
        expect(responseData).toHaveProperty('url');
        expect(responseData.sessionId).toMatch(/^cs_test_/);
        expect(responseData.url).toContain('checkout.stripe.com');

        // Verify the Stripe client was called with correct parameters
        expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
            planId: 'unlimited_plan',
            successUrl: 'http://localhost:3000/success',
            cancelUrl: 'http://localhost:3000/cancel'
        });
    });

    it('should handle invalid plan ID error', async () => {
        // Arrange - Mock Stripe error for invalid plan
        const stripeError = new Error('Invalid plan ID: unknown_plan');
        mockCreateCheckoutSession.mockRejectedValue(stripeError);

        const invalidRequest: StripeCheckoutRequest = {
            planId: 'unknown_plan'
        };

        const requestBody = JSON.stringify(invalidRequest);
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate error response
        expect(response.status).toBe(400);

        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toContain('Invalid plan');

        // Verify the Stripe client was called
        expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
            planId: 'unknown_plan'
        });
    });

    it('should handle missing API key error', async () => {
        // Arrange - Mock Stripe API key error
        const apiKeyError = new Error('Stripe API key not configured');
        mockCreateCheckoutSession.mockRejectedValue(apiKeyError);

        const validRequest: StripeCheckoutRequest = {
            planId: 'unlimited_plan'
        };

        const requestBody = JSON.stringify(validRequest);
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate error response
        expect(response.status).toBe(500);

        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toContain('service unavailable');

        // Verify the Stripe client was called
        expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
            planId: 'unlimited_plan'
        });
    });

    it('should validate required fields in request body', async () => {
        // Arrange - Request with missing planId
        const invalidRequest = {
            successUrl: 'http://localhost:3000/success'
            // planId is missing
        };

        const requestBody = JSON.stringify(invalidRequest);
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate validation error response
        expect(response.status).toBe(400);

        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toContain('planId is required');

        // Verify the Stripe client was NOT called for invalid input
        expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON in request body', async () => {
        // Arrange - Invalid JSON payload
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: '{"planId": "unlimited_plan", invalid json',
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate JSON parsing error response
        expect(response.status).toBe(400);

        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toContain('Invalid JSON');

        // Verify the Stripe client was NOT called for malformed input
        expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
    });

    it('should provide default URLs when not specified', async () => {
        // Arrange - Mock successful session creation
        const mockSessionResponse = {
            sessionId: 'cs_test_default_urls',
            url: 'https://checkout.stripe.com/pay/cs_test_default_urls'
        };

        mockCreateCheckoutSession.mockResolvedValue(mockSessionResponse);

        // Arrange - Request with only planId (no URLs)
        const minimalRequest: StripeCheckoutRequest = {
            planId: 'unlimited_plan'
        };

        const requestBody = JSON.stringify(minimalRequest);
        const request = new Request('http://localhost:3000/api/stripe/create-checkout', {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        }) as NextRequest;

        // Act - Import and call the route handler
        const { POST } = await import('@/app/api/stripe/create-checkout/route');
        const response = await POST(request);

        // Assert - Validate successful response
        expect(response.status).toBe(200);

        const responseData: StripeCheckoutResponse = await response.json();
        expect(responseData.sessionId).toBe('cs_test_default_urls');

        // Verify the Stripe client was called (URLs are handled internally)
        expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
            planId: 'unlimited_plan',
            successUrl: undefined,
            cancelUrl: undefined
        });
    });
});
