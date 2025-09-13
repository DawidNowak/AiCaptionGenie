# Data Model: AI Caption Genie MVP

**Date**: September 13, 2025  
**Feature**: AI Caption Genie MVP  
**Source**: Extracted from feature specification and technical requirements

## Core Entities

### CaptionRequest

Represents a single caption generation request from a user.

**Fields**:

- `id`: string (UUID) - Unique identifier for the request
- `inputType`: 'text' | 'image' | 'video' - Type of input provided
- `content`: string - Text description or base64 encoded file data
- `fileName?`: string - Original filename for uploaded files
- `fileSize?`: number - File size in bytes (for validation)
- `fileMimeType?`: string - MIME type of uploaded file
- `platform`: 'instagram' | 'tiktok' | 'linkedin' - Target social media platform
- `tone`: 'casual' | 'professional' | 'humorous' - Desired caption tone
- `timestamp`: string - ISO UTC timestamp of request
- `userId?`: string - Optional user identifier (null for anonymous MVP)

**Validation Rules**:

- `content` required, min 1 character for text, valid base64 for files
- `platform` must be one of supported platforms
- `tone` must be one of supported tones
- `fileSize` must be ≤ 10MB (10,485,760 bytes) if provided
- `fileMimeType` must be in allowed list if provided

**State Transitions**:

1. Created → Processing → Completed | Failed

### CaptionResponse

Represents the generated captions returned to the user.

**Fields**:

- `requestId`: string - References the originating CaptionRequest
- `captions`: Caption[] - Array of generated captions (5-10 items)
- `processingTime`: number - Time taken to generate in milliseconds
- `tokensUsed`: number - OpenAI tokens consumed for cost tracking
- `timestamp`: string - ISO UTC timestamp of response
- `status`: 'success' | 'error' - Generation result status
- `errorMessage?`: string - Error details if status is 'error'

**Validation Rules**:

- `captions` array must contain 5-10 items for successful responses
- `processingTime` must be positive number
- `tokensUsed` must be non-negative number
- `errorMessage` required when status is 'error'

### Caption

Individual generated caption with all required elements.

**Fields**:

- `id`: string - Unique identifier within the response
- `text`: string - The complete caption text including emojis
- `callToAction`: string - Extracted CTA phrase
- `hashtags`: string[] - Array of hashtags (3-5 items)
- `platform`: string - Platform this caption is optimized for
- `tone`: string - Tone used for this caption
- `emojiCount`: number - Number of emojis included
- `characterCount`: number - Total character count for platform limits

**Validation Rules**:

- `text` required, max length varies by platform (Instagram: 2200, TikTok: 2200, LinkedIn: 3000)
- `callToAction` must be present in the text
- `hashtags` array must contain 3-5 items
- `emojiCount` must be ≥ 1
- `characterCount` must match actual text length

**Platform-Specific Rules**:

- Instagram: Focus on visual storytelling, lifestyle hashtags
- TikTok: Trending hashtags, casual tone emphasis, video-focused CTAs
- LinkedIn: Professional language, industry hashtags, business CTAs

### UsageSession

Tracks anonymous user activity for rate limiting without user accounts.

**Fields**:

- `sessionId`: string - Browser/device identifier (generated client-side)
- `generationCount`: number - Number of generations used today
- `lastReset`: string - ISO UTC timestamp of last daily reset
- `generations`: GenerationEntry[] - History of today's generations
- `totalGenerations`: number - Lifetime generation count for analytics

**Validation Rules**:

- `generationCount` must be between 0-3 for free users
- `lastReset` must be valid ISO UTC timestamp
- `generations` array length must equal `generationCount`

### GenerationEntry

Individual generation within a usage session.

**Fields**:

- `timestamp`: string - ISO UTC timestamp
- `platform`: string - Platform selected
- `tone`: string - Tone selected
- `inputType`: string - Type of input used
- `success`: boolean - Whether generation succeeded
- `tokensUsed?`: number - Tokens consumed (if successful)

### PlatformConfiguration

Configuration rules for each supported platform.

**Fields**:

- `platform`: 'instagram' | 'tiktok' | 'linkedin'
- `characterLimit`: number - Maximum caption length
- `preferredHashtagCount`: number - Optimal number of hashtags
- `toneGuidelines`: Record<string, string> - Tone-specific guidance
- `commonCTAs`: string[] - Platform-appropriate call-to-actions
- `hashtagCategories`: string[] - Common hashtag types for platform

**Static Configuration**:

