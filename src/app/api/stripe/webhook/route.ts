/**
 * Stripe Webhook Handler for AI Caption Genie
 * Handles webhook events from Stripe (e.g., checkout.session.completed)
 * Follows constitution: user-centric simplicity, privacy-first, minimal processing
 */

import { NextRequest } from 'next/server';
import { verifyWebhookEvent } from '@/lib/stripe';
import { z } from 'zod';

// Validation schema for webhook request
const WebhookRequestSchema = z.object({
    payload: z.string().min(1, 'Webhook payload is required'),
    signature: z.string({
        required_error: 'Missing webhook signature'
    }).min(1, 'Missing webhook signature')
});

/**
 * POST handler for Stripe webhook events
 * Verifies signature and processes payment confirmations
 */
export async function POST(request: NextRequest) {
    try {
        // Get the webhook payload as text
        const payload = await request.text();

        // Get the Stripe signature from headers
        const signature = request.headers.get('stripe-signature');

        // Handle missing signature explicitly before Zod validation
        if (!signature) {
            return new Response(
                JSON.stringify({ error: 'Missing webhook signature' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Validate using Zod schema for consistency  
        const validation = WebhookRequestSchema.safeParse({
            payload,
            signature
        });

        if (!validation.success) {
            // Return the first error message from Zod validation
            const firstError = validation.error.errors[0];
            return new Response(
                JSON.stringify({ error: firstError.message }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Verify the webhook event signature
        let event;
        try {
            event = verifyWebhookEvent(validation.data.payload, validation.data.signature);
        } catch (error) {
            // Check if it's a signature verification error vs unexpected error
            if (error instanceof Error && error.message === 'Webhook signature verification failed') {
                return new Response(
                    JSON.stringify({ error: 'Invalid webhook signature' }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            // Re-throw unexpected errors to be handled by outer catch block
            throw error;
        }

        // Process the webhook event based on type
        switch (event.type) {
            case 'checkout.session.completed':
                // Log successful subscription for analytics
                const session = event.data.object as any;
                console.log('Checkout session completed:', {
                    sessionId: session.id,
                    customerId: session.customer,
                    subscriptionId: session.subscription,
                    mode: session.mode,
                    paymentStatus: session.payment_status
                });

                // In a production system with user accounts, this would:
                // - Update user subscription status
                // - Send confirmation email
                // - Trigger analytics events
                // 
                // For our anonymous MVP, the client-side success page
                // handles premium activation via localStorage
                break;

            case 'customer.subscription.deleted':
                // Log subscription cancellation
                const subscription = event.data.object as any;
                console.log('Subscription cancelled:', {
                    subscriptionId: subscription.id,
                    customerId: subscription.customer,
                    canceledAt: subscription.canceled_at
                });
                break;

            default:
                // Log other events but don't process them for MVP
                console.log('Received webhook event:', event.type);
                break;
        }

        // Return success response
        return new Response(
            JSON.stringify({
                received: true,
                eventType: event.type
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        // Handle unexpected errors
        console.error('Webhook processing error:', error);

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
