# ADR-003: Immediate autosave

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

A required start, save or finish flow adds friction and risks losing partial evidence. Difficult or low-energy periods are especially important to preserve.

## Decision

Every valid discrete interaction saves immediately. Free text may use a short debounce. The interface shows honest saving, saved and failed states.

Components call an application autosave service rather than storage directly.

## Consequences

### Positive

- Partial evidence remains useful.
- Leaving the app does not normally lose valid inputs.
- No transactional “complete check-in” barrier.

### Trade-offs

- Save failures and retries require deliberate design.
- Stable record IDs and duplicate prevention are mandatory.
- Optimistic UI must not falsely claim persistence.

## Rejected alternatives

- Save only when a full form is submitted.
- Require a Finish action.
- Let each module invent its own save behaviour.

