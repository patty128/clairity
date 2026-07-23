# Clairity Decision Log

**Version:** 1.0.0  
**Status:** Approved baseline  
**Owner:** Claire  
**Last updated:** 2026-07-23  
**Depends on:** `01_PRODUCT_CONSTITUTION.md`  
**Purpose:** Record significant product, UX, data, architecture, privacy and delivery decisions for Clairity, including rationale, impact and superseded ideas.

---

## Document responsibility

This document records **why significant decisions were made**, their impact and what they supersede. It does not replace the Product Requirements or Technical Architecture.

## Change history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-23 | Initial approved governance baseline |

## Decision format

Each decision includes:

- **ID**
- **Date**
- **Category**
- **Decision**
- **Rationale**
- **Impact**
- **Supersedes**, where relevant

---

## Decisions

### D-001 — Clairity is a single-user product

- **Date:** 2026-07-20
- **Category:** Product
- **Decision:** Clairity is a private, single-user application for Claire only.
- **Rationale:** Product decisions should optimise for Claire’s own routines, needs, commitment and data rather than generic onboarding, growth or multi-user retention.
- **Impact:** No public profiles, social features, multi-user administration or generic onboarding are required.
- **Supersedes:** Any assumption that Clairity should be designed as a general consumer product.

### D-002 — Evidence-first product philosophy

- **Date:** 2026-07-20
- **Category:** Product / Insights
- **Decision:** Clairity must collect and preserve evidence before drawing conclusions.
- **Rationale:** The product exists to help identify patterns and retain context, not to generate confident but unsupported explanations.
- **Impact:** Insights must distinguish recorded fact, calculation, observed pattern, hypothesis and unsupported assumption.
- **Supersedes:** Any design that presents interpretation as certainty.

### D-003 — No vague umbrella check-in

- **Date:** 2026-07-21
- **Category:** UX
- **Decision:** Clairity must not use vague prompts such as “How are you feeling?” as the primary logging mechanism.
- **Rationale:** Broad prompts reduce clarity and consistency and make evidence harder to compare over time.
- **Impact:** Logging uses specific evidence questions such as mood, energy, motivation, appetite and sleep.
- **Supersedes:** A generic daily emotional check-in.

### D-004 — Independent logging instead of one large questionnaire

- **Date:** 2026-07-21
- **Category:** UX
- **Decision:** Daily evidence is recorded through independent interactions rather than one long form.
- **Rationale:** Large forms increase friction and make partial logging feel incomplete or failed.
- **Impact:** Each evidence area can be logged separately and autosaved immediately.
- **Supersedes:** A single “Start check-in” flow.

### D-005 — Immediate autosave

- **Date:** 2026-07-21
- **Category:** UX / Technical
- **Decision:** Every valid interaction autosaves immediately.
- **Rationale:** Claire should not lose data because she leaves the app, closes the browser or does not complete a larger flow.
- **Impact:** No required Save, Submit or Finish action. The app may show passive save status.
- **Supersedes:** Manual submission as the primary persistence mechanism.

### D-006 — Completion is optional, not transactional

- **Date:** 2026-07-21
- **Category:** UX
- **Decision:** A completion marker may exist only as an optional organisational signal.
- **Rationale:** Data should already be saved, and incomplete logging should still be useful.
- **Impact:** Completion does not control persistence or validity.
- **Supersedes:** “Finish check-in” as a required action.

### D-007 — Adaptive interaction, consistent evidence

- **Date:** 2026-07-20
- **Category:** UX / Data
- **Decision:** Clairity may adapt interaction style and friction based on recent mood, energy, motivation, sleep and behavioural state, but must preserve the same core evidence.
- **Rationale:** Reducing questions on low-energy days would systematically remove important data exactly when it may matter most.
- **Impact:** Adaptation may simplify controls, reduce screen density or defer optional detail, but not omit core measures.
- **Supersedes:** “Reduce questions when energy is low.”

### D-008 — Missing data must remain distinct

- **Date:** 2026-07-21
- **Category:** Data
- **Decision:** Missing evidence must remain distinct from zero, none, unchanged, unknown, not applicable or deliberately skipped.
- **Rationale:** Treating absence of interaction as an answer corrupts analysis.
- **Impact:** Data schemas and UI states must explicitly represent missingness.
- **Supersedes:** Any implicit default answer created by non-interaction.

