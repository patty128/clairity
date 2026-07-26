# Clairity Product Requirements

**Version:** 1.0.0  
**Status:** Approved baseline  
**Owner:** Claire  
**Last updated:** 2026-07-23  
**Depends on:** `01_PRODUCT_CONSTITUTION.md`  
**Related:** `03_DECISION_LOG.md`, `04_TECHNICAL_ARCHITECTURE.md`, `05_DESIGN_SYSTEM.md`

---

## Document responsibility

This document defines **what Clairity must do and what is in or out of product scope**.

It does not own:

- the rationale for decisions — see the Decision Log;
- implementation structure — see Technical Architecture;
- visual and interaction specifications — see Design System;
- unapproved or deferred ideas — see Backlog.

## Change history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-23 | Initial approved governance baseline |

---

# 1. Product Vision

## 2.1 Problem

Claire currently has health, nutrition, symptom, sleep, motivation and behaviour information distributed across memory, conversations, notes, apps and isolated measurements. This makes it difficult to understand:

- what changed;
- when it changed;
- what else was happening at the same time;
- whether a pattern repeats;
- whether an apparent cause is supported by evidence;
- whether missing context explains an outcome;
- what preceded disengagement, relapse or loss of motivation.

## 2.2 Intended outcome

After sustained use, Clairity should help Claire answer questions such as:

- What usually precedes binge eating?
- How do sleep duration and sleep timing relate to appetite, smoking, motivation and activity?
- Which foods, exposures or behaviours repeatedly precede symptoms?
- What changed before weight loss stalled or weight increased?
- Does a behaviour appear to be a cause, a consequence or merely correlated?
- What happens in the days before disengagement from tracking?
- What information tends to be missing when outcomes cannot be explained?
- Which routines are realistic and sustainable for Claire personally?

## 2.3 Product boundaries

Clairity should not:

- diagnose medical conditions;
- claim causal certainty from observational data;
- shame, guilt or punish Claire;
- use streak loss as pressure;
- define success solely by weight, calories or compliance;
- frame missing data as failure;
- optimise for public growth, onboarding or retention of other users;
- introduce social comparison;
- require perfect or complete data before being useful.

---

# 2. User and Scope

## 3.1 User model

- One user: Claire.
- No multi-user accounts are required.
- No public profile is required.
- No social or community features are required.
- Product decisions should be optimised for Claire’s actual routines, preferences and long-term commitment.

## 3.2 Platform

### Confirmed

- The app is intended for Claire’s phone.
- Development must be possible initially using an iPhone and browser-based tools.
- The current repository is hosted on GitHub.
- The current web app is published through GitHub Pages.

### Feasibility

- A static GitHub Pages app is straightforward for early prototypes.
- Truly private cloud-backed health data is not adequately solved by a public static repository alone.
- A public repository must not contain personal health records, secrets, API keys or production credentials.
- Secure sync, authentication and encrypted remote storage require a later architecture decision.

---

# 3. Information Architecture

## 4.1 Confirmed top-level product areas

The following broad areas have been proposed and remain consistent with the product vision:

- Today
- History
- Insights
- Settings

Their detailed structure is not yet fully approved.

## 4.2 Today

The Today experience should provide direct access to independent logging actions rather than funnel Claire through one check-in flow.

It should make it easy to see:

- what has already been recorded today;
- what core evidence is still unrecorded;
- recent or relevant context;
- the quickest useful action now.

It must not use a single vague “How are you feeling?” card or a required “Start check-in” button.

## 4.3 History

History should eventually allow Claire to review past entries in a useful time context.

Potential capabilities discussed:

- calendar;
- reverse-chronological history, with the most recent evidence first;
- search;
- filtering by evidence type.

These require further design decisions before implementation.

### 4.3.1 Evidence ordering

Where evidence is presented as a list, history or review of past data, the newest date must appear first. An intentionally time-of-day-based daily timeline may remain earliest-to-latest within the selected day, but it must not change the ordering of historical dates.

## 4.4 Insights

Insights should present observed relationships and trends while preserving uncertainty.