```typescript
const PLATFORM_CONFIGS: PlatformConfiguration[] = [
  {
    platform: "instagram",
    characterLimit: 2200,
    preferredHashtagCount: 5,
    toneGuidelines: {
      casual: "Friendly, approachable, lifestyle-focused",
      professional: "Polished but authentic, brand-focused",
      humorous: "Playful, trendy, relatable",
    },
    commonCTAs: [
      "Double tap if you agree!",
      "Comment below!",
      "Tag a friend!",
      "Save this post!",
    ],
    hashtagCategories: ["lifestyle", "brand", "location", "trending", "niche"],
  },
  {
    platform: "tiktok",
    characterLimit: 2200,
    preferredHashtagCount: 4,
    toneGuidelines: {
      casual: "Fun, energetic, trend-aware",
      professional: "Informative but engaging, educational",
      humorous: "Viral-worthy, meme-conscious, entertaining",
    },
    commonCTAs: [
      "Duet this!",
      "Use this sound!",
      "Tell me in the comments!",
      "Follow for more!",
    ],
    hashtagCategories: ["trending", "fyp", "viral", "challenge", "educational"],
  },
  {
    platform: "linkedin",
    characterLimit: 3000,
    preferredHashtagCount: 3,
    toneGuidelines: {
      casual: "Professional but personable, story-driven",
      professional: "Expert, authoritative, industry-focused",
      humorous: "Witty, sophisticated, workplace-appropriate",
    },
    commonCTAs: [
      "Share your thoughts!",
      "Connect with me!",
      "What's your experience?",
      "Follow for insights!",
    ],
    hashtagCategories: [
      "industry",
      "skills",
      "networking",
      "career",
      "business",
    ],
  },
];
```

### FileValidation

Validation rules and constraints for file uploads.

**Fields**:

- `maxSize`: number - Maximum file size in bytes (10MB)
- `allowedImageTypes`: string[] - Supported image MIME types
- `allowedVideoTypes`: string[] - Supported video MIME types
- `allowedExtensions`: string[] - Supported file extensions

**Static Configuration**:

```typescript
const FILE_VALIDATION: FileValidation = {
  maxSize: 10485760, // 10MB in bytes
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif"],
  allowedVideoTypes: ["video/mp4", "video/quicktime"], // .mov
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov"],
};
```

## Data Flow Patterns

### Caption Generation Flow

1. User submits CaptionRequest
2. Validate request data and file constraints
3. Process input (text analysis or file upload to OpenAI)
4. Generate captions using OpenAI API
5. Format response according to platform rules
6. Return CaptionResponse with generated captions
7. Update UsageSession with new generation

### Rate Limiting Flow

1. Check UsageSession for current day's usage
2. If count >= 3, return rate limit error
3. If last reset > 24 hours ago, reset counter
4. Allow generation and increment counter
5. Store updated session in localStorage

### File Upload Flow

1. Validate file on client-side (type, size)
2. Convert to base64 or FormData for transmission
3. Validate again on server-side
4. Process with OpenAI Vision API (images only)
5. Generate captions based on visual analysis
6. Clean up temporary files

## Error Handling Patterns

### Validation Errors

- Invalid file format: Return 400 with user-friendly message
- File too large: Return 413 with size limit information
- Missing required fields: Return 422 with field details
- Invalid enum values: Return 400 with allowed values

### Rate Limiting Errors

- Daily limit exceeded: Return 429 with upgrade message
- Invalid session data: Reset session and allow generation

### External API Errors

- OpenAI rate limit: Return 503 with retry message
- OpenAI API error: Return 500 with generic error message
- Network timeout: Return 504 with retry suggestion

### Client-Side Error Recovery

- localStorage unavailable: Fall back to session-based tracking
- Network errors: Show retry button with exponential backoff
- File processing errors: Clear file input and show error message

## Performance Considerations

### Client-Side Optimization

- Debounce file validation to prevent excessive checks
- Lazy load caption display for better perceived performance
- Cache platform configurations to reduce re-computation
- Compress uploaded images before sending to reduce bandwidth

### Server-Side Optimization

- Stream file uploads to handle large files efficiently
- Implement request deduplication for rapid successive calls
- Use efficient JSON serialization for API responses
- Monitor and log performance metrics for optimization

### OpenAI API Optimization

- Craft efficient prompts to minimize token usage
- Batch multiple captions in single API call when possible
- Implement exponential backoff for rate limit handling
- Cache common responses (future enhancement)

## Analytics & Monitoring

### Usage Metrics

- Total generations per day/week/month
- Platform distribution (Instagram vs TikTok vs LinkedIn)
- Tone preferences analysis
- Success/failure rates
- Average processing times

### Performance Metrics

- API response times
- File upload success rates
- Error rates by type
- Token usage and cost tracking
- User engagement patterns

### Business Metrics

- Free vs paid usage patterns
- Conversion funnel analysis
- Daily/monthly active users
- Feature adoption rates
- Customer satisfaction indicators

This data model provides a complete foundation for the AI Caption Genie MVP while maintaining simplicity and supporting future scalability requirements.