### D-009 — Retrospective context is valid evidence

- **Date:** 2026-07-20
- **Category:** Data
- **Decision:** Clairity must support adding forgotten or delayed context later.
- **Rationale:** Important explanatory factors may only be remembered after symptoms or outcomes become visible.
- **Impact:** Records should preserve event time, recorded time and edit time.
- **Supersedes:** Assumption that all valid evidence must be entered in real time.

### D-010 — Consider missing, delayed or forgotten context

- **Date:** 2026-07-20
- **Category:** Insights
- **Decision:** When an outcome or symptom persists without an obvious recorded cause, Clairity should prompt consideration of missing, delayed, forgotten or unrecorded context.
- **Rationale:** Lack of a visible explanation does not establish that no explanation exists.
- **Impact:** Insight wording must communicate uncertainty and data limitations.
- **Supersedes:** “No pattern found” as a complete conclusion.

### D-011 — Track urges separately from behaviours

- **Date:** 2026-07-20
- **Category:** Data / Behaviour
- **Decision:** Where relevant, Clairity should distinguish an urge from the behaviour itself.
- **Rationale:** An urge and an action may have different causes, outcomes and intervention opportunities.
- **Impact:** Modules such as smoking and binge eating should be able to record both urge and event.
- **Supersedes:** Single binary behaviour fields where urge information is important.

### D-012 — One-tap evidence before optional detail

- **Date:** 2026-07-20
- **Category:** UX
- **Decision:** The smallest useful evidence unit should be capturable first, with optional detail afterwards.
- **Rationale:** This preserves useful data while reducing friction.
- **Impact:** Module interactions should use progressive disclosure.
- **Supersedes:** Requiring full context before saving the first value.

### D-013 — Calories and macros are valid evidence

- **Date:** 2026-07-20
- **Category:** Product / Nutrition
- **Decision:** Clairity must include calorie and macro tracking.
- **Rationale:** Claire wants to understand relationships among nutrition, health, weight loss, symptoms, appetite and behaviour.
- **Impact:** Calories, protein, carbohydrate and fat are supported evidence inputs.
- **Supersedes:** Excluding calorie or macro evidence to avoid appearing like a diet app.

### D-014 — Clairity is not a calorie-only or diet app

- **Date:** 2026-07-20
- **Category:** Product / Tone
- **Decision:** Nutrition evidence must sit within a broader wellbeing model and must not define the product.
- **Rationale:** Weight and nutrition are important, but not the only outcomes or explanations that matter.
- **Impact:** Product language, navigation and insights must avoid moralising food or centring restriction.
- **Supersedes:** Any framing of success solely through calorie compliance or weight.

### D-015 — Evidence and insights should not be paywalled

- **Date:** 2026-07-20
- **Category:** Product
- **Decision:** Claire’s own evidence and generated insights should remain accessible without a paywall.
- **Rationale:** The product is a private personal tool, not a monetised consumer service.
- **Impact:** Architecture should not depend on subscription-gated access to core personal data.
- **Supersedes:** Any premium tier that restricts access to core evidence or insights.

### D-016 — Disengagement is evidence

- **Date:** 2026-07-20
- **Category:** Behaviour / Insights
- **Decision:** If Claire stops using Clairity, the product should later analyse the period before disengagement.
- **Rationale:** Drop-off may reveal excessive friction, low motivation, poor sleep, life disruption or an unsuitable routine.
- **Impact:** The system should preserve enough non-invasive usage metadata to support a later, non-judgemental review.
- **Supersedes:** Treating non-use only as failure or lost data.

### D-017 — Suggestions after disengagement must be non-judgemental

- **Date:** 2026-07-20
- **Category:** Tone / Insights
- **Decision:** Clairity may suggest changes that could make use easier after disengagement, but must avoid blame.
- **Rationale:** The goal is sustainable use and understanding, not compliance pressure.
- **Impact:** Wording should focus on friction, context and realistic adjustment.
- **Supersedes:** Guilt-based re-engagement.