Insight design must clearly separate:

- descriptive trends;
- correlations;
- time-lagged associations;
- hypotheses;
- missing-data limitations.

## 4.5 Settings

Settings will eventually include personalisation, privacy, data management and integrations. Exact scope remains open.

---

# 4. Modular Product Structure

## 5.1 Modular design requirement

Clairity must be designed as a modular system rather than a fixed collection of permanent features.

A module is a self-contained evidence or life-stage area that can be added, enabled, disabled, archived or removed from active use without requiring significant changes elsewhere in the app.

Examples include:

- smoking;
- pregnancy;
- menstrual cycle;
- nutrition;
- symptoms;
- medication and supplements;
- activity;
- alcohol;
- weight.

## 5.2 Module lifecycle

A module may be:

- available but not enabled;
- enabled and actively used;
- temporarily hidden;
- retired from active use;
- re-enabled later;
- archived while preserving its historical data.

Disabling or retiring a module must not erase its previous entries, insights or history unless Claire explicitly requests deletion.

## 5.3 Shared module contract

Each module should integrate with common platform capabilities through a consistent structure, including where relevant:

- Today-screen logging;
- autosave;
- history;
- editing;
- reminders or prompts;
- export;
- insights;
- missing-data handling;
- privacy controls;
- retrospective entries;
- enable/disable state.

A new module should reuse these shared capabilities rather than introducing duplicate storage, navigation, save or insight logic.

## 5.4 Life-stage modules

Clairity should support future life-stage modules, including pregnancy, without requiring the existing app to be rebuilt.

A pregnancy module could later introduce evidence such as:

- gestational stage;
- symptoms;
- appointments;
- medication or supplement changes;
- nutrition context;
- sleep and energy changes;
- weight context;
- movement or activity changes.

The exact pregnancy scope is not yet agreed. The architectural ability to add such a module is an agreed requirement.

## 5.5 Feasibility

A modular front-end and data model are feasible with trade-offs and should be established early.

True plug-in-style installation is likely unnecessary for the first version. A practical initial approach is a shared module interface with centrally registered modules. This provides extensibility without the cost and risk of a fully dynamic plug-in platform.

---

# 5. Evidence Model

## 6.1 Core daily evidence

The following have been treated as high-priority daily signals:

- sleep;
- mood;
- energy;
- motivation;
- appetite.

### Required rule

The same core evidence should remain available and consistently measurable regardless of Claire’s current energy, motivation or mood.

### Open detail

The precise scale, labels, frequency and timing for each signal are not yet approved.

## 6.2 Nutrition

### Confirmed

Clairity must include calorie and macro tracking.

Calories and macros are valid evidence inputs because Claire wants to understand relationships among:

- nutrition;
- health;
- weight loss;
- symptoms;
- appetite;
- behaviour.

### Required framing

- Clairity must not present itself as a calorie-only or diet app.
- Calories and macros must sit alongside other relevant evidence.
- Nutrition data should support pattern discovery rather than moral judgement.
- The app should preserve the ability to record incomplete or estimated nutrition data.

### Likely evidence fields requiring later approval

- calories;
- protein;
- carbohydrate;
- fat;
- meals or eating events;
- food items;
- hunger before eating;
- fullness after eating;
- unplanned eating;
- binge-eating event;
- contextual notes.

## 6.3 Behavioural evidence

Previously discussed evidence includes:

- smoking;
- alcohol;
- activity;
- binge eating;
- app use and disengagement;
- motivation;
- routines;
- notes.

### Disengagement requirement

If Claire stops using Clairity, the app should later analyse the period before disengagement to identify likely causes of drop-off and suggest changes that could make future use easier or more sustainable.

This analysis must:

- avoid blame;
- recognise that disengagement is itself useful evidence;
- consider sleep, mood, motivation, friction, recent logging burden and life context;
- distinguish recorded evidence from speculation;
- acknowledge missing information.

## 6.4 Health and body evidence

Previously discussed evidence includes:

- symptoms;
- medication;
- supplements;
- weight;
- menstrual cycle;
- sleep;
- appetite;
- activity.

