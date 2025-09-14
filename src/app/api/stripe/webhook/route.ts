/**
 * Stripe Webhook Handler for AI Caption Genie
 * Handles webhook events from Stripe (e.g., checkout.session.completed)
 * Follows constitution: user-centric simplicity, privacy-first, minimal processing
 */

import { NextRequest } from 'next/server';
import { verifyWebhookEvent } from '@/lib/stripe';

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
        
        if (!signature) {
            return new Response(
                JSON.stringify({ error: 'Missing webhook signature' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Verify the webhook event signature
        let event;
        try {
            event = verifyWebhookEvent(payload, signature);
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
                // Log successful subscription for MVP
                // In production, this could update user status or send confirmation emails
                console.log('Checkout session completed:', event.data.object.id);
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
