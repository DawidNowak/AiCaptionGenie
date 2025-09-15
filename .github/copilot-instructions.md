# GitHub Copilot Instructions: AI Caption Genie MVP

## Project Overview

AI Caption Genie is a Next.js 14 web application that generates social media captions using OpenAI APIs. Users input text or upload media, select platform and tone, then receive 5-10 optimized captions with emojis, CTAs, and hashtags.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4
- **AI**: OpenAI GPT-4o-mini + Vision API
- **Payments**: Stripe
- **Deployment**: Vercel
- **Testing**: Jest + React Testing Library + Playwright

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── components/     # React components
│   ├── lib/            # Utility libraries
│   └── types/          # TypeScript definitions
```

## Coding Standards

### TypeScript

- Use strict mode with proper type definitions
- Define interfaces for all data structures
- Use enums for constants (Platform, Tone)
- No `any` types - use proper typing

### React Components

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for expensive components
- Follow single responsibility principle

### API Routes

- Validate all inputs with Zod schemas
- Return consistent error response format
- Implement proper HTTP status codes
- Use middleware for common functionality

### File Organization

- One component per file
- Co-locate tests with components
- Use barrel exports from directories
- Keep utility functions in /lib
- **Import Standards**: Use '@/' alias for all internal imports
  - Consistent across all components, tests, and API routes
  - Mapped to 'src/' directory in tsconfig.json
  - Example: `import { Platform } from '@/types'`
  - Never use relative imports like `../../src/types`

## Key Features to Implement

### Caption Generation (/api/generate)

- Accept text input or file upload
- Validate platform and tone parameters
- Call OpenAI API with optimized prompts
- Return 5-10 formatted captions
- Track usage for rate limiting

### File Upload (/api/upload)

- Support JPEG, PNG, GIF
- Validate file size (max 10MB)
- Process images with Vision API
- Handle errors gracefully

### Rate Limiting

- Use localStorage for anonymous tracking
- Reset daily at midnight UTC
- Display upgrade messages at limit
- Implement client-side validation

### Payment Integration

- Stripe Checkout for subscriptions
- Webhook handling for confirmations
- Update user status after payment
- Handle failed payments gracefully

## Code Patterns

### Error Handling

```typescript
try {
  // API call
} catch (error) {
  if (error instanceof OpenAIError) {
    return Response.json({ error: "AI service unavailable" }, { status: 503 });
  }
  return Response.json({ error: "Internal error" }, { status: 500 });
}
```

### API Response Format

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}
```

### Component Props

```typescript
interface ComponentProps {
  onSuccess: (data: CaptionResponse) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}
```

## Testing Requirements

### Test-Driven Development

1. Write failing test first
2. Implement minimal code to pass
3. Refactor while keeping tests green
4. Never implement without failing test

### Test Categories

- **Unit**: Individual functions and components
- **Integration**: API routes and database interactions
- **E2E**: Complete user workflows
- **Contract**: API schema validation

### Test Files

- Component tests: `ComponentName.test.tsx`
- API tests: `route.test.ts`
- E2E tests: `feature.spec.ts`
- Contract tests: `endpoint.contract.test.ts`

### Jest Environment Compatibility

For Next.js API route testing, use these patterns:

```typescript
// NextResponse constructor pattern (not NextResponse.json)
function createErrorResponse(message: string, status: number): NextResponse {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Mock NextRequest with proper FormData handling
const request = {
  formData: jest.fn().mockResolvedValue(formData),
  headers: { get: jest.fn().mockReturnValue("test-value") },
} as unknown as NextRequest;
```

## Performance Guidelines

### Client-Side

- Use Next.js Image component for optimizations
- Implement lazy loading for non-critical components
- Debounce form inputs and file uploads
- Cache static data in localStorage

### Server-Side

- Stream file uploads for large files
- Optimize OpenAI prompts for token efficiency
- Implement request deduplication
- Use efficient JSON serialization

### Bundle Optimization

- Enable Tailwind CSS purging
- Use dynamic imports for heavy libraries
- Minimize client-side JavaScript
- Optimize images and assets

## Security Considerations

### API Keys

- Never expose OpenAI/Stripe keys to client
- Use environment variables for secrets
- Validate webhook signatures
- Implement rate limiting on API routes

### File Uploads

- Validate MIME types server-side
- Sanitize file names
- Limit file sizes strictly
- Scan for malicious content

### Data Privacy

- No permanent user data storage for MVP
- Use client-side storage for preferences
- Implement proper error logging
- Follow data minimization principles

## Recent Changes

- Added TypeScript strict mode configuration
- Implemented OpenAI Vision API integration
- Created Stripe webhook handling with T016 checkout endpoint
- Set up Tailwind CSS responsive design
- **Standardized import patterns**: All files now use '@/' alias consistently
- **Enhanced Jest compatibility**: Added NextResponse constructor patterns for test environment
- **Improved FormData handling**: Custom polyfill for Node.js test environment
- **Fixed API route testing**: All contract tests now use compatible request mocking

## Development Workflow

1. Create failing test for new feature
2. Implement minimal code to pass test
3. Add error handling and validation
4. Update documentation and types
5. Test manually in browser
6. Deploy to Vercel staging

## Common Pitfalls to Avoid

- Don't implement before writing tests
- Don't expose API keys to client-side
- Don't skip input validation
- Don't ignore error handling
- Don't over-engineer for MVP scope

## Helpful Context

- Focus on MVP simplicity over feature completeness
- Prioritize user experience and performance
- Keep $10/month OpenAI budget in mind
- Design for mobile-first responsive layout
- Plan for future scalability without over-engineering