Exact symptom taxonomy and medical-data scope remain open.

## 6.5 Context and missing information

Clairity should support contextual evidence because health and behaviour outcomes may be delayed or affected by factors not logged at the same time.

The analysis model should be capable of considering:

- delayed effects;
- cumulative exposure;
- forgotten events;
- incomplete entries;
- changes in routine;
- travel or unusual schedules;
- medication or supplement changes;
- sleep timing as well as duration;
- stress or social context;
- app disengagement.

---

# 6. Daily Logging Experience

## 7.1 Independent actions

Each evidence category should be independently recordable.

Expected pattern:

1. Open or select an evidence item.
2. Record the value.
3. Autosave immediately.
4. Return automatically or remain available for optional detail.

## 7.2 Progressive detail

The first interaction should capture the smallest useful evidence unit.

Additional detail should be optional unless it is necessary to interpret the data safely.

Example:

- Record energy quickly.
- Optionally add timing, context or notes.
- Do not force a long form before saving the energy value.

## 7.3 Missing entries

Missing evidence must remain visibly distinct from:

- zero;
- none;
- not applicable;
- unchanged;
- unknown;
- deliberately skipped.

The app must not infer an answer from non-interaction.

## 7.4 Editability

Previously recorded entries should be editable.

The data model should preserve enough information to distinguish:

- when the event occurred;
- when it was recorded;
- when it was edited.

This is important because Claire may log forgotten context later.

## 7.5 Autosave

Autosave is mandatory.

The UI should:

- save after every meaningful change;
- communicate save progress subtly;
- recover from interrupted sessions;
- avoid duplicate records caused by repeated taps;
- not require a final submission.

---

# 7. Language and Tone

## 8.1 Required language style

The app should be:

- specific;
- calm;
- neutral;
- curious;
- non-judgemental;
- concise.

## 8.2 Prohibited patterns

Avoid:

- “How are you feeling?”
- guilt-based reminders;
- moral labels such as “good” or “bad” food/day;
- celebratory language that implies thinness or restriction is inherently good;
- failure language for missed logging;
- claims such as “X caused Y” without sufficient evidence;
- generic motivational clichés;
- nagging.

## 8.3 Insight language

Preferred forms include:

- “This appeared alongside…”
- “This pattern occurred on…”
- “There may be a relationship between…”
- “The data is limited because…”
- “A possible missing factor is…”
- “This is a hypothesis, not a conclusion.”

---

# 8. Analysis and Insight Behaviour

## 9.1 Evidence hierarchy

Clairity should give greatest confidence to patterns that are:

- repeated;
- based on enough observations;
- temporally plausible;
- supported by multiple relevant evidence types;
- robust to missing data;
- not explained by an obvious confounder.

## 9.2 Time relationships

Analysis should not be limited to same-day comparisons.

It should eventually support:

- same-day relationships;
- next-day effects;
- multi-day lag;
- cumulative exposure;
- repeated sequences;
- before-and-after windows.

## 9.3 Confidence

Every insight should communicate confidence or evidence strength.

The precise confidence framework remains open, but it should account for:

- number of observations;
- consistency;
- missing data;
- competing explanations;
- measurement quality;
- time alignment.

## 9.4 No unexplained “no pattern” conclusion

Where the evidence does not explain an outcome, Clairity should not simply state that nothing is related.

It should consider:

- whether important evidence was not recorded;
- whether the relevant cause may be delayed;
- whether the measure was too broad;
- whether the sample is too small;
- whether another variable changed at the same time.

## 9.5 Advice boundary

Clairity may help Claire interpret her own evidence and consider possible next actions.

It should not:

- diagnose;
- replace professional medical advice;
- imply clinical certainty;
- recommend unsafe restriction or medication changes.

---

# 9. Adaptive Interaction Without Bias

## 10.1 Confirmed principle

Clairity should adapt its interaction style and friction based on Claire’s recently recorded mood, energy, motivation, sleep and behavioural state.

## 10.2 Non-negotiable safeguard

