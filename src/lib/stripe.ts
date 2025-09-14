/**
 * Stripe client wrapper for AI Caption Genie
 * Handles checkout session creation and webhook verification
 * Follows constitution: user-centric simplicity, privacy-first, cost-efficient
 */

import Stripe from 'stripe';

// Singleton Stripe client instance
let stripeInstance: Stripe | null = null;

/**
 * Reset the Stripe instance (useful for testing)
 */
export function resetStripeInstance(): void {
    stripeInstance = null;
}

/**
 * Get Stripe client instance with proper error handling
 * Throws error if STRIPE_SECRET_KEY is not provided
 */
export function getStripeClient(): Stripe {
    if (!stripeInstance) {
        const secretKey = process.env.STRIPE_SECRET_KEY;

        if (!secretKey) {
            throw new Error('Stripe secret key is required');
        }

        stripeInstance = new Stripe(secretKey, {
            apiVersion: '2024-06-20',
            typescript: true,
        });
    }

    return stripeInstance;
}

/**
 * Checkout session parameters interface
 */
export interface CheckoutSessionParams {
    planId: string;
    successUrl?: string;
    cancelUrl?: string;
}

/**
 * Checkout session response interface  
 */
export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

/**
 * Create a checkout session for AI Caption Genie subscription
 * Returns session object with ID and URL for redirecting user
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse> {
    try {
        const stripe = getStripeClient();

        // Validate plan ID
        if (!params.planId) {
            throw new Error('Plan ID is required');
        }

        // For MVP, only support unlimited_plan
        if (params.planId !== 'unlimited_plan') {
            throw new Error(`Invalid plan ID: ${params.planId}`);
        }

        // Set default URLs if not provided
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = params.successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = params.cancelUrl || `${baseUrl}/cancel`;

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'AI Caption Genie Pro',
                        description: 'Unlimited caption generations',
                    },
                    unit_amount: 997, // $9.97 per month
                    recurring: {
                        interval: 'month',
                    },
                },
                quantity: 1,
            }],
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return {
            sessionId: session.id,
            url: session.url || ''
        };
    } catch (error) {
        if (error instanceof Error) {
            // Preserve specific validation errors but wrap Stripe API errors
            if (error.message.includes('Invalid plan ID') || error.message.includes('Plan ID is required')) {
                throw error;
            }
        }
        throw new Error('Failed to create checkout session');
    }
}

/**
 * Verify webhook event signature using Stripe's webhook secret
 * Throws error if signature verification fails or webhook secret is missing
 */
export function verifyWebhookEvent(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw new Error('Stripe webhook secret is required');
    }

    try {
        const stripe = getStripeClient();
        const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        return event;
    } catch (error) {
        throw new Error('Webhook signature verification failed');
    }
}
