# API Contract Tests

This directory contains contract tests that validate API endpoint schemas and behavior according to the OpenAPI specification.

## Test Structure

Each endpoint has corresponding contract tests that:

1. Validate request schema compliance
2. Verify response schema compliance
3. Test error handling scenarios
4. Ensure HTTP status codes match specification

## Test Files

- `generate.contract.test.ts` - Caption generation endpoint tests
- `upload.contract.test.ts` - File upload endpoint tests
- `stripe.contract.test.ts` - Payment endpoint tests
- `health.contract.test.ts` - Health check endpoint tests

## Running Contract Tests

```bash
npm test -- --testPathPattern=contract
```

## Test Implementation Notes

Contract tests must be written FIRST (TDD approach) and should FAIL before implementation. They test the API contract independently of business logic.

Each test validates:

- Required fields presence
- Data type compliance
- Enum value restrictions
- Array length constraints
- HTTP status code accuracy
- Error response structure
