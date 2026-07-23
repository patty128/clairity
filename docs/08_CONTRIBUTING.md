# Contributing to Clairity

**Version:** 1.0.0  
**Applies to:** Human developers, AI coding agents and product work

---

## Required reading order

Before proposing or implementing a change, read:

1. `docs/01_PRODUCT_CONSTITUTION.md`
2. `docs/02_PRODUCT_REQUIREMENTS.md`
3. `docs/03_DECISION_LOG.md`
4. `docs/04_TECHNICAL_ARCHITECTURE.md`
5. `docs/05_DESIGN_SYSTEM.md`
6. `docs/09_GLOSSARY.md`
7. Relevant ADRs under `docs/adr/`

Use `docs/06_BACKLOG.md` only as unapproved context.

## Change workflow

### 1. Describe the change

State:

- the user problem;
- affected requirements;
- affected modules;
- affected shared services;
- data and privacy impact;
- feasibility;
- trade-offs.

### 2. Check for conflict

Do not implement until conflicts with governing documents are resolved.

Examples of conflicts:

- reducing core evidence on low-energy days;
- requiring a Save or Finish action;
- introducing vague prompts;
- deleting history when disabling a module;
- adding duplicate persistence or state;
- presenting a hypothesis as fact.

### 3. Update documentation first

Where behaviour changes:

- add or supersede a Decision Log entry;
- update Product Requirements;
- add or update an ADR for material technical changes;
- update Design System for interaction or content changes;
- update Changelog and version.

### 4. Implement through shared architecture

- Reuse platform services.
- Do not let UI components access storage directly.
- Do not create module-specific save logic.
- Preserve timestamps and missing-data semantics.
- Keep personal evidence out of source control.

### 5. Test

At minimum, test:

- autosave;
- interrupted use;
- missing versus zero/none;
- retrospective entry;
- module enable/retire/re-enable;
- preservation of historical evidence;
- mobile interaction;
- accessibility;
- privacy-sensitive failure paths.

## AI agent instruction

An AI coding agent must not infer approval from a backlog item or conversational idea. It must raise a conflict or unresolved decision rather than silently choosing a new product direction.

## Commit guidance

Recommended commit style:

- `docs: establish Clairity governance v1.0.0`
- `feat(sleep): add approved sleep logging module`
- `fix(autosave): retain pending value after storage error`
- `docs(decision): supersede D-xxx`

## Pull request / change summary checklist

- [ ] Constitution checked
- [ ] Requirements checked
- [ ] Decision Log checked
- [ ] Architecture checked
- [ ] Design System checked
- [ ] Feasibility stated
- [ ] Privacy impact considered
- [ ] Documentation updated
- [ ] Tests added or updated
- [ ] No personal data or secrets committed

