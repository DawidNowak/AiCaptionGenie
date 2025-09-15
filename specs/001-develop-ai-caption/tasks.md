# Tasks: AI Caption Genie MVP (3-5 Day Build)

**Input**: Design documents from `/specs/001-develop-ai-caption/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/
**Target**: 20-25 critical tasks for MVP validation within 3-5 days

## Execution Flow (main)

```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 14, TypeScript, Tailwind CSS, OpenAI SDK, Stripe
   → Structure: Next.js full-stack web application
2. Load optional design documents ✓
   → data-model.md: CaptionRequest, CaptionResponse, Caption, UsageSession entities
   → contracts/: API endpoints (/generate, /upload, /stripe/*, /health)
   → research.md: OpenAI integration, file handling, rate limiting decisions
3. Generate tasks by category ✓ (OPTIMIZED FOR MVP)
   → Setup: Next.js project, dependencies, essential config
   → Core: critical types, API routes, React components
   → Integration: OpenAI, Stripe, file upload, rate limiting
   → Testing: essential contract tests only
   → Deployment: basic production setup
4. Apply task rules ✓
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD) - minimal critical tests only
5. Number tasks sequentially (T001-T025) ✓
6. MVP Focus: Core functionality over polish ✓
7. Post-MVP deferrals documented ✓
8. Return: SUCCESS (MVP tasks ready for 3-5 day execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Estimated time: 15-30 minutes per task
- **MVP FOCUS**: Core functionality over extensive testing/polish

## Path Conventions

Next.js 14 App Router structure:

- **Source**: `src/app/` (pages), `src/components/` (UI), `src/lib/` (utilities), `src/types/` (TypeScript)
- **Tests**: `tests/api/` (essential contract tests only)

## MVP Critical Tasks (25 tasks for 3-5 day build)

### Phase 1: Setup & Foundation (Day 1: 1-2 hours)

- [x] **T001** Create Next.js 14 project with TypeScript, Tailwind CSS, and essential dependencies (OpenAI SDK, Stripe SDK, Zod)

  - **Success**: `npm run dev` starts, all packages installed, TypeScript strict mode enabled
  - **Time**: 30 min

- [x] **T002** [P] Create essential TypeScript interfaces in `src/types/index.ts` (combined file)
  - **Success**: Platform/Tone enums, CaptionRequest/Response interfaces, UsageSession types
  - **Time**: 20 min

### Phase 2: Core API Infrastructure (Day 1-2: 3-4 hours)

- [x] **T003** [P] Create OpenAI client wrapper in `src/lib/openai.ts`

  - **Success**: Handles GPT-4o-mini and Vision API with basic error handling
  - **Time**: 30 min

- [x] **T004** [P] Create file validation utility in `src/lib/file-validation.ts`

  - **Success**: Validates JPEG/PNG/GIF/MP4/MOV formats and 10MB size limit
  - **Time**: 25 min

- [x] **T005** [P] Create rate limiting utility in `src/lib/rate-limit.ts`

  - **Success**: localStorage tracking with daily UTC reset, 3 generation limit
  - **Time**: 25 min

- [x] **T006** Create caption generation contract test in `tests/api/generate.contract.test.ts`

  - **Success**: Test validates core request/response flow, MUST FAIL initially
  - **Time**: 20 min

- [x] **T007** Create POST /api/generate endpoint in `src/app/api/generate/route.ts`
  - **Success**: Handles text inputs, calls OpenAI, returns 5-10 formatted captions
  - **Time**: 45 min

### Phase 3: File Upload & Vision API (Day 2: 2-3 hours)

- [x] **T008** Create file upload contract test in `tests/api/upload.contract.test.ts`

  - **Success**: Test validates file upload limits and formats, MUST FAIL initially
  - **Time**: 15 min

- [x] **T009** Create POST /api/upload endpoint in `src/app/api/upload/route.ts`
  - **Success**: Validates files, processes with Vision API, integrates with caption generation
  - **Time**: 40 min

### Phase 4: Frontend Components (Day 2-3: 4-5 hours)

- [x] **T010** [P] Create main caption form in `src/components/CaptionForm.tsx`

  - **Success**: Handles text input, file upload, platform/tone selection with validation
  - **Time**: 45 min

- [x] **T011** [P] Create caption results display in `src/components/CaptionResults.tsx`

  - **Success**: Shows captions with copy buttons and basic download functionality
  - **Time**: 35 min

- [x] **T012** [P] Create rate limit component in `src/components/RateLimit.tsx`

  - **Success**: Shows usage count and upgrade messaging when limit reached
  - **Time**: 25 min

- [x] **T013** Create main page layout in `src/app/page.tsx`
  - **Success**: Integrates all components with state management and loading states
  - **Time**: 35 min

### Phase 5: Payment Integration (Day 3-4: 2-3 hours)

- [x] **T014** [P] Create Stripe client wrapper in `src/lib/stripe.ts`

  - **Success**: Handles checkout sessions with basic webhook verification
  - **Time**: 30 min

- [x] **T015** Create Stripe checkout contract test in `tests/api/stripe.contract.test.ts`

  - **Success**: Test validates checkout creation, MUST FAIL initially
  - **Time**: 15 min

- [x] **T016** Create POST /api/stripe/create-checkout in `src/app/api/stripe/create-checkout/route.ts`

  - **Success**: Creates checkout session with proper success/cancel URLs
  - **Time**: 30 min

- [x] **T017** Create POST /api/stripe/webhook in `src/app/api/stripe/webhook/route.ts`
  - **Success**: Handles basic payment confirmations (minimal implementation)
  - **Time**: 25 min

### Phase 6: Integration & Error Handling (Day 4: 2-3 hours)

- [x] **T018** Implement client-side rate limiting integration

  - **Success**: UI updates based on localStorage, blocks after 3 generations
  - **Time**: 30 min

- [x] **T019** [P] Add essential error handling to API routes

  - **Success**: User-friendly error messages for file validation, API failures
  - **Time**: 30 min

- [x] **T020** [P] Add basic request validation using Zod schemas
  - **Success**: API endpoints validate critical inputs before processing
  - **Time**: 25 min

### Phase 7: Testing & Polish (Day 4-5: 2-3 hours)

- [x] **T021** [P] Add responsive design and mobile optimization

  - **Success**: App works on mobile devices with touch-friendly interface
  - **Time**: 30 min

- [x] **T022** [P] Optimize OpenAI prompts for cost efficiency

  - **Success**: Prompts generate quality captions within token budget
  - **Time**: 25 min

- [x] **T023** Create end-to-end flow test in `tests/e2e/caption-flow.spec.ts`
  - **Success**: Tests complete user journey from input to captions
  - **Time**: 30 min

### Phase 8: Deployment (Day 5: 1-2 hours)

- [ ] **T024** Configure environment variables and production settings

  - **Success**: All API keys configured, build optimization enabled
  - **Time**: 20 min

- [ ] **T025** Deploy to Vercel and verify functionality
  - **Success**: Production app works with all core features functional
  - **Time**: 30 min

## Dependencies

**Critical Path**:

- Setup (T001-T002) → Utilities (T003-T005) → API Tests & Implementation (T006-T009)
- Components (T010-T012) → Page Integration (T013)
- Payments (T014-T017) run parallel to frontend work
- Integration (T018-T020) → Testing/Polish (T021-T023) → Deployment (T024-T025)

**Blocking Dependencies**:

- T002 (types) blocks all implementation tasks
- T003 (OpenAI client) blocks T007, T009
- T005 (rate limiting) blocks T018
- T014 (Stripe client) blocks T016, T017
- T010-T012 (components) block T013
- T024 (config) blocks T025

## Parallel Execution Examples

```bash
# Phase 2 - Core utilities (can run simultaneously):
Task: "Create OpenAI client wrapper in src/lib/openai.ts"
Task: "Create file validation utility in src/lib/file-validation.ts"
Task: "Create rate limiting utility in src/lib/rate-limit.ts"

# Phase 4 - Components (independent implementations):
Task: "Create main caption form in src/components/CaptionForm.tsx"
Task: "Create caption results display in src/components/CaptionResults.tsx"
Task: "Create rate limit component in src/components/RateLimit.tsx"

# Phase 7 - Polish tasks (different areas):
Task: "Add responsive design and mobile optimization"
Task: "Optimize OpenAI prompts for cost efficiency"
```

## Post-MVP Improvements Completed

**These improvements were implemented after core MVP completion to enhance code quality and maintainability:**

- [x] **I001** Standardize import patterns across entire codebase

  - **Success**: All files use '@/' alias consistently, enhanced IntelliSense support
  - **Files**: All components, API routes, tests, and utilities updated
  - **Time**: 45 min

- [x] **I002** Enhance Jest test environment compatibility

  - **Success**: Fixed NextResponse.json() issues, added FormData polyfill, improved contract tests
  - **Files**: `jest.setup.js`, all API routes, contract tests
  - **Time**: 60 min

- [x] **I003** Implement standardized API response patterns
  - **Success**: Consistent error/success response helpers across all API routes
  - **Files**: `generate/route.ts`, `upload/route.ts`, `stripe/create-checkout/route.ts`
  - **Time**: 30 min

## Deferred to Post-MVP

**These tasks were removed from MVP to meet 3-5 day timeline:**

### Testing Deferrals

- **D001** Extensive integration tests for all user scenarios (kept only essential flow test)
- **D002** Component unit tests beyond contract tests
- **D003** Performance testing and monitoring setup
- **D004** Comprehensive error boundary testing

### Feature Deferrals

- **D005** Advanced file upload with drag-drop UX (basic upload only)
- **D006** Caption formatting utility (handled in OpenAI prompts)
- **D007** Health check endpoint for monitoring
- **D008** Advanced error logging and analytics

### Polish Deferrals

- **D009** Extensive unit test coverage for utilities
- **D010** Advanced performance monitoring
- **D011** Sophisticated error boundary components
- **D012** Loading state animations and progress bars
- **D013** Advanced prompt optimization beyond basics

### Configuration Deferrals

- **D014** ESLint and Prettier configuration (use Next.js defaults)
- **D015** Advanced TypeScript configurations
- **D016** Comprehensive CI/CD pipeline setup

## Success Criteria Summary

- All core features functional: text/image caption generation, rate limiting, payments
- File uploads support 10MB limit with proper format validation
- Rate limiting enforces 3 free generations per day via localStorage
- Stripe integration processes payments successfully
- Mobile-responsive design works on common devices
- Basic error handling provides user-friendly messages
- Performance stays within reasonable bounds for MVP validation
- Production deployment to Vercel successful

## MVP Focus Notes

- **Prioritize working over perfect**: Basic error messages instead of sophisticated handling
- **Combine similar tasks**: All TypeScript types in one file, essential tests only
- **Defer polish**: Focus on core functionality, add UX improvements post-MVP
- **Minimal viable testing**: Contract tests for critical paths only
- **Simple implementations**: Basic webhook handling, minimal error boundaries
- **Cost awareness**: Optimize prompts for functionality first, cost optimization second

**Total Estimated Time**: 15-20 hours across 3-5 days for focused MVP development
Task: "Create FileUpload component in src/components/ui/FileUpload.tsx"

```

## Success Criteria Summary

- All contract tests written and failing before implementation
- Caption generation completes in <2 seconds
- File uploads support 10MB limit with proper validation
- Rate limiting enforces 3 free generations per day
- Stripe integration handles payments with webhooks
- Mobile-responsive design works across devices
- Error handling provides user-friendly messages
- Performance stays within $10/month OpenAI budget
- Deployment to Vercel succeeds with all features working

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **Verify tests fail** before implementing corresponding functionality
- **Commit after each task** for proper TDD tracking
- **Avoid vague tasks** - each task has specific file path and success criteria
- **MVP focus** - prioritize core functionality over advanced features
- **Cost awareness** - optimize for token usage and API efficiency throughout
```
