/**
 * Contract Test for POST /api/stripe/webhook
 * Validates webhook signature verification and event handling
 * Following TDD principles - this test MUST FAIL initially
 */

import { NextRequest } from 'next/server';

// Mock the Stripe library for webhook verification
jest.mock('../../src/lib/stripe', () => ({
    verifyWebhookEvent: jest.fn()
}));

// Define webhook-related types for the test
interface WebhookEventMock {
    id: string;
    type: string;
    data: {
        object: {
            id: string;
            status: string;
        };
    };
}

describe('POST /api/stripe/webhook - Contract Test', () => {
    // Get the mocked function with proper typing
    const mockVerifyWebhookEvent = jest.fn();

    beforeAll(() => {
        // Mock the stripe lib import
        jest.doMock('../../src/lib/stripe', () => ({
            verifyWebhookEvent: mockVerifyWebhookEvent
        }));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockVerifyWebhookEvent.mockClear();
    });

    it('should handle valid webhook signature and checkout.session.completed event', async () => {
        // Arrange - Mock successful signature verification
        const mockEvent: WebhookEventMock = {
            id: 'evt_test_1234567890',
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_1234567890abcdef',
                    status: 'complete'
                }
            }
        };

        mockVerifyWebhookEvent.mockReturnValue(mockEvent);

        // Create mock request with webhook payload and signature
        const webhookPayload = JSON.stringify(mockEvent);
        const mockSignature = 't=1234567890,v1=mock_signature_hash';

        const mockRequest = {
            text: jest.fn().mockResolvedValue(webhookPayload),
            headers: {
                get: jest.fn().mockImplementation((header: string) => {
                    if (header === 'stripe-signature') return mockSignature;
                    return null;
                })
            }
        } as unknown as NextRequest;

        // Act - Import and call the webhook handler
        const { POST } = await import('../../src/app/api/stripe/webhook/route');
        const response = await POST(mockRequest);

        // Assert - Verify successful processing
        expect(response.status).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            received: true,
            eventType: 'checkout.session.completed'
        });

        // Verify that webhook verification was called correctly
        expect(mockVerifyWebhookEvent).toHaveBeenCalledWith(
            webhookPayload,
            mockSignature
        );
    });

    it('should return 400 for invalid webhook signature', async () => {
        // Arrange - Mock signature verification failure
        mockVerifyWebhookEvent.mockImplementation(() => {
            throw new Error('Webhook signature verification failed');
        });

        const webhookPayload = JSON.stringify({ test: 'event' });
        const invalidSignature = 'invalid_signature';

        const mockRequest = {
            text: jest.fn().mockResolvedValue(webhookPayload),
            headers: {
                get: jest.fn().mockImplementation((header: string) => {
                    if (header === 'stripe-signature') return invalidSignature;
                    return null;
                })
            }
        } as unknown as NextRequest;

        // Act - Import and call the webhook handler
        const { POST } = await import('../../src/app/api/stripe/webhook/route');
        const response = await POST(mockRequest);

        // Assert - Verify error handling
        expect(response.status).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Invalid webhook signature'
        });

        // Verify that webhook verification was attempted
        expect(mockVerifyWebhookEvent).toHaveBeenCalledWith(
            webhookPayload,
            invalidSignature
        );
    });

    it('should return 400 when stripe-signature header is missing', async () => {
        // Arrange - Mock request without signature header
        const webhookPayload = JSON.stringify({ test: 'event' });

        const mockRequest = {
            text: jest.fn().mockResolvedValue(webhookPayload),
            headers: {
                get: jest.fn().mockReturnValue(null)
            }
        } as unknown as NextRequest;

        // Act - Import and call the webhook handler
        const { POST } = await import('../../src/app/api/stripe/webhook/route');
        const response = await POST(mockRequest);

        // Assert - Verify error handling
        expect(response.status).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Missing webhook signature'
        });

        // Verify that webhook verification was not called
        expect(mockVerifyWebhookEvent).not.toHaveBeenCalled();
    });

    it('should handle non-checkout events gracefully', async () => {
        // Arrange - Mock a different event type
        const mockEvent: WebhookEventMock = {
            id: 'evt_test_0987654321',
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_0987654321',
                    status: 'succeeded'
                }
            }
        };

        mockVerifyWebhookEvent.mockReturnValue(mockEvent);

        const webhookPayload = JSON.stringify(mockEvent);
        const mockSignature = 't=1234567890,v1=mock_signature_hash';

        const mockRequest = {
            text: jest.fn().mockResolvedValue(webhookPayload),
            headers: {
                get: jest.fn().mockImplementation((header: string) => {
                    if (header === 'stripe-signature') return mockSignature;
                    return null;
                })
            }
        } as unknown as NextRequest;

        // Act - Import and call the webhook handler
        const { POST } = await import('../../src/app/api/stripe/webhook/route');
        const response = await POST(mockRequest);

        // Assert - Verify successful processing (but no special handling)
        expect(response.status).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            received: true,
            eventType: 'payment_intent.succeeded'
        });
    });

    it('should handle internal server errors gracefully', async () => {
        // Arrange - Mock unexpected error during verification
        mockVerifyWebhookEvent.mockImplementation(() => {
            throw new Error('Unexpected internal error');
        });

        const webhookPayload = JSON.stringify({ test: 'event' });
        const mockSignature = 't=1234567890,v1=mock_signature_hash';

        const mockRequest = {
            text: jest.fn().mockResolvedValue(webhookPayload),
            headers: {
                get: jest.fn().mockImplementation((header: string) => {
                    if (header === 'stripe-signature') return mockSignature;
                    return null;
                })
            }
        } as unknown as NextRequest;

        // Act - Import and call the webhook handler
        const { POST } = await import('../../src/app/api/stripe/webhook/route');
        const response = await POST(mockRequest);

        // Assert - Verify error handling
        expect(response.status).toBe(500);
        
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Internal server error'
        });
    });
});