Adaptation must not reduce the core evidence collected or make low-energy periods systematically less visible.

## 10.3 Acceptable adaptations

- prioritise one-tap capture;
- simplify wording;
- reduce screen density;
- present one core item at a time while keeping all core items available;
- hide optional detail behind expansion;
- remember preferred input method;
- allow later contextual additions;
- surface likely relevant actions based on time of day;
- avoid overwhelming reminders.

## 10.4 Analysis safeguard

The app should record enough metadata to evaluate whether its own adaptive UI affects logging behaviour.

Potential metadata:

- prompt shown;
- interaction mode used;
- time to answer;
- optional detail opened;
- entry skipped;
- reminder used;
- entry added retrospectively.

This is feasible with trade-offs and should be designed carefully to avoid excessive surveillance or complexity.

---

# 10. Notifications and Prompts

## 11.1 Confirmed principles

- Notifications must not guilt or nag.
- Prompts should be useful, specific and context-aware.
- Missing information should be invited, not demanded.

## 11.2 Open decisions

The following are not yet approved:

- whether the MVP includes notifications;
- permitted notification frequency;
- quiet hours;
- reminder scheduling;
- whether prompts are triggered by time, missing evidence or detected patterns.

---

# 11. Privacy and Security

## 12.1 Confirmed

- Clairity is private and for Claire only.
- Personal data must not be exposed through the public GitHub repository.
- No analytics or advertising service should be added by default.
- Claire should retain control over her data.

## 12.2 Required future capabilities

The product should eventually support:

- export;
- backup;
- restore;
- deletion;
- clear explanation of where data is stored.

## 12.3 Architecture caution

Local browser storage is straightforward for prototyping but carries risks:

- data loss if browser data is cleared;
- no reliable cross-device sync;
- limited backup;
- device loss risk;
- privacy depends on device access.

Secure private sync is feasible with trade-offs and should not be improvised without an architecture decision.

---

# 12. Design Direction

## 13.1 Confirmed direction

The interface should feel:

- calm;
- premium;
- editorial;
- modern;
- mobile-first;
- spacious enough to understand;
- compact enough for quick use.

## 13.2 Previously suggested but not fully approved

- “Modern Apple aesthetic”
- rounded cards;
- generous whitespace;
- restrained colour;
- dark mode as a first-class experience;
- smooth animations;
- large touch targets.

These should be treated as design direction rather than final design-system requirements until Claire approves the visual baseline.

## 13.3 Accessibility

The app should:

- use readable text;
- avoid relying on colour alone;
- provide adequate touch targets;
- support reduced motion;
- preserve contrast;
- avoid overly dense forms.

---

# 13. Technical and Development Principles

## 14.1 Repository and implementation

- Repository name: Clairity.
- Current implementation: web app.
- Current hosting: GitHub Pages.
- Development currently occurs through GitHub and github.dev.

## 14.2 Architecture rules

- one source of truth for each state;
- no duplicated business logic;
- no unexplained parallel storage systems;
- no patch architecture;
- reusable components where repetition is real;
- data structure must support retrospective entries and later edits;
- implementation must not contradict the PRD;
- architectural changes require explicit discussion;
- modules must use shared platform contracts rather than bespoke integration paths;
- enabling or disabling one module must not require significant changes to unrelated modules;
- historical module data must remain readable after a module is retired from active use.

## 14.3 Agent instruction

Every future coding task should begin with:

> Read `PRODUCT_REQUIREMENTS.md`, the technical architecture, design system and decision log. If the request conflicts with an agreed requirement, stop and explain the conflict before changing code.

## 14.4 Definition of done

A change is not complete until:

- the requested behaviour works;
- existing agreed behaviour still works;
- autosave is verified where relevant;
- mobile interaction is checked;
- empty, missing and partial states are handled;
- no duplicate state or logic was introduced;
- feasibility and trade-offs are documented;
- the PRD or decision log is updated when the product changed.

---

# 14. Feasibility Register

