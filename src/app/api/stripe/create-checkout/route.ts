/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe checkout session for subscription plans
 * Following TDD principles and constitution: user-centric, privacy-first, cost-efficient
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CheckoutSessionParams } from '@/lib/stripe';
import { z } from 'zod';

// Request validation schema for type safety and security
const CheckoutRequestSchema = z.object({
    planId: z.string().min(1, 'Plan ID is required'),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional()
});

// Type for validated request body
type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

/**
 * Create a standardized error response
 */
function createErrorResponse(message: string, status: number): NextResponse {
    return new NextResponse(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * Create a standardized success response
 */
function createSuccessResponse(data: any): NextResponse {
    return new NextResponse(
        JSON.stringify(data),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    let requestBody: CheckoutRequest;

    try {
        // Parse and validate request body for security
        const rawBody = await request.json();
        const validation = CheckoutRequestSchema.safeParse(rawBody);

        if (!validation.success) {
            // Format validation errors to match expected test format
            const planIdError = validation.error.errors.find(err => err.path.includes('planId'));
            if (planIdError) {
                return createErrorResponse('planId is required', 400);
            }

            const errorMessage = validation.error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            return createErrorResponse(`Validation error: ${errorMessage}`, 400);
        }

        requestBody = validation.data;

    } catch (jsonError) {
        // Handle malformed JSON with clear error message
        return createErrorResponse('Invalid JSON in request body', 400);
    }

    try {
        // Create checkout session using validated parameters
        const sessionData = await createCheckoutSession({
            planId: requestBody.planId,
            successUrl: requestBody.successUrl,
            cancelUrl: requestBody.cancelUrl
        });

        return createSuccessResponse(sessionData);

    } catch (error) {
        // Handle business logic errors with appropriate HTTP status codes
        if (error instanceof Error) {
            // Invalid plan ID - client error
            if (error.message.includes('Invalid plan')) {
                return createErrorResponse('Invalid plan ID', 400);
            }

            // Missing API credentials - server configuration error  
            if (error.message.includes('Stripe API key') || error.message.includes('key is required')) {
                return createErrorResponse('Payment service unavailable', 500);
            }
        }

        // Generic server error - don't expose internal details for security
        console.error('Checkout session creation failed:', error);
        return createErrorResponse('Internal server error', 500);
    }
}
