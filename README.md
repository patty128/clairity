# Clairity

Clairity is a private, single-user wellbeing evidence application designed for Claire. It helps preserve context, record health and behaviour evidence, identify patterns and support better-informed decisions without presenting correlation as certainty.

## Project status

**Governance baseline:** v1.0.0  
**Implementation status:** Pre-build documentation and architecture phase

## Repository structure

```text
/
├── README.md
├── docs/
│   ├── 01_PRODUCT_CONSTITUTION.md
│   ├── 02_PRODUCT_REQUIREMENTS.md
│   ├── 03_DECISION_LOG.md
│   ├── 04_TECHNICAL_ARCHITECTURE.md
│   ├── 05_DESIGN_SYSTEM.md
│   ├── 06_BACKLOG.md
│   ├── 07_CHANGELOG.md
│   ├── 08_CONTRIBUTING.md
│   ├── 09_GLOSSARY.md
│   └── adr/
└── src/                         # added during implementation
```

## Required governance reading order

Before implementing any feature or architectural change:

1. Read the Product Constitution.
2. Confirm the change exists in approved Product Requirements.
3. Check the Decision Log for rationale and superseded ideas.
4. Follow Technical Architecture.
5. Follow the Design System.
6. Check relevant ADRs.

A backlog item is not approved scope.

## Non-negotiable summary

- Evidence before conclusions.
- Reduce friction without reducing core evidence.
- Specific independent interactions, not a vague daily check-in.
- Autosave every valid input.
- Missing data must remain distinct.
- Preserve history.
- Modular by default.
- Privacy by default.
- Be explicit about uncertainty.
- Do not introduce patch architecture.

## Versioning

Clairity uses semantic versioning:

- **Major:** constitutional, product-philosophy or breaking architecture change.
- **Minor:** approved new module or significant capability.
- **Patch:** non-breaking clarification or defect fix.

## Data safety

Do not commit:

- Claire’s personal health or behaviour evidence;
- API keys;
- credentials;
- exported production data;
- private configuration.

## Current next gate

The governance pack is ready for repository setup. Exact visual direction will later require Claire’s approval through a mobile prototype.