| Area | Current assessment | Notes |
|---|---|---|
| Static mobile web prototype | Straightforward | Suitable for early UI and local interaction |
| Immediate local autosave | Straightforward | IndexedDB is preferable to relying only on simple localStorage as complexity grows |
| Independent daily logging | Straightforward | Requires a consistent data model |
| Modular evidence and life-stage architecture | Feasible with trade-offs | Should use shared module contracts and central registration from the start |
| Calories and macro entry | Straightforward | Food database or barcode support would add cost and complexity |
| Basic history and trends | Straightforward | Depends on reliable structured data |
| Correlation analysis | Feasible with trade-offs | Must handle sparse data and avoid false certainty |
| Lagged and cumulative pattern analysis | Feasible with trade-offs | Requires sufficient history and careful statistical design |
| Adaptive UI without evidence bias | Feasible with trade-offs | Must preserve core measurement consistency |
| Disengagement analysis | Feasible with trade-offs | Needs local usage metadata and careful non-judgemental interpretation |
| Secure cloud sync | Feasible with trade-offs | Requires authentication, backend and privacy design |
| Fully private on-device AI | Risky / expensive for early versions | Better deferred unless a limited rules-based approach is sufficient |
| Medical-grade inference | Out of scope | Clairity is not a diagnostic product |
| Automated food recognition | Risky / better deferred | Accuracy, cost and privacy concerns |
| Public GitHub as production data layer | Not acceptable | Code may be public; personal data must not be |

---

# 15. Superseded Decisions and Rejected Patterns

The following ideas must not reappear unless explicitly reconsidered.

| Superseded or rejected idea | Current decision |
|---|---|
| Reduce questions when energy is low | Preserve core evidence; reduce interaction effort only |
| Ask “How are you feeling?” | Ask specific evidence questions |
| One large daily questionnaire | Independent multi-click logging |
| Required “Start check-in” | No start action |
| Required “Save” or “Submit” | Immediate autosave |
| Required “Finish check-in” | No completion required; optional marker only if later approved |
| Treat app as a calorie or diet app | Calories/macros are evidence within a broader wellbeing model |
| Conclude there is no cause when no recorded cause is visible | Consider missing, delayed or forgotten context |
| Treat disengagement only as failure | Analyse the period before disengagement as useful evidence |
| Build for generic users | Build for Claire only |
| Patch fixes or new local architecture to solve isolated issues | Preserve coherent architecture and raise conflicts |
| Treat every current evidence area as a permanent hard-coded feature | Use modules that can be enabled, disabled, added or retired without significant rework |

---

# 16. Open Decisions Requiring Claire’s Review

These are the current product decisions that cannot be safely inferred from the available history.

## OD-01 — Exact core daily evidence

Current likely set:

- sleep;
- mood;
- energy;
- motivation;
- appetite.

Decision needed:

- Are all five mandatory members of the consistent core dataset?
- Should any other measure be core from day one, such as stress, symptoms, smoking or binge urge?

## OD-02 — Measurement scales

For each core signal, define:

- scale length;
- labels;
- whether numbers are visible;
- whether a neutral or “unknown” option exists;
- whether multiple entries per day are allowed.

## OD-03 — Sleep structure

Decide which are required:

- bedtime;
- estimated sleep time;
- wake time;
- total duration;
- sleep quality;
- interruptions;
- naps;
- target bedtime;
- target duration.

## OD-04 — Home screen

Decide what Claire should understand within five seconds of opening Clairity.

This decision should cover:

- today’s status;
- outstanding core evidence;
- fast-log actions;
- recent pattern or context;
- whether nutrition is visible immediately;
- whether the screen changes by time of day.

## OD-05 — Nutrition entry method for MVP

Options include:

- manual calories and macros only;
- meal-level totals;
- reusable foods and meals;
- external app import;
- food database search;
- barcode scanning.

These vary significantly in complexity.

## OD-06 — Symptom model

Decide whether symptoms are:

- a fixed personal list;
- fully custom;
- grouped by body system;
- recorded as events or daily severity;
- capable of multiple readings per day.

## OD-07 — Binge-eating evidence

Decide preferred terminology, fields and sensitivity.

