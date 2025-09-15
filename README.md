# 🌱 AI Caption Genie

> **Built using Spec-Driven Development with [GitHub Spec Kit](https://github.com/github/spec-kit)**

AI Caption Genie is a Next.js 14 web application that generates engaging social media captions using OpenAI APIs. Users can input text descriptions or upload images to receive 5-10 platform-optimized captions with emojis, CTAs, and hashtags. This project demonstrates the power of **Spec-Driven Development** methodology, where specifications drive implementation rather than code driving specifications.

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

- **Text or Media Input**: Describe your post theme or upload images (JPEG, PNG, GIF up to 10MB)
- **Platform-Specific**: Optimized captions for Instagram, TikTok, LinkedIn with platform-appropriate formatting
- **Tone Selection**: Choose from casual, professional, humorous tones for brand consistency
- **Rich Output**: 5-10 unique captions with relevant emojis, call-to-actions, and 3-5 hashtags
- **One-Click Copy**: Copy individual captions instantly with visual feedback
- **Bulk Download**: Download all generated captions as a timestamped text file
- **Rate Limiting**: 3 free generations per day with localStorage tracking (MVP phase)
- **Mobile-First Design**: Responsive design optimized for mobile content creators
- **Privacy-First**: No user data stored, all processing client-side with secure API calls

### 🎯 Target Users

- **Social Media Content Creators** - Save 20+ minutes of brainstorming time per post
- **Digital Marketers** - Generate consistent, engaging content at scale across platforms
- **Small Business Owners** - Professional captions without hiring copywriters
- **Influencers** - Maintain consistent voice and engagement across content

## 🏗️ Spec-Driven Development Process

This project follows the systematic Spec Kit methodology:

### 1. **Specification Phase** (`/specs/001-develop-ai-caption/`)

- **spec.md** - Complete feature specification with user scenarios and acceptance criteria
- **data-model.md** - Entity relationships and data structures
- **research.md** - Technology and market research with decision rationale
- **contracts/api-spec.yaml** - OpenAPI contract definitions for all endpoints

### 2. **Planning Phase**

- **plan.md** - Technical implementation strategy with architecture decisions
- **tasks.md** - 25 actionable development tasks broken down for 3-5 day MVP implementation

### 3. **Implementation Phase**

- Test-driven development with comprehensive test coverage (unit, integration, contract, E2E)
- Type-safe TypeScript implementation with strict mode
- Component-based React architecture with proper error boundaries
- **tasks.md** - Actionable development tasks

### 3. **Implementation Phase**

- Test-driven development with comprehensive test coverage
- Type-safe TypeScript implementation
- Component-based React architecture

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.6+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4 with responsive design system
- **AI**: OpenAI GPT-4o-mini + Vision API for image analysis
- **Payments**: Stripe SDK for subscription management
- **Validation**: Zod for type-safe input validation
- **Testing**: Jest + React Testing Library + Playwright E2E
- **Development**: ESLint + Next.js config, PostCSS, Autoprefixer
- **Deployment**: Vercel-optimized

## 🚀 Getting Started

### Prerequisites

- **Node.js 18.0+** (LTS recommended)
- **npm** or **yarn** package manager
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Stripe Account** (Optional - for payment features)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/DawidNowak/AiCaptionGenie.git
cd AiCaptionGenie
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Required - OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Stripe Configuration (for payment features)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Open the application:**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### 🎯 First Use

1. Enter a post description (e.g., "Launching my new eco-friendly skincare line")
2. Select your platform (Instagram, TikTok, or LinkedIn)
3. Choose a tone (Professional, Casual, or Humorous)
4. Click "Generate Captions" to see your AI-generated results
5. Copy individual captions or download all as a text file

## 🧪 Testing

This project follows **Test-Driven Development (TDD)** principles with comprehensive test coverage across multiple levels:

### Quick Test Commands

```bash
# Run all tests
npm test

# Run unit and integration tests in watch mode
npm run test -- --watch

# Run E2E tests across all browsers
npm run test:e2e

# Run E2E tests with interactive UI
npm run test:e2e:ui

# Run E2E tests on specific browser
npm run test:e2e -- --project=chromium
```

### Test Coverage Breakdown

#### ✅ **Unit Tests** (`tests/components/`, `tests/lib/`)

- React component behavior and props
- Utility functions (rate limiting, file validation, OpenAI client)
- Type safety and error handling

#### ✅ **Integration Tests** (`tests/api/`)

- API route functionality with mocked dependencies
- Request/response validation with Zod schemas
- Error handling and edge cases

#### ✅ **Contract Tests** (`tests/api/*.contract.test.ts`)

- API endpoint schema validation
- Request/response structure compliance
- OpenAPI specification adherence

#### ✅ **End-to-End Tests** (`tests/e2e/`)

- Complete user workflows from form to results
- Cross-browser compatibility (Chrome, Firefox, WebKit, Mobile Safari)
- Rate limiting enforcement and UI updates
- File upload validation and error handling
- Mobile responsiveness testing

### Testing Infrastructure

The project includes specialized testing setup optimized for Next.js API routes:

#### **Jest Configuration**

- **Enhanced FormData polyfill**: Custom implementation for Node.js test environment
- **NextResponse compatibility**: Uses constructor pattern for Jest compatibility
- **whatwg-fetch polyfill**: Enables proper Request/Response handling
- **Custom setup**: `jest.setup.js` configures testing environment
- **TypeScript support**: Full type checking in tests

#### **Playwright E2E Setup**

- **Cross-browser testing**: Chrome, Firefox, WebKit, Mobile Safari
- **API mocking**: Consistent test data without real API calls
- **Mobile testing**: Responsive design validation
- **Download testing**: File download functionality verification
- **Error scenarios**: API failure and network error handling

#### **Mock Strategies**

- **OpenAI API**: Consistent caption generation responses
- **Stripe API**: Payment flow testing without real transactions
- **File uploads**: Mock file handling for various formats and sizes
- **LocalStorage**: Rate limiting simulation and testing

### Test Status: **35 Tests, 33 Passed, 2 Skipped**

- ✅ **33 Passed**: All core functionality working across browsers
- ⏭️ **2 Skipped**: WebKit/Safari API mocking limitations (expected)

The skipped tests are due to stricter request interception in WebKit/Safari browsers during testing. This only affects the test environment - the application works perfectly in production Safari.

## 📁 Project Structure

```
├── 📁 src/                          # Source code
│   ├── 📁 app/                      # Next.js 14 App Router
│   │   ├── 📁 api/                  # API routes
│   │   │   ├── 📁 generate/         # POST /api/generate - Text-based caption generation
│   │   │   ├── 📁 upload/           # POST /api/upload - Image caption generation
│   │   │   └── 📁 stripe/           # Stripe payment integration
│   │   │       ├── 📁 create-checkout/  # Payment session creation
│   │   │       └── 📁 webhook/      # Stripe webhook handling
│   │   ├── 📄 globals.css           # Global styles with Tailwind CSS
│   │   ├── 📄 layout.tsx            # Root layout component
│   │   └── 📄 page.tsx              # Main application page
│   ├── 📁 components/               # React components
│   │   ├── 📄 CaptionForm.tsx       # Form for input and settings
│   │   ├── 📄 CaptionResults.tsx    # Caption display with copy/download
│   │   └── 📄 RateLimit.tsx         # Usage tracking and upgrade UI
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── 📄 file-validation.ts    # File upload validation (10MB, format checks)
│   │   ├── 📄 openai.ts             # OpenAI client wrapper with error handling
│   │   ├── 📄 rate-limit.ts         # localStorage-based rate limiting
│   │   └── 📄 stripe.ts             # Stripe client configuration
│   └── 📁 types/                    # TypeScript definitions
│       └── 📄 index.ts              # Platform, Tone enums, API interfaces
├── 📁 specs/                        # Spec-Driven Development files
│   └── 📁 001-develop-ai-caption/   # Feature specification
│       ├── 📄 spec.md               # Complete feature requirements
│       ├── 📄 plan.md               # Technical implementation strategy
│       ├── 📄 tasks.md              # 25 development tasks (completed)
│       ├── 📄 data-model.md         # Entity relationships
│       ├── 📄 research.md           # Technology decisions
│       └── 📁 contracts/            # API contracts
│           ├── 📄 api-spec.yaml     # OpenAPI specification
│           └── 📄 README.md         # Contract documentation
├── 📁 tests/                        # Comprehensive test suite
│   ├── 📁 api/                      # API route tests
│   │   ├── 📄 *.contract.test.ts    # Contract validation tests
│   │   ├── 📄 *.test.ts             # Integration tests
│   │   └── 📄 validation.test.ts    # Input validation tests
│   ├── 📁 components/               # Component unit tests
│   │   ├── 📄 *.test.tsx            # React component tests
│   │   └── 📄 responsive.test.tsx   # Mobile responsiveness tests
│   ├── 📁 lib/                      # Utility function tests
│   │   └── 📄 *.test.ts             # Rate limiting, validation, API clients
│   ├── 📁 e2e/                      # End-to-end tests
│   │   └── 📄 caption-flow.spec.ts  # Complete user journey testing
│   └── 📁 setup/                    # Test configuration
│       └── 📄 project-setup.test.ts # Environment validation
├── 📄 .env.example                  # Environment variable template
├── 📄 jest.config.js                # Jest configuration for Next.js
├── 📄 jest.setup.js                 # Custom test environment setup
├── 📄 playwright.config.ts          # Playwright E2E test configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration (strict mode)
└── 📄 next.config.mjs               # Next.js configuration
```

## 🎯 Development Principles

### Spec-Driven Approach

1. **Specification First** - Features begin with detailed specs, not code
2. **Test-Driven Implementation** - Tests written before code implementation
3. **Contract-Based APIs** - All endpoints follow OpenAPI specifications
4. **Type Safety** - Strict TypeScript with no `any` types

### Code Quality Standards

- **Single Responsibility** - Each component has one clear purpose
- **Error Boundaries** - Comprehensive error handling at all levels
- **Performance Optimization** - Mobile-first responsive design, optimized bundle size
- **Security Best Practices** - No API keys exposed to client, proper input validation
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### Import Standards

This project follows strict import standards for maintainability and consistency:

- **Use '@/' alias** for all internal imports (mapped to 'src/' in tsconfig.json)
- **Consistent patterns** across components, tests, and API routes
- **TypeScript path mapping** configured for optimal IntelliSense support
- **Example**: `import { Platform } from '@/types'` instead of `../../src/types`

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server at http://localhost:3000
npm run build            # Build production application
npm run start            # Start production server
npm run lint             # Run ESLint for code quality

# Testing
npm test                 # Run Jest unit and integration tests
npm run test:e2e         # Run Playwright E2E tests across all browsers
npm run test:e2e:ui      # Run E2E tests with interactive UI
```

## 🌟 Why Spec-Driven Development?

This project demonstrates how Spec-Driven Development enables:

- **Faster Time-to-Market** - Clear specifications reduce implementation ambiguity
- **Higher Code Quality** - Comprehensive testing and type safety from day one
- **Better Collaboration** - Business stakeholders can understand and validate requirements
- **Reduced Technical Debt** - Architecture decisions made upfront with full context
- **Predictable Outcomes** - Implementation matches specifications exactly

## 📊 Implementation Metrics

- **25 Development Tasks** completed in 3-5 day MVP timeline
- **35 Tests**: 33 passed, 2 skipped (WebKit API mocking limitations)
- **100% TypeScript** coverage with strict mode enabled
- **4 API Endpoints** with full contract validation
- **3 Core Components** with comprehensive unit tests
- **Cross-browser E2E Testing** on 5 different browser configurations

## 🚨 Known Limitations (MVP Phase)

- **Rate Limiting**: 3 free generations per day using localStorage (resets on browser clear)
- **Anonymous Usage**: No user accounts or persistent data storage
- **File Size**: 10MB upload limit for images
- **Supported Formats**: JPEG, PNG, GIF only
- **Stripe Integration**: Payment flow implemented but not fully activated

## 🔮 Future Enhancements

- User accounts with persistent rate limiting
- Advanced tone options (brand-specific, industry-specific)
- Bulk caption generation for multiple posts
- Caption scheduling and social media integration
- Analytics dashboard for caption performance
- Team collaboration features

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
