# Add admin page unit tests

## Why

Authentication, dashboard, and profile-setting behavior needs automated regression coverage before changes are merged into the main branch.

## What Changes

- Add Vitest, jsdom, and Testing Library configuration for the web workspace.
- Cover login validation, submission, navigation, authentication failures, and service failures.
- Cover forgot-password requests, code verification, resend timing, password validation, and completion.
- Cover dashboard rendering, empty states, and primary navigation actions.
- Cover profile loading, editing, password changes, photo validation, and failure behavior.
- Generate focused coverage reports for the four tested production modules and enforce baseline thresholds.

## Non-goals

- Browser end-to-end testing.
- API and database integration testing.
- Changes to production page behavior.

## Validation

- `pnpm --filter @pilotnow/web test`
- `pnpm --filter @pilotnow/web test:coverage`
- `pnpm --filter @pilotnow/web typecheck`
