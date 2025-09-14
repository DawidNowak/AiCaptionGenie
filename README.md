# 🌱 AI Caption Genie

> **Built using Spec-Driven Development with [GitHub Spec Kit](https://github.com/github/spec-kit)**

AI Caption Genie is a Next.js web application that generates engaging social media captions using OpenAI APIs. This project demonstrates the power of **Spec-Driven Development** methodology, where specifications drive implementation rather than code driving specifications.

## 🤔 What is Spec-Driven Development?

This project is developed using the [GitHub Spec Kit](https://github.com/github/spec-kit) approach, which flips the script on traditional software development. Instead of writing code first and documentation second, **Spec-Driven Development** makes specifications executable and directly generates working implementations.

**Key principles applied in this project:**

- **Intent-driven development** - specifications define the "what" before the "how"
- **Rich specification creation** using guardrails and organizational principles
- **Multi-step refinement** rather than one-shot code generation from prompts
- **Heavy reliance on advanced AI model capabilities** for specification interpretation

## 📱 What AI Caption Genie Does

AI Caption Genie helps social media content creators, marketers, and small business owners generate engaging captions for their posts across platforms like Instagram, TikTok, and LinkedIn.

### ✨ Key Features

- **Text or Media Input**: Describe your post theme or upload images/videos
- **Platform-Specific**: Optimized captions for Instagram, TikTok, LinkedIn
- **Tone Selection**: Choose from casual, professional, humorous, and more
- **Rich Output**: 5-10 unique captions with emojis, CTAs, and hashtags
- **One-Click Copy**: Copy captions instantly or download as text file
- **Rate Limiting**: 3 free generations per day (MVP phase)

### 🎯 Target Users

- **Social Media Content Creators** - Save 20+ minutes of brainstorming time
- **Digital Marketers** - Generate consistent, engaging content at scale
- **Small Business Owners** - Professional captions without hiring copywriters

## 🏗️ Spec-Driven Development Process

This project follows the systematic Spec Kit methodology:

### 1. **Specification Phase** (`/specs/001-develop-ai-caption/`)

- **spec.md** - Complete feature specification with user scenarios
- **data-model.md** - Entity relationships and data structures
- **research.md** - Technology and market research
- **contracts/api-spec.yaml** - API contract definitions

### 2. **Planning Phase**

- **plan.md** - Technical implementation strategy
- **tasks.md** - Actionable development tasks

### 3. **Implementation Phase**

- Test-driven development with comprehensive test coverage
- Type-safe TypeScript implementation
- Component-based React architecture

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+ (strict mode)
- **Styling**: Tailwind CSS 3.4
- **AI**: OpenAI GPT-4o-mini + Vision API
- **Payments**: Stripe (planned)
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DawidNowak/AiCaptionGenie.git
cd AiCaptionGenie
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Add your OpenAI API key to .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Testing

This project follows test-driven development principles with comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

### Test Coverage

- **Unit Tests**: Components, utilities, and API routes
- **Integration Tests**: API endpoints and data flow
- **Contract Tests**: API schema validation with proper mocking
- **E2E Tests**: Complete user workflows

### Testing Infrastructure

The project includes specialized testing setup for Next.js API routes:

- **whatwg-fetch polyfill**: Enables proper Request/Response handling in Jest environment
- **Custom Jest setup**: Configured for Next.js server-side API testing
- **Mock strategies**: Comprehensive mocking for external services (OpenAI, Stripe)
- **TDD approach**: All tests written before implementation (red-green-refactor)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (/generate, /upload, /stripe)
│   ├── components/     # React components
│   ├── lib/            # Utility libraries (OpenAI, Stripe, validation)
│   └── types/          # TypeScript definitions
specs/
├── 001-develop-ai-caption/  # Spec-Driven Development files
│   ├── spec.md         # Feature specification
│   ├── plan.md         # Technical implementation plan
│   ├── tasks.md        # Development tasks
│   └── contracts/      # API contracts
tests/                   # Comprehensive test suite
│   ├── api/            # Contract tests for API routes
│   ├── components/     # Component unit tests
│   └── setup/          # Test configuration and utilities
jest.config.js          # Jest configuration for Next.js
jest.setup.js           # Custom test environment setup (includes whatwg-fetch)
```

## 🎯 Development Principles

### Spec-Driven Approach

1. **Specification First** - Features begin with detailed specs, not code
2. **Test-Driven Implementation** - Tests written before code implementation
3. **Contract-Based APIs** - All endpoints follow OpenAPI specifications
4. **Type Safety** - Strict TypeScript with no `any` types

### Code Quality

- **Single Responsibility** - Each component has one clear purpose
- **Error Boundaries** - Comprehensive error handling
- **Performance** - Optimized for mobile-first responsive design
- **Security** - No API keys exposed to client, proper validation

## 🌟 Why Spec-Driven Development?

This project demonstrates how Spec-Driven Development enables:

- **Faster Time-to-Market** - Clear specifications reduce implementation ambiguity
- **Higher Code Quality** - Comprehensive testing and type safety from day one
- **Better Collaboration** - Business stakeholders can understand and validate requirements
- **Reduced Technical Debt** - Architecture decisions made upfront with full context

## 📋 Contributing

We follow the Spec-Driven Development methodology for all contributions:

1. Start with a specification in `/specs/`
2. Create technical implementation plan
3. Break down into actionable tasks
4. Implement with test-driven development
5. Validate against original specification

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- **[GitHub Spec Kit](https://github.com/github/spec-kit)** - For the Spec-Driven Development methodology
- **OpenAI** - For GPT-4o-mini and Vision API capabilities
- **Vercel** - For Next.js framework and deployment platform

---

**Built with ❤️ using Spec-Driven Development**

_Learn more about this methodology: [GitHub Spec Kit Documentation](https://github.com/github/spec-kit)_