Potential evidence:

- urge;
- event;
- perceived loss of control;
- hunger beforehand;
- emotion/context;
- foods;
- duration;
- aftermath.

This must be useful without feeling punitive or clinically overreaching.

## OD-08 — Smoking evidence

Decide whether Claire wants to record:

- cigarette count;
- cravings;
- time of first cigarette;
- quit attempts;
- nicotine replacement;
- triggers;
- free-text notes.

## OD-09 — Weight presentation

Decide:

- whether weight is shown prominently;
- whether trends are smoothed;
- preferred units;
- whether day-to-day changes are deemphasised;
- how menstrual-cycle and water-retention context are shown.

## OD-10 — MVP boundary

A first release should not attempt every evidence type and insight feature at once.

Claire needs to approve the minimum useful first version.

---

# 17. Proposed MVP Baseline for Review — Not Yet Approved

This is a proposed starting scope, not an agreed requirement.

## Capture

- sleep;
- mood;
- energy;
- motivation;
- appetite;
- weight;
- smoking;
- binge-eating event or urge;
- calories;
- protein, carbohydrate and fat;
- symptoms;
- notes.

## Experience

- Today screen;
- independent logging cards;
- immediate autosave;
- edit today’s entries;
- recent history;
- simple weekly view;
- local device storage;
- data export.

## Initial insights

- descriptive trends only;
- simple side-by-side timelines;
- clear missing-data indicators;
- no causal claims;
- no advanced AI conclusions.

## Feasibility

Feasible with trade-offs. The capture scope may still be too broad for the first build and should be prioritised before implementation.

---

# 18. Decision Log

| Date | Decision | Status |
|---|---|---|
| 2026-07-20 | Clairity must include calories and macro tracking as evidence inputs, but must not be framed as a calorie-only or diet app. | Agreed |
| 2026-07-20 | Clairity should adapt interaction style and friction based on recently recorded state. | Agreed |
| 2026-07-20 | Adaptive interaction must not reduce core questions because that could bias the dataset. | Agreed |
| 2026-07-20 | When symptoms or outcomes persist without an obvious recorded cause, prompt consideration of missing, delayed, forgotten or unrecorded context. | Agreed |
| 2026-07-20 | If Claire disengages, analyse the period before disengagement and suggest changes that could make use easier. | Agreed |
| 2026-07-20 | Clairity is a private, single-user app for Claire only. | Agreed |
| 2026-07-20 | Feasibility must be flagged continuously. | Agreed |
| 2026-07-21 | Daily logging should use independent multi-click interactions, not one large check-in flow. | Agreed |
| 2026-07-21 | Do not ask the vague question “How are you feeling?” | Agreed |
| 2026-07-21 | Every interaction autosaves; no required Save, Submit, Start or Finish action. | Agreed |
| 2026-07-21 | Future code must adhere to previously agreed product decisions. | Agreed |
| 2026-07-21 | Product requirements should become the single source of truth before further implementation. | Agreed |
| 2026-07-21 | Clairity must use a modular design so capabilities such as pregnancy can be added and modules such as smoking can be retired without significant rework. | Agreed |

---

# 19. Review Instructions

Claire should review this draft for:

1. Any requirement that is factually wrong.
2. Any agreed requirement that is missing.
3. Any proposal incorrectly presented as agreed.
4. Any superseded idea that has not been marked as superseded.
5. The open decisions that should be answered before MVP scope is approved.

After review:

- corrections become v0.2;
- approved requirements become v1.0;
- architecture and design documents should be derived from the approved PRD rather than created independently.



## Cycle-specific absence rule

For menstrual-cycle evidence only, the absence of a bleeding or spotting record means that neither was recorded for that date. Clairity must not ask Claire to create a separate “Nothing” record. This is a deliberate module-specific exception and must not be generalised to mood, symptoms, nutrition, sleep, medication, supplements, movement, weight or other evidence areas.

Cycle calendar views must allow navigation from six months before through six months after the current month. Fertile-window and potential-ovulation information must use the established purple fertility treatment wherever surfaced.
