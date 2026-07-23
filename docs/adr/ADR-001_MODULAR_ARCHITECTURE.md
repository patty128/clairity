# ADR-001: Registered modular architecture

- **Status:** Accepted
- **Date:** 2026-07-23
- **Decision owners:** Claire / Clairity project

## Context

Claire’s evidence needs will change. A pregnancy module may be added later, while smoking may eventually no longer need active logging. Permanently hard-coded feature flows would make these changes expensive and fragile.

## Decision

Use a centrally registered module architecture. Modules share contracts for persistence, autosave, history, insights, export, privacy and lifecycle state.

The first version will not implement a third-party runtime plug-in platform.

## Consequences

### Positive

- Modules can be added or retired with limited rework.
- Historical data remains independent from active module visibility.
- Shared behaviour stays consistent.

### Trade-offs

- Module contracts require upfront design discipline.
- A registry still requires code deployment to add modules.

## Rejected alternatives

- Hard-code all evidence areas into screens and storage.
- Build a fully dynamic plug-in marketplace for the MVP.

