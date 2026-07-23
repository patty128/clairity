# ADR-004: Insight evidence hierarchy

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

Clairity is intended to identify patterns but observational personal evidence is vulnerable to missing context, confounding and false causal conclusions.

## Decision

Insights use an explicit hierarchy:

1. descriptive observation;
2. association;
3. hypothesis.

Each insight retains supporting records, evidence period, limitations and engine version. Causal or diagnostic claims are prohibited.

## Consequences

### Positive

- Insight language remains trustworthy.
- Supporting evidence can be inspected.
- Later engine changes remain traceable.

### Trade-offs

- Results may sound less definitive.
- More metadata and content design are required.

## Rejected alternatives

- Present correlations as causes.
- Use opaque AI summaries without provenance.
- Hide limitations to simplify the interface.

