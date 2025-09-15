/**
 * POST /api/upload - File Upload API Endpoint
 * Validates files using T004 utility, processes with Vision API (T003)
 * and integrates with caption generation (T007)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFile } from '@/lib/file-validation';
import { generateImageCaptions } from '@/lib/openai';
import { Platform, Tone, CaptionRequest, CaptionResponse } from '@/types';
import { z } from 'zod';

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
import { randomUUID } from 'crypto';

// Validation schema for file upload request
const UploadRequestSchema = z.object({
    file: z.any().refine((file) => file instanceof File, {
        message: 'File is required'
    }),
    platform: z.nativeEnum(Platform, {
        errorMap: () => ({ message: 'Platform must be one of: instagram, twitter, facebook, linkedin, tiktok' })
    }),
    tone: z.nativeEnum(Tone, {
        errorMap: () => ({ message: 'Tone must be one of: professional, casual, humorous, inspirational, promotional' })
    })
});

/**
 * Convert File to base64 data URL for Vision API
 */
async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Parse FormData from request
        const formData = await request.formData();

        // Extract and validate form data using Zod
        const file = formData.get('file') as File;
        const platform = formData.get('platform') as string;
        const tone = formData.get('tone') as string;

        // Validate using Zod schema
        const validationResult = UploadRequestSchema.safeParse({
            file,
            platform,
            tone
        });

        if (!validationResult.success) {
            // Return the first error message from Zod validation
            const firstError = validationResult.error.errors[0];
            return createErrorResponse(firstError.message, 400);
        }

        // Validate file using T004 utility (for size and format)
        const fileValidationResult = validateFile(file);
        if (!fileValidationResult.isValid) {
            return createErrorResponse(fileValidationResult.error!, 400);
        }

        // Create caption request object
        const captionRequest: CaptionRequest = {
            content: `Uploaded ${fileValidationResult.fileType} file: ${file.name}`,
            platform: platform as Platform,
            tone: tone as Tone
        };

        // Generate captions using Vision API integration
        // Convert file to base64 for Vision API
        const imageUrl = await fileToBase64(file);

        // Call the generateImageCaptions function with imageUrl
        const captions = await generateImageCaptions({
            ...captionRequest,
            imageUrl
        });

        // Create response object matching expected format from types
        const response: CaptionResponse = {
            captions,
            requestId: randomUUID(),
            generatedAt: new Date(),
            platform: captionRequest.platform,
            tone: captionRequest.tone
        };

        // Add metadata for test expectations (will extend interface later if needed)
        const responseWithMetadata = {
            ...response,
            metadata: {
                platform: captionRequest.platform,
                tone: captionRequest.tone,
                contentType: fileValidationResult.fileType,
                totalCaptions: captions.length,
                userAgent: request.headers.get('user-agent') || undefined
            }
        };

        return createSuccessResponse(responseWithMetadata);

    } catch (error) {
        console.error('Upload API error:', error);

        // Handle OpenAI-specific errors
        if (error instanceof Error) {
            if (error.message.includes('rate limit') || error.message.includes('quota')) {
                return createErrorResponse(
                    'AI service temporarily unavailable. Please try again later.',
                    503
                );
            }

            if (error.message === 'OpenAI API key is not configured') {
                return createErrorResponse('Service configuration error', 500);
            }
        }

        // Generic server error for unknown issues
        return createErrorResponse('Internal server error', 500);
    }
}