### D-018 — Modular product architecture

- **Date:** 2026-07-21
- **Category:** Architecture / Product
- **Decision:** Clairity must be modular so evidence areas and life-stage capabilities can be added, enabled, disabled, archived or retired without significant rework.
- **Rationale:** Claire’s needs will change over time. For example, a pregnancy module may be added later while smoking may eventually become irrelevant.
- **Impact:** Modules must use shared platform contracts for storage, autosave, history, insights, export, privacy and enable/disable state.
- **Supersedes:** Permanently hard-coded evidence areas.

### D-019 — Retiring a module must preserve history

- **Date:** 2026-07-21
- **Category:** Data / Architecture
- **Decision:** Disabling or retiring a module must not delete historical data unless Claire explicitly chooses deletion.
- **Rationale:** Historical evidence remains valuable even when an active tracking need ends.
- **Impact:** Module status and data retention must be separate concepts.
- **Supersedes:** Removing a feature by deleting its stored records.

### D-020 — Shared services, not module-specific patch logic

- **Date:** 2026-07-21
- **Category:** Architecture
- **Decision:** Modules must integrate through common platform services rather than bespoke storage, navigation, save or insight paths.
- **Rationale:** Duplicate architecture makes future changes fragile and expensive.
- **Impact:** A registered-module architecture is preferred over parallel implementations.
- **Supersedes:** Patch fixes that introduce duplicate state or hidden exceptions.

### D-021 — Practical modularity, not a full plug-in platform

- **Date:** 2026-07-21
- **Category:** Architecture / Feasibility
- **Decision:** The first version should use centrally registered modules with a shared interface rather than a fully dynamic third-party plug-in system.
- **Rationale:** This provides extensibility without unnecessary complexity.
- **Impact:** Module definitions remain part of the codebase but are isolated and consistently integrated.
- **Supersedes:** Over-engineering a general plug-in marketplace or runtime.

### D-022 — Feasibility must be flagged continuously

- **Date:** 2026-07-20
- **Category:** Delivery
- **Decision:** Every meaningful feature, workflow, architecture choice or roadmap proposal must state feasibility.
- **Rationale:** Claire wants to understand whether an idea is straightforward, trade-off-heavy, risky, expensive or better deferred.
- **Impact:** Requirements and implementation proposals include feasibility notes.
- **Supersedes:** Presenting all ideas as equally easy or sensible to build now.

### D-023 — No patch architecture

- **Date:** 2026-07-21
- **Category:** Architecture / Delivery
- **Decision:** Local bugs or feature requests must not be solved by introducing conflicting or duplicate architecture.
- **Rationale:** Previous projects became unstable when fixes created parallel logic and broke existing functionality.
- **Impact:** Conflicts must be raised before implementation; root causes should be addressed coherently.
- **Supersedes:** “Make it work” fixes that bypass the established model.

### D-024 — Governing documents precede implementation

- **Date:** 2026-07-21
- **Category:** Delivery
- **Decision:** Product requirements, decision log, technical architecture and design system form the baseline before further coding.
- **Rationale:** The build needs a stable source of truth to prevent repeated reinterpretation.
- **Impact:** Coding tasks must be checked against all four documents.
- **Supersedes:** Coding directly from conversational fragments.

### D-025 — GitHub repository is the permanent project source

- **Date:** 2026-07-21
- **Category:** Delivery / Technical
- **Decision:** Approved governing documents should live in the root of the Clairity repository.
- **Rationale:** Chat-generated files are not a reliable permanent project store and coding agents need repository access to the rules.
- **Impact:** Repository copies become authoritative once committed.
- **Supersedes:** Treating temporary conversation attachments as the permanent source of truth.

### D-026 — Public code must not expose personal data

- **Date:** 2026-07-21
- **Category:** Privacy / Security
- **Decision:** A public GitHub repository must not contain personal health records, secrets, API keys or production credentials.
- **Rationale:** Clairity handles sensitive personal evidence.
- **Impact:** Code and personal data must be separated. Production data must not be committed.
- **Supersedes:** Using the repository itself as a personal-data store.

### D-027 — Local-first is acceptable for prototype, not a complete backup strategy

