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

  describe('JSON extraction from markdown responses', () => {
    it('should extract JSON from markdown code blocks', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: `Here are some humorous Facebook captions for the birthday image:

\`\`\`json
[
  "🎉🎂 It's a paw-some party! Who's ready to fetch some cake? 🍰🐾 #HappyBirthday #PawtyTime",
  "When your best friend turns 9 and still acts like a puppy! 🎈🐶 #AgingLikeFineWine #DogDays",
  "9 years of belly rubs and wagging tails! 🐕💖 Let's celebrate with treats! 🎊 #BirthdayBark"
]
\`\`\``
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCaptions({
        content: 'Dog birthday party',
        platform: Platform.FACEBOOK,
        tone: Tone.HUMOROUS
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toContain('paw-some');
      expect(result[1]).toContain('puppy');
      expect(result[2]).toContain('belly rubs');
      // Should not contain markdown or explanatory text
      expect(result[0]).not.toContain('```');
      expect(result[0]).not.toContain('Here are');
    });

    it('should extract JSON without code blocks', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Amazing sunset vibes! 🌅 #sunset #nature #peaceful",
              "Nature's daily masterpiece ✨ #sunsetlover #golden",
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
    });
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
        messages: [
          {
            role: 'system',
            content: 'You must return ONLY a JSON array of 5-10 instagram captions. inspirational tone. Include emojis, CTAs, hashtags. No explanations, no markdown, just pure JSON array.'
          },
          {
            role: 'user',
            content: 'Content: "Beautiful sunset over the mountains"'
          }
        ],
        temperature: 0.8,
        max_tokens: 500
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
        messages: [
          {
            role: 'system',
            content: 'You must return ONLY a JSON array of 5-10 instagram captions for the image. casual tone. Include emojis, CTAs, hashtags. No explanations, no markdown, just pure JSON array.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Content: "Beach vacation photo" Context: A beautiful beach with clear blue water'
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'https://example.com/beach.jpg',
                  detail: 'low'
                }
              }
            ]
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });
    });
  });

  describe('prompt optimization and token efficiency', () => {
    it('should use concise prompts within 100-200 token budget for text captions', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Great sunset! 🌅 Share your favorite time of day! #sunset #nature",
              "Golden hour magic ✨ Tag a friend who loves sunsets! #goldenhour",
              "Nature's daily show 🌇 What's your perfect evening? #peaceful"
            ])
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCaptions({
        content: 'Beautiful sunset',
        platform: Platform.INSTAGRAM,
        tone: Tone.CASUAL
      });

      // Check that the system prompt is concise (under 150 tokens approx)
      const calls = mockCreate.mock.calls[0];
      const systemPrompt = calls[0].messages[0].content;
      const userPrompt = calls[0].messages[1].content;

      // Rough token estimation: ~4 chars per token
      const systemTokens = systemPrompt.length / 4;
      const userTokens = userPrompt.length / 4;
      const totalTokens = systemTokens + userTokens;

      expect(totalTokens).toBeLessThan(200); // Should be under 200 tokens
      expect(systemTokens).toBeLessThan(150); // System prompt should be concise

      // Should use structured JSON format request
      expect(systemPrompt).toContain('JSON');
      expect(systemPrompt).toContain('5-10');
    });

    it('should use concise prompts for image captions within token budget', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Beach vibes! 🏖️ What's your dream vacation? #beach #vacation",
              "Ocean therapy ✨ Tag someone you'd bring here! #ocean #relax",
              "Paradise found 🌊 Share your favorite beach memory! #paradise"
            ])
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateImageCaptions({
        content: 'Beach photo',
        platform: Platform.INSTAGRAM,
        tone: Tone.CASUAL,
        imageUrl: 'data:image/jpeg;base64,test'
      });

      // Check prompt efficiency
      const calls = mockCreate.mock.calls[0];
      const systemPrompt = calls[0].messages[0].content;
      const userPrompt = calls[0].messages[1].content;

      // For image prompts, system should be even more concise
      const systemTokens = systemPrompt.length / 4;
      expect(systemTokens).toBeLessThan(100); // More concise for images

      // Should request structured output
      expect(systemPrompt).toContain('JSON');
      expect(systemPrompt).toContain('5-10');
    });

    it('should generate quality captions with emojis, CTAs, and hashtags', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              "Sunset magic! 🌅 What's your favorite golden hour spot? #sunset #nature #goldenhour",
              "Nature's daily masterpiece ✨ Tag someone who loves sunsets! #peaceful #evening",
              "End your day with gratitude 🙏 Share what you're thankful for! #blessed #mindful"
            ])
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCaptions({
        content: 'Sunset photo',
        platform: Platform.INSTAGRAM,
        tone: Tone.INSPIRATIONAL
      });

      // Validate quality requirements
      result.forEach(caption => {
        expect(caption).toMatch(/[🌅🌇✨🙏🌊]/); // Should contain emojis
        expect(caption).toMatch(/[?!]/); // Should have CTA punctuation
        expect(caption).toMatch(/#\w+/); // Should contain hashtags
        expect(caption.length).toBeGreaterThan(20); // Minimum quality length
        expect(caption.length).toBeLessThan(280); // Platform appropriate
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
