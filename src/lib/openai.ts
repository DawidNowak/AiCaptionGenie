/**
 * OpenAI Client Wrapper for AI Caption Genie
 * Handles GPT-4o-mini for text and Vision API for images
 */

import OpenAI from 'openai';
import { CaptionRequest } from '@/types';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Export function to reset client (useful for testing)
export function resetOpenAIClient(): void {
  openaiClient = null;
}

/**
 * Extract JSON array from response that might contain markdown or explanatory text
 */
function extractJSONArray(content: string): string[] {
  try {
    // First try parsing as direct JSON
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Continue to extraction methods
  }

  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to other methods
    }
  }

  // Try to find JSON array pattern in the text
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to fallback
    }
  }

  // Fallback: split by newlines and filter
  return content.split('\n')
    .filter(line => line.trim().length > 0)
    .filter(line => !line.includes('```'))
    .filter(line => !line.toLowerCase().includes('here are'))
    .filter(line => !line.toLowerCase().includes('caption'))
    .slice(0, 10); // Limit to 10 captions max
}

/**
 * Generate social media captions for text content
 */
export async function generateCaptions(request: CaptionRequest): Promise<string[]> {
  try {
    const client = getOpenAIClient();

    // More explicit system prompt that demands only JSON output
    const systemPrompt = `You must return ONLY a JSON array of 5-10 ${request.platform} captions. ${request.tone} tone. Include emojis, CTAs, hashtags. No explanations, no markdown, just pure JSON array.`;

    // Concise user prompt
    const userPrompt = `Content: "${request.content}"${request.imageDescription ? ` Image: ${request.imageDescription}` : ''
      }`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 500 // Increased to prevent truncation
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Use improved JSON extraction
    const captions = extractJSONArray(content);

    if (captions.length === 0) {
      throw new Error('No valid captions extracted');
    }

    return captions;
  } catch (error) {
    // Re-throw API key configuration errors
    if (error instanceof Error && error.message === 'OpenAI API key is not configured') {
      throw error;
    }
    console.error('OpenAI caption generation error:', error);
    throw new Error('Failed to generate captions');
  }
}

/**
 * Generate social media captions for image content using Vision API
 */
export async function generateImageCaptions(request: CaptionRequest & { imageUrl?: string }): Promise<string[]> {
  try {
    const client = getOpenAIClient();

    // More explicit system prompt for Vision API
    const systemPrompt = `You must return ONLY a JSON array of 5-10 ${request.platform} captions for the image. ${request.tone} tone. Include emojis, CTAs, hashtags. No explanations, no markdown, just pure JSON array.`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Content: "${request.content}"${request.imageDescription ? ` Context: ${request.imageDescription}` : ''
          }`
      }
    ];

    // Add image URL if provided
    if (request.imageUrl) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: request.imageUrl,
          detail: 'low' // Use low detail for cost efficiency
        }
      });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.8,
      max_tokens: 500 // Increased to prevent truncation
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Use improved JSON extraction
    const captions = extractJSONArray(content);

    if (captions.length === 0) {
      throw new Error('No valid captions extracted');
    }

    return captions;
  } catch (error) {
    // Re-throw API key configuration errors
    if (error instanceof Error && error.message === 'OpenAI API key is not configured') {
      throw error;
    }
    console.error('OpenAI image caption generation error:', error);
    throw new Error('Failed to generate captions');
  }
}
