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
 * Generate social media captions for text content
 */
export async function generateCaptions(request: CaptionRequest): Promise<string[]> {
  try {
    const client = getOpenAIClient();
    
    const systemPrompt = `You are a social media caption generator. Generate 5-10 engaging captions for ${request.platform} in a ${request.tone} tone. 

Guidelines:
- Include relevant emojis and hashtags
- Keep within platform character limits
- Make captions engaging and shareable
- Include call-to-action when appropriate
- Return as a JSON array of strings

Platform-specific requirements:
- Instagram: Up to 2,200 characters, use hashtags
- Twitter: Up to 280 characters, concise
- Facebook: Conversational, up to 2,000 characters
- LinkedIn: Professional, up to 3,000 characters
- TikTok: Fun, trendy, up to 2,200 characters`;

    const userPrompt = `Generate captions for: "${request.content}"${
      request.imageDescription ? `\nImage description: ${request.imageDescription}` : ''
    }`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    try {
      const captions = JSON.parse(content);
      if (!Array.isArray(captions)) {
        throw new Error('Invalid response format');
      }
      return captions;
    } catch (parseError) {
      // Fallback: split by newlines if JSON parsing fails
      return content.split('\n').filter(line => line.trim().length > 0);
    }
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
    
    const systemPrompt = `You are a social media caption generator. Analyze the image and generate 5-10 engaging captions for ${request.platform} in a ${request.tone} tone.

Guidelines:
- Describe what you see in the image
- Include relevant emojis and hashtags
- Keep within platform character limits
- Make captions engaging and shareable
- Include call-to-action when appropriate
- Return as a JSON array of strings`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Generate captions for: "${request.content}"${
          request.imageDescription ? `\nContext: ${request.imageDescription}` : ''
        }`
      }
    ];

    // Add image URL if provided
    if (request.imageUrl) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: request.imageUrl
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
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    try {
      const captions = JSON.parse(content);
      if (!Array.isArray(captions)) {
        throw new Error('Invalid response format');
      }
      return captions;
    } catch (parseError) {
      // Fallback: split by newlines if JSON parsing fails
      return content.split('\n').filter(line => line.trim().length > 0);
    }
  } catch (error) {
    // Re-throw API key configuration errors
    if (error instanceof Error && error.message === 'OpenAI API key is not configured') {
      throw error;
    }
    console.error('OpenAI image caption generation error:', error);
    throw new Error('Failed to generate captions');
  }
}
