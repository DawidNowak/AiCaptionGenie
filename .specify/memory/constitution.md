# AI Caption Genie Constitution

## Core Principles

### I. User-Centric Simplicity

The application must prioritize ease of use for social media content creators, delivering a minimal, intuitive UI that enables caption generation in under 30 seconds. Features should solve the core problem (generating engaging captions) without unnecessary complexity. Every user interaction must be validated against the goal of saving time and boosting engagement.

### II. Cost-Efficient AI Usage

AI integrations (e.g., OpenAI APIs) must be optimized to stay within a $10/month budget for MVP testing, assuming up to 1,000 daily users. Usage tracking and cost monitoring are mandatory to prevent unexpected expenses. Features requiring high-cost AI calls (e.g., large media processing) must be justified and capped.

### III. Privacy-First for Anonymous Usage

As the MVP avoids user accounts, no personal data (e.g., emails, names) may be collected. Rate limiting (3 free generations/day) must use client-side mechanisms (e.g., local storage, cookies) that respect user privacy and comply with GDPR principles, even for anonymous users.

### IV. Iterative Scalability

The architecture must support rapid MVP development (3-5 days) while allowing future additions (e.g., user accounts, analytics) without major rewrites. Code and features should follow the YAGNI principle ("You Aren’t Gonna Need It") to avoid over-engineering, with clear documentation for future iterations.

### V. Error Transparency

All user-facing errors (e.g., invalid file formats, rate limit exceeded) must display clear, actionable messages. Backend errors (e.g., API failures) must be logged for debugging but never exposed to users. Error handling should prioritize UX and prevent crashes.

## Development Constraints

- **Technology Stack**: Use Next.js (stable version, currently 14) with TypeScript for full-stack development, Tailwind CSS for styling, and Vercel for deployment to minimize setup time and leverage free/low-cost hosting. OpenAI APIs (GPT-4o-mini, Vision) are required for core functionality; no other AI providers unless justified by cost or performance.
- **No External Databases**: The MVP must avoid server-side databases to reduce complexity and costs, relying on client-side storage for rate limiting and state management.
- **Monetization Readiness**: Integrate Stripe for subscription payments from day one, supporting a freemium model (3 free generations/day, paid unlimited plan).
- **Performance**: Page load times must be under 2 seconds on average mobile connections. API calls should be optimized to avoid latency (e.g., cache frequent caption prompts if feasible).

## Development Workflow

- **Spec-Driven Process**: Follow the Spec Kit workflow strictly: `/specify` → `/plan` → `/tasks` → `implement`. No implementation begins until the specification is validated and free of `[NEEDS CLARIFICATION]` tags.
- **AI-Assisted Coding**: Use AI tools (e.g., Cursor, GitHub Copilot) to accelerate development, but all generated code must be reviewed for adherence to this constitution.
- **Testing**: Each feature (e.g., caption generation, file upload, rate limiting) must have at least one manual test case (e.g., sample JPEG upload, exceeding rate limit) before deployment. Automated tests are optional for MVP but encouraged for critical paths (e.g., Stripe webhooks).
- **Version Control**: All changes must be committed to feature branches (e.g., `001-ai-caption-genie`) with descriptive pull request summaries. PRs must reference the constitution for compliance.

## Governance

- **Constitution as Source of Truth**: All development decisions must align with this constitution. Deviations require documented justification and an amendment process.
- **Amendments**: Changes to the constitution must be proposed in a GitHub issue, include a migration plan for existing code/features, and be ratified via pull request.
- **Compliance**: Every pull request must include a checklist confirming adherence to core principles and constraints. Non-compliant changes will be rejected.

**Version**: 1.0.0 | **Ratified**: 2025-09-13 | **Last Amended**: N/A
