/**
 * Test-Driven Development: TypeScript Interfaces Validation
 * This test MUST fail initially and pass after implementing T002
 */
import path from 'path';
import { existsSync } from 'fs';
import type * as Types from '../../src/types';

describe('T002: Essential TypeScript Interfaces', () => {
    const typesPath = path.join(__dirname, '..', '..', 'src', 'types', 'index.ts');

    test('should have types/index.ts file', () => {
        expect(existsSync(typesPath)).toBe(true);
    });

    test('should export Platform enum with required values', async () => {
        const { Platform } = await import('../../src/types');

        expect(Platform).toBeDefined();
        expect(Platform.INSTAGRAM).toBe('instagram');
        expect(Platform.TWITTER).toBe('twitter');
        expect(Platform.FACEBOOK).toBe('facebook');
        expect(Platform.LINKEDIN).toBe('linkedin');
        expect(Platform.TIKTOK).toBe('tiktok');
    });

    test('should export Tone enum with required values', async () => {
        const { Tone } = await import('../../src/types');

        expect(Tone).toBeDefined();
        expect(Tone.PROFESSIONAL).toBe('professional');
        expect(Tone.CASUAL).toBe('casual');
        expect(Tone.HUMOROUS).toBe('humorous');
        expect(Tone.INSPIRATIONAL).toBe('inspirational');
        expect(Tone.PROMOTIONAL).toBe('promotional');
    });

    test('should export CaptionRequest interface with required fields', async () => {
        const types = await import('../../src/types');

        // Test that we can create a valid CaptionRequest object
        const validRequest: Types.CaptionRequest = {
            content: 'Test content',
            platform: types.Platform.INSTAGRAM,
            tone: types.Tone.CASUAL,
            imageDescription: 'Optional image description'
        };

        expect(validRequest.content).toBe('Test content');
        expect(validRequest.platform).toBe('instagram');
        expect(validRequest.tone).toBe('casual');
        expect(validRequest.imageDescription).toBe('Optional image description');
    });

    test('should export CaptionResponse interface with required fields', async () => {
        const types = await import('../../src/types');

        // Test that we can create a valid CaptionResponse object
        const validResponse: Types.CaptionResponse = {
            captions: ['Caption 1', 'Caption 2', 'Caption 3'],
            requestId: 'test-request-id',
            generatedAt: new Date(),
            platform: types.Platform.INSTAGRAM,
            tone: types.Tone.CASUAL
        };

        expect(validResponse.captions).toHaveLength(3);
        expect(validResponse.requestId).toBe('test-request-id');
        expect(validResponse.generatedAt).toBeInstanceOf(Date);
        expect(validResponse.platform).toBe('instagram');
        expect(validResponse.tone).toBe('casual');
    });

    test('should export Caption interface with required fields', async () => {
        const types = await import('../../src/types');

        // Test that we can create a valid Caption object
        const validCaption: Types.Caption = {
            id: 'caption-123',
            text: 'Amazing sunset at the beach! 🌅',
            platform: types.Platform.INSTAGRAM,
            tone: types.Tone.INSPIRATIONAL,
            createdAt: new Date(),
            hashtags: ['#sunset', '#beach', '#nature']
        };

        expect(validCaption.id).toBe('caption-123');
        expect(validCaption.text).toContain('Amazing sunset');
        expect(validCaption.platform).toBe('instagram');
        expect(validCaption.tone).toBe('inspirational');
        expect(validCaption.createdAt).toBeInstanceOf(Date);
        expect(validCaption.hashtags).toContain('#sunset');
    });

    test('should export UsageSession interface with required fields', async () => {
        const types = await import('../../src/types');

        // Test that we can create a valid UsageSession object
        const validSession: Types.UsageSession = {
            sessionId: 'session-123',
            generationsCount: 2,
            dailyLimit: 3,
            lastResetDate: new Date(),
            isPremium: false
        };

        expect(validSession.sessionId).toBe('session-123');
        expect(validSession.generationsCount).toBe(2);
        expect(validSession.dailyLimit).toBe(3);
        expect(validSession.lastResetDate).toBeInstanceOf(Date);
        expect(validSession.isPremium).toBe(false);
    });
});
