# Implementation Plan: AI Caption Genie MVP

**Branch**: `001-develop-ai-caption` | **Date**: September 13, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-develop-ai-caption/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✓
   → Feature spec loaded and analyzed
2. Fill Technical Context (scan for NEEDS CLARIFICATION) ✓
   → Detect Project Type: web (frontend+backend) ✓
   → Set Structure Decision: Option 2 (Web application) ✓
3. Evaluate Constitution Check section ✓
   → Constitution template found but not configured - proceeding with standard practices
   → Update Progress Tracking: Initial Constitution Check ✓
4. Execute Phase 0 → research.md ✓
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md ✓
6. Re-evaluate Constitution Check section ✓
   → No violations detected in design
   → Update Progress Tracking: Post-Design Constitution Check ✓
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md) ✓
8. STOP - Ready for /tasks command ✓
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

AI Caption Genie MVP is a single-page web application that generates 5-10 platform-optimized social media captions with emojis, CTAs, and hashtags. Users input text descriptions or upload images, select platform (Instagram/TikTok/LinkedIn) and tone (casual/professional/humorous), then receive generated captions they can copy or download. The MVP uses anonymous usage with 3 free generations per day tracked via client-side storage, encouraging upgrade to paid plans via Stripe. Built with Next.js 14, TypeScript, Tailwind CSS, OpenAI GPT-4o-mini and Vision APIs, deployed on Vercel with no external database for rapid development.

**Implementation Note**: Video upload support was removed during development due to OpenAI Vision API limitations (images only). This provides a cleaner user experience rather than accepting files that cannot be properly processed.

## Technical Context

**Language/Version**: TypeScript 5.0+ with Next.js 14
**Primary Dependencies**: Next.js 14, React 18, Tailwind CSS 3.4, OpenAI SDK 4.0+, Stripe SDK
**Storage**: Client-side localStorage (rate limiting), no external database for MVP
**Testing**: Jest + React Testing Library (unit), Playwright (e2e), Postman/curl (API)
**Target Platform**: Web browsers (desktop + mobile responsive), deployed on Vercel
**Project Type**: web - determines source structure (frontend + backend combined in Next.js)
**Performance Goals**: <2s caption generation, <10MB file upload, <1s UI response time
**Constraints**: $10/month OpenAI budget, 3 free generations/day/user, 10MB file size limit
**Scale/Scope**: MVP targeting 100-500 daily active users, 5-10 API endpoints, 3-5 page app

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (Next.js full-stack app with API routes)
- Using framework directly? Yes (Next.js App Router, no wrapper classes)
- Single data model? Yes (Caption generation request/response, usage tracking)
- Avoiding patterns? Yes (no Repository/UoW, direct API calls, simple localStorage)

**Architecture**:

- EVERY feature as library? Modified for Next.js: API routes + React components as modules
- Libraries listed:
  - caption-generator (OpenAI integration)
  - file-processor (upload validation + Vision API)
  - rate-limiter (localStorage tracking)
  - ui-components (reusable React components)
- CLI per library: N/A for web app (API endpoints serve as interfaces)
- Library docs: Component documentation + API docs in llms.txt format

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? Yes (tests written first, fail, then implement)
- Git commits show tests before implementation? Yes (TDD approach)
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual OpenAI API in tests with test keys)
- Integration tests for: API routes, file upload flow, rate limiting, payment flow
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included? Yes (console.log in development, structured in production)
- Frontend logs → backend? Yes (error reporting via API routes)
- Error context sufficient? Yes (user-friendly messages + detailed server logs)

**Versioning**:

- Version number assigned? 1.0.0 (MVP launch)
- BUILD increments on every change? Yes (patch version for each deployment)
- Breaking changes handled? N/A for MVP (no existing users)

## Project Structure

### Documentation (this feature)

```
specs/001-develop-ai-caption/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (Next.js full-stack)
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   │   ├── generate/   # Caption generation endpoint
│   │   ├── upload/     # File upload endpoint
│   │   └── stripe/     # Payment endpoints
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   └── forms/      # Form components
│   ├── lib/            # Utility libraries
│   │   ├── openai.ts   # OpenAI client
│   │   ├── stripe.ts   # Stripe client
│   │   └── rate-limit.ts # Rate limiting logic
│   ├── types/          # TypeScript definitions
│   └── globals.css     # Tailwind CSS
├── public/             # Static assets
└── tests/
    ├── api/            # API route tests
    ├── components/     # Component tests
    └── e2e/            # End-to-end tests
```

**Structure Decision**: Option 2 (Web application) - Next.js combines frontend and backend

## Phase 0: Outline & Research

**NEEDS CLARIFICATION Resolution**:

- File format support: JPEG, PNG, GIF (images only) ✓
- Rate limiting: Client-side localStorage with daily UTC reset ✓
- Payment integration: Stripe checkout flow ✓
- AI models: GPT-4o-mini for text, Vision API for images ✓

**Research Tasks Completed**:

1. **OpenAI API Integration**: GPT-4o-mini pricing ($0.15/1M input tokens, $0.60/1M output tokens), Vision API pricing ($1.25/1K images), rate limits (10,000 RPM)
2. **Next.js 14 Best Practices**: App Router for API routes, server components for performance, client components for interactivity
3. **File Upload Handling**: Built-in Next.js support up to 1MB default (configure for 10MB), FormData for multipart uploads
4. **Client-side Rate Limiting**: localStorage with JSON data, UTC timestamp comparison, fallback to IP-based if localStorage unavailable
5. **Stripe Integration**: Checkout Sessions for one-time payments, customer portal for subscription management
6. **Vercel Deployment**: Automatic deployments from Git, environment variables for API keys, edge functions for global performance

**Output**: research.md (to be generated)

## Phase 1: Design & Contracts

**Data Models Identified**:

- CaptionRequest: input text/file, platform, tone, timestamp
- CaptionResponse: generated captions array with metadata
- UsageSession: generation count, last reset timestamp
- PlatformConfig: platform-specific rules and formatting

**API Endpoints Designed**:

- POST /api/generate - Caption generation
- POST /api/upload - File upload and processing
- POST /api/stripe/create-checkout - Payment initiation
- GET /api/stripe/success - Payment confirmation

**Test Scenarios from User Stories**:

- Text input caption generation flow
- Image upload and analysis flow
- Rate limiting enforcement
- Copy to clipboard functionality
- File download generation
- Stripe payment flow

**Output**: data-model.md, /contracts/\*, quickstart.md, .github/copilot-instructions.md (to be generated)

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API endpoint → contract test task [P]
- Each React component → component test task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: API routes → Components → Pages → Integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations detected - using standard Next.js patterns_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
