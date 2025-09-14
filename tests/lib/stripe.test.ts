/**
 * Test file for Stripe client wrapper
 * Following TDD principles - this test should FAIL initially
 */

import { jest } from '@jest/globals';
import type { Stripe } from 'stripe';

// Mock the Stripe module
const mockCreate = jest.fn() as jest.MockedFunction<any>;
const mockConstructEvent = jest.fn() as jest.MockedFunction<any>;

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: mockCreate,
            },
        },
        webhooks: {
            constructEvent: mockConstructEvent,
        },
    }));
});

jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(),
}));

describe('Stripe Client Wrapper', () => {
    // Mock environment variables
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules(); // Reset module cache for singleton pattern
        process.env = {
            ...originalEnv,
            STRIPE_SECRET_KEY: 'sk_test_mock_key',
            STRIPE_WEBHOOK_SECRET: 'whsec_mock_secret',
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Stripe client initialization', () => {
        it('should initialize Stripe client with secret key', async () => {
            const { getStripeClient } = await import('@/lib/stripe');

            const client = getStripeClient();
            expect(client).toBeDefined();
        });

        it('should throw error with invalid API key', async () => {
            process.env.STRIPE_SECRET_KEY = '';

            const { getStripeClient } = await import('@/lib/stripe');

            expect(() => getStripeClient()).toThrow('Stripe secret key is required');
        });
    });

    describe('Checkout session creation', () => {
        it('should create checkout session for subscription plan', async () => {
            const mockSession = {
                id: 'cs_test_mock_session_id',
                url: 'https://checkout.stripe.com/pay/cs_test_mock_session_id',
            };

            mockCreate.mockResolvedValue(mockSession);

            const { createCheckoutSession } = await import('@/lib/stripe');

            const result = await createCheckoutSession({
                planId: 'unlimited_plan'
            });

            expect(result.sessionId).toBe('cs_test_mock_session_id');
            expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_mock_session_id');
            expect(mockCreate).toHaveBeenCalledWith({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'AI Caption Genie Pro',
                            description: 'Unlimited caption generations',
                        },
                        unit_amount: 997, // $9.97
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                }],
                success_url: expect.stringContaining('/success'),
                cancel_url: expect.stringContaining('/'),
            });
        });

        it('should handle Stripe API errors during checkout creation', async () => {
            mockCreate.mockRejectedValue(new Error('Invalid API key'));

            const { createCheckoutSession } = await import('@/lib/stripe');

            await expect(createCheckoutSession({
                planId: 'unlimited_plan'
            })).rejects.toThrow('Failed to create checkout session');
        });
    });

    describe('Webhook verification', () => {
        it('should verify webhook event with valid signature', async () => {
            const mockEvent = {
                id: 'evt_test_webhook',
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test_session',
                        payment_status: 'paid',
                    },
                },
            };

            mockConstructEvent.mockReturnValue(mockEvent);

            const { verifyWebhookEvent } = await import('@/lib/stripe');

            const payload = JSON.stringify(mockEvent);
            const signature = 'test_signature';

            const event = verifyWebhookEvent(payload, signature);

            expect(event).toEqual(mockEvent);
            expect(mockConstructEvent).toHaveBeenCalledWith(
                payload,
                signature,
                'whsec_mock_secret'
            );
        });

        it('should throw error with invalid webhook signature', async () => {
            mockConstructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            const { verifyWebhookEvent } = await import('@/lib/stripe');

            const payload = 'invalid_payload';
            const signature = 'invalid_signature';

            expect(() => verifyWebhookEvent(payload, signature)).toThrow('Webhook signature verification failed');
        });

        it('should handle missing webhook secret', async () => {
            process.env.STRIPE_WEBHOOK_SECRET = '';

            const { verifyWebhookEvent } = await import('@/lib/stripe');

            expect(() => verifyWebhookEvent('payload', 'signature')).toThrow('Stripe webhook secret is required');
        });
    });
});
