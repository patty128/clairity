# ADR-002: Local-first persistence using IndexedDB

- **Status:** Accepted for prototype baseline
- **Date:** 2026-07-23

## Context

Clairity must work on Claire’s phone, preserve interrupted entries and avoid placing personal evidence in a public repository. Early development should remain practical and low cost.

## Decision

Use IndexedDB behind a repository abstraction as the main prototype evidence store. Use localStorage only for lightweight non-sensitive UI preferences.

Design the persistence interface so secure remote sync can be added later without rewriting modules.

## Consequences

### Positive

- Offline-capable.
- Structured storage and indexes.
- No backend required for the first prototype.
- Better capacity and transaction support than localStorage.

### Trade-offs

- Browser data is not a complete backup strategy.
- Cross-device sync is unavailable initially.
- Device loss or browser clearing can remove data unless export/backup is used.

## Rejected alternatives

- Store evidence directly in GitHub.
- Use localStorage as the permanent primary evidence store.
- Select a cloud backend before the evidence model stabilises.

