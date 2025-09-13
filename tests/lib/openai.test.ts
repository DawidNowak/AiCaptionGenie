/**
 * Test for OpenAI client wrapper
 * Following TDD: This test should FAIL initially before implementation
 */

import { generateCaptions, generateImageCaptions, resetOpenAIClient } from '@/lib/openai';
import { Platform, Tone } from '@/types';

// Mock the OpenAI module
const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }))
}));

describe('OpenAI Client Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.OPENAI_API_KEY = 'mock-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateCaptions', () => {
    it('should generate captions for text input', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Amazing sunset vibes! 🌅 #sunset #nature #peaceful",
              "Nature's daily masterpiece never gets old ✨ #sunsetlover #golden",
              "Ending the day with gratitude 🙏 #blessed #nature #peace"
            ])
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCaptions({
        content: 'Beautiful sunset over the mountains',
        platform: Platform.INSTAGRAM,
        tone: Tone.INSPIRATIONAL
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toContain('sunset');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('social media caption generator')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Beautiful sunset over the mountains')
          })
        ]),
        temperature: 0.8,
        max_tokens: 1000
      });
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API key invalid'));

      await expect(generateCaptions({
        content: 'Test content',
        platform: Platform.TWITTER,
        tone: Tone.CASUAL
      })).rejects.toThrow('Failed to generate captions');
    });
  });

  describe('generateImageCaptions', () => {
    it('should generate captions for image with vision API', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Stunning beach day! 🏖️ Perfect waves and blue skies #beachlife",
              "Paradise found! 🌊 Living my best life by the ocean #vacation",
              "Beach therapy is the best therapy 🌴 #relax #ocean #peace"
            ])
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateImageCaptions({
        content: 'Beach vacation photo',
        platform: Platform.INSTAGRAM,
        tone: Tone.CASUAL,
        imageDescription: 'A beautiful beach with clear blue water',
        imageUrl: 'https://example.com/beach.jpg'
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toContain('beach');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'text' }),
              expect.objectContaining({ type: 'image_url' })
            ])
          })
        ]),
        temperature: 0.8,
        max_tokens: 1000
      });
    });
  });

  describe('client initialization', () => {
    it('should throw error when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      resetOpenAIClient(); // Reset the client to force re-initialization

      await expect(generateCaptions({
        content: 'Test content',
        platform: Platform.TWITTER,
        tone: Tone.CASUAL
      })).rejects.toThrow('OpenAI API key is not configured');
    });
  });
});
