/**
 * Essential TypeScript Interfaces for AI Caption Genie
 * Generated following TDD principles for T002
 */

/**
 * Supported social media platforms for caption generation
 */
export enum Platform {
    INSTAGRAM = 'instagram',
    TWITTER = 'twitter',
    FACEBOOK = 'facebook',
    LINKEDIN = 'linkedin',
    TIKTOK = 'tiktok'
}

/**
 * Available tone styles for caption generation
 */
export enum Tone {
    PROFESSIONAL = 'professional',
    CASUAL = 'casual',
    HUMOROUS = 'humorous',
    INSPIRATIONAL = 'inspirational',
    PROMOTIONAL = 'promotional'
}

/**
 * Request payload for caption generation API
 */
export interface CaptionRequest {
    /** The input content/description for caption generation */
    content: string;
    /** Target social media platform */
    platform: Platform;
    /** Desired tone for the captions */
    tone: Tone;
    /** Optional description of uploaded image */
    imageDescription?: string;
}

/**
 * Response payload from caption generation API
 */
export interface CaptionResponse {
    /** Array of generated caption texts */
    captions: string[];
    /** Unique identifier for this generation request */
    requestId: string;
    /** Timestamp when captions were generated */
    generatedAt: Date;
    /** Platform the captions were generated for */
    platform: Platform;
    /** Tone style used for generation */
    tone: Tone;
}

/**
 * Individual caption entity for storage and display
 */
export interface Caption {
    /** Unique identifier for the caption */
    id: string;
    /** The caption text content */
    text: string;
    /** Platform this caption is optimized for */
    platform: Platform;
    /** Tone style of the caption */
    tone: Tone;
    /** When this caption was created */
    createdAt: Date;
    /** Optional hashtags extracted or included */
    hashtags?: string[];
}

/**
 * User session data for rate limiting and usage tracking
 */
export interface UsageSession {
    /** Unique session identifier (localStorage key) */
    sessionId: string;
    /** Number of generations used today */
    generationsCount: number;
    /** Maximum generations allowed per day */
    dailyLimit: number;
    /** Last date when the counter was reset */
    lastResetDate: Date;
    /** Whether user has premium access */
    isPremium: boolean;
}