- **Date:** 2026-07-21
- **Category:** Architecture / Feasibility
- **Decision:** Local browser storage is acceptable for early prototypes but is not sufficient as the final security, backup or sync solution.
- **Rationale:** Browser data can be cleared, devices can be lost and cross-device sync is limited.
- **Impact:** The initial architecture should allow a later secure sync layer without rewriting modules.
- **Supersedes:** Treating localStorage alone as the permanent production design.

### D-028 — Clairity is not a diagnostic product

- **Date:** 2026-07-21
- **Category:** Product / Safety
- **Decision:** Clairity may identify patterns and hypotheses but must not diagnose medical conditions or claim clinical certainty.
- **Rationale:** Observational personal data cannot safely substitute for medical assessment.
- **Impact:** Insight language must communicate limitations and encourage appropriate professional support where relevant.
- **Supersedes:** Medical-grade causal or diagnostic interpretation.

---

## Superseded decisions index

| Earlier idea | Superseded by |
|---|---|
| Reduce questions when energy is low | D-007 |
| Generic “How are you feeling?” prompt | D-003 |
| One large daily check-in | D-004 |
| Required Save/Submit | D-005 |
| Required Finish action | D-006 |
| Calorie tracking excluded to avoid diet framing | D-013 and D-014 |
| No visible cause means no explanation | D-010 |
| App non-use is only failure | D-016 and D-017 |
| All evidence areas are permanent | D-018 and D-019 |
| Isolated patch fixes are acceptable | D-020 and D-023 |
| Temporary chat files are the permanent project store | D-025 |

---

## Maintenance rule

Add a new decision when:

- product behaviour changes;
- an open question is resolved;
- an architectural constraint is introduced;
- a previous decision is superseded;
- a feasibility judgement materially changes scope;
- implementation reveals a requirement conflict.

Do not rewrite history. Add a new decision that explicitly supersedes the earlier one.


### D-029 — Product Constitution approved

- **Date:** 2026-07-23
- **Category:** Governance
- **Decision:** The Product Constitution is the highest authority for Clairity and contains the approved non-negotiable product principles.
- **Rationale:** Future product and coding work needs a stable test for conflicts that is more durable than individual feature requirements.
- **Impact:** Conflicting changes require explicit approval and a major version update.
- **Supersedes:** Constitution text embedded only within the PRD.

### D-030 — Governance documents live in `/docs`

- **Date:** 2026-07-23
- **Category:** Delivery
- **Decision:** Governing documents will live in a numbered `/docs` directory, with `README.md` at repository root.
- **Rationale:** Numbered files provide a clear reading order and scale better as documentation expands.
- **Impact:** Coding agents and contributors must start with the root README and follow the governance reading order.
- **Supersedes:** Storing all governance documents at repository root.

### D-031 — Semantic versioning approved

- **Date:** 2026-07-23
- **Category:** Delivery
- **Decision:** Clairity documentation and releases use semantic versioning.
- **Rationale:** Changes need a predictable indication of compatibility and significance.
- **Impact:** Major versions cover philosophy or breaking architecture changes; minor versions cover approved modules or significant capabilities; patch versions cover non-breaking clarifications and fixes.
- **Supersedes:** Informal document versioning.

### D-032 — Separate backlog from approved requirements

- **Date:** 2026-07-23
- **Category:** Governance
- **Decision:** Deferred, proposed and exploratory ideas live in `06_BACKLOG.md` and do not become requirements without approval.
- **Rationale:** This prevents ideas from being implemented accidentally.
- **Impact:** Backlog entries require an explicit promotion decision before entering the PRD.
- **Supersedes:** Mixing open ideas into approved scope.

### D-033 — Architecture Decision Records for material technical choices

- **Date:** 2026-07-23
- **Category:** Architecture / Governance
- **Decision:** Material technical choices use short Architecture Decision Records under `docs/adr/`.
- **Rationale:** The Decision Log records product-wide decisions, while ADRs provide focused technical context, alternatives and consequences.
- **Impact:** Initial ADRs cover modular architecture, local-first persistence and autosave.
- **Supersedes:** Relying on a single high-level architecture document for all technical rationale.

