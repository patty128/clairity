# Clairity Technical Architecture

**Version:** 1.0.0  
**Status:** Approved baseline  
**Owner:** Claire  
**Last updated:** 2026-07-23  
**Depends on:** `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_DECISION_LOG.md`  

---

## Document responsibility

This document defines **how approved Clairity requirements are structured technically**. It must not create new product behaviour.

## Change history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-23 | Initial approved governance baseline |

---

# 1. Architecture goals

Clairity must be:

- modular;
- local-first initially;
- privacy-conscious;
- resilient to interrupted use;
- easy to extend without significant rework;
- capable of preserving historical data when modules are retired;
- suitable for mobile browser use;
- structured for a later secure sync layer;
- explicit about feasibility and trade-offs.

---

# 2. Architecture principles

1. One source of truth for each state.
2. No duplicate business logic.
3. No module-specific storage engines.
4. No manual-save dependency.
5. No hidden default answers for missing evidence.
6. No destructive module retirement.
7. No personal data committed to GitHub.
8. No architecture changes without checking the governing documents.
9. No patch fixes that create parallel state or conflicting flows.
10. Shared platform services must be reused by every module.

---

# 3. High-level structure

Clairity should use four layers:

## 3.1 Presentation layer

Responsible for:

- screens;
- reusable UI components;
- module logging controls;
- validation feedback;
- save-state feedback;
- accessibility;
- responsive behaviour.

The presentation layer must not directly manage persistence.

## 3.2 Application layer

Responsible for:

- module registration;
- commands such as create, update, archive and delete;
- autosave orchestration;
- validation;
- history queries;
- insight requests;
- enable/disable state;
- user preferences.

## 3.3 Domain layer

Responsible for:

- evidence records;
- module definitions;
- measurement types;
- missing-data semantics;
- event timing;
- insight definitions;
- confidence and provenance;
- privacy-sensitive rules.

The domain layer should remain independent from any specific browser database or cloud provider.

## 3.4 Infrastructure layer

Responsible for:

- IndexedDB or equivalent local persistence;
- export and import;
- backup adapters;
- future encrypted sync;
- error logging that contains no sensitive payloads;
- optional integration adapters.

---

# 4. Modular architecture

## 4.1 Module registry

Modules should be centrally registered.

Each module definition should expose a shared contract such as:

```ts
interface ClairityModule {
  id: string;
  version: number;
  name: string;
  description?: string;
  category: ModuleCategory;
  status: "available" | "enabled" | "hidden" | "retired";
  measures: MeasureDefinition[];
  entryEditor: ComponentReference;
  historyRenderer?: ComponentReference;
  insightDefinitions?: InsightDefinition[];
  defaultPreferences: ModulePreferences;
  migrations?: ModuleMigration[];
}
```

The exact language and framework may change, but the contract concept is mandatory.

## 4.2 Module lifecycle

A module can be:

- available;
- enabled;
- hidden temporarily;
- retired from active use;
- re-enabled;
- deleted only through an explicit destructive-data action.

Retirement must not remove historical data.

## 4.3 Example modules

Initial or potential modules include:

- Core daily state;
- Sleep;
- Nutrition;
- Weight;
- Symptoms;
- Smoking;
- Binge eating;
- Activity;
- Alcohol;
- Medication and supplements;
- Menstrual cycle;
- Pregnancy;
- Notes and context.

The MVP set remains a product decision, not an architectural assumption.

## 4.4 Shared module services

Every module should use the same shared services for:

- persistence;
- autosave;
- validation;
- history;
- editing;
- export;
- retrospective entries;
- prompts;
- insight generation;
- enable/disable state;
- deletion;
- privacy controls.

A module must not create its own independent persistence pattern.

---

# 5. Data model

## 5.1 Evidence record

A flexible but strongly typed evidence record should support:

```ts
interface EvidenceRecord<TValue = unknown> {
  id: string;
  moduleId: string;
  measureId: string;
  value: TValue;
  unit?: string;
  eventStartedAt?: string;
  eventEndedAt?: string;
  observedAt: string;
  recordedAt: string;
  updatedAt: string;
  source: "manual" | "import" | "calculated";
  certainty?: "exact" | "estimated" | "unknown";
  context?: Record<string, unknown>;
  note?: string;
  status: "active" | "corrected" | "deleted";
  schemaVersion: number;
}
```

## 5.2 Why multiple timestamps are required

- `observedAt`: when the evidence applies.
- `recordedAt`: when Claire entered it.
- `updatedAt`: when it was last edited.
- optional start/end: for events or periods.

This supports forgotten context, delayed entry and retrospective correction.

## 5.3 Missingness

Missing data must not be represented by numeric zero or empty text where that changes meaning.

Use explicit states where relevant:

- unrecorded;
- unknown;
- not applicable;
- deliberately skipped;
- none;
- estimated.

## 5.4 Module state

```ts
interface UserModuleState {
  moduleId: string;
  status: "enabled" | "hidden" | "retired";
  enabledAt?: string;
  retiredAt?: string;
  preferences: Record<string, unknown>;
}
```

## 5.5 Provenance

Calculated or imported values should retain:

- source;
- calculation version;
- originating records;
- import provider where applicable.

This is necessary so insights can explain where a value came from.

---

# 6. Local persistence

## 6.1 Recommended prototype store

Use IndexedDB through a small repository abstraction.

**Feasibility:** Straightforward.

Why:

- supports structured records;
- supports larger datasets than localStorage;
- supports indexes and transactions;
- is suitable for offline use;
- can later be wrapped by export and sync adapters.

## 6.2 Repository abstraction

The application should depend on interfaces such as:

```ts
interface EvidenceRepository {
  create(record: EvidenceRecord): Promise<void>;
  update(record: EvidenceRecord): Promise<void>;
  getById(id: string): Promise<EvidenceRecord | null>;
  query(query: EvidenceQuery): Promise<EvidenceRecord[]>;
  softDelete(id: string): Promise<void>;
}
```

No component should call IndexedDB directly.

## 6.3 Schema repair and additive upgrades

Every IndexedDB schema change must increment the database version, even when the code only adds a definition store. Upgrade handlers must be additive and idempotent: preserve existing records, create any missing canonical stores, and repair required indexes.

Backup export must inspect the stores that actually exist on the open database connection. A missing optional definition store must be represented as an empty array rather than causing the complete encrypted backup to fail. Core app startup must still verify that the canonical schema exists after upgrade.

## 6.4 localStorage use

localStorage may be used only for lightweight, non-sensitive preferences such as:

- theme;
- last open screen;
- simple UI preferences.

It should not be the main evidence store.

---

# 7. Autosave architecture

## 7.1 Behaviour

Each meaningful valid interaction should:

1. update local UI state;
2. validate the value;
3. persist through the application service;
4. show a subtle saving state;
5. confirm success;
6. retain a retryable error state if persistence fails.

## 7.2 Requirements

- No final submit required.
- Repeated taps must not create duplicate records.
- Updates should use stable record identifiers.
- Debouncing may be used for free text.
- Discrete selections should save immediately.
- Navigation away must not silently discard a valid change.

## 7.3 Failure handling

If save fails:

- keep the unsaved value in memory;
- show a calm non-blocking warning;
- retry where safe;
- do not claim the value was saved;
- avoid logging sensitive content to external services.

---

# 8. History and editing

History queries should support:

- chronological ordering;
- date range;
- module;
- measure;
- event time;
- recorded time;
- active/corrected status.

Edits should not silently destroy provenance. For significant corrections, the system may retain an internal revision record.

**Feasibility:** Straightforward for basic history; feasible with trade-offs for full revision history.

---

# 9. Insight architecture

## 9.1 Staged approach

### Stage 1 — Descriptive

- totals;
- averages;
- distributions;
- timelines;
- missing-data coverage;
- simple comparisons.

**Feasibility:** Straightforward.

### Stage 2 — Associative

- same-day correlations;
- lagged relationships;
- repeated sequences;
- before/after windows;
- possible confounders.

**Feasibility:** Feasible with trade-offs.

### Stage 3 — Hypothesis support

- candidate explanations;
- missing-context prompts;
- evidence-strength summaries;
- suggested questions to investigate.

**Feasibility:** Feasible with trade-offs and careful safeguards.

## 9.2 Insight result contract

```ts
interface Insight {
  id: string;
  title: string;
  summary: string;
  type: "descriptive" | "association" | "hypothesis";
  confidence: "low" | "moderate" | "high";
  supportingRecordIds: string[];
  limitations: string[];
  alternativeExplanations?: string[];
  generatedAt: string;
  engineVersion: string;
}
```

## 9.3 No causal claims

The insight engine must not convert correlation into causation.

It should use wording such as:

- appeared alongside;
- preceded;
- followed;
- may be associated;
- possible explanation;
- insufficient evidence.

## 9.4 Missing-context engine

When an outcome lacks an explanation, the engine should consider:

- missing records;
- delayed effects;
- retrospective context;
- measurement coverage;
- overlapping changes;
- insufficient sample size.

---

# 10. Adaptive interaction architecture

Adaptation should be driven by UI preferences and recent recorded context, not by changing the evidence schema.

Acceptable adaptations:

- compact controls;
- one item at a time;
- optional detail collapsed;
- ordering likely actions first;
- lower visual density;
- later prompts for context.

The system should record limited interaction metadata where useful:

- prompt shown;
- mode used;
- optional detail opened;
- entry skipped;
- retrospective entry.

This metadata must be proportionate and private.

**Feasibility:** Feasible with trade-offs.

---

# 11. Export, backup and restore

## 11.1 MVP export

Support export to a portable format such as:

- JSON for complete structured backup;
- CSV for selected evidence views.

**Feasibility:** Straightforward.

## 11.2 Restore

Restore should validate:

- schema version;
- module versions;
- duplicate identifiers;
- corrupted data;
- migration requirements.

**Feasibility:** Feasible with trade-offs.

## 11.3 Future secure sync

A later sync layer should be added behind an adapter so modules do not change.

Potential capabilities:

- authenticated account;
- encrypted transit;
- encrypted storage;
- device reconciliation;
- conflict resolution;
- backup history.

**Feasibility:** Feasible with trade-offs; should be deferred until the local data model is stable.

---

# 12. Security and privacy

1. Never commit personal evidence to GitHub.
2. Never commit API keys or production credentials.
3. Avoid third-party analytics by default.
4. External error logging must exclude sensitive values.
5. Export and deletion must be user-controlled.
6. Any cloud provider must be assessed for data handling and UK/EU privacy implications.
7. Authentication alone is not sufficient; storage and access patterns also matter.
8. The app must clearly state where data is stored.

---

# 13. Suggested project structure

```text
/
├── PRODUCT_REQUIREMENTS.md
├── DECISION_LOG.md
├── TECHNICAL_ARCHITECTURE.md
├── DESIGN_SYSTEM.md
├── src/
│   ├── app/
│   ├── components/
│   ├── domain/
│   ├── modules/
│   │   ├── registry.ts
│   │   ├── core-daily/
│   │   ├── sleep/
│   │   ├── nutrition/
│   │   ├── smoking/
│   │   └── ...
│   ├── services/
│   │   ├── autosave/
│   │   ├── insights/
│   │   ├── export/
│   │   └── prompts/
│   ├── storage/
│   ├── design-system/
│   └── tests/
└── ...
```

The exact structure depends on the chosen framework, but separation of modules, shared services, domain and storage is required.

---

# 14. Testing strategy

## 14.1 Unit tests

Test:

- evidence validation;
- missingness;
- timestamp handling;
- module lifecycle;
- insight calculations;
- migrations;
- export/import.

## 14.2 Integration tests

Test:

- interaction to autosave;
- edit and reload;
- retrospective entry;
- enabling/disabling modules;
- retiring and re-enabling modules;
- preserving history;
- storage migration.

## 14.3 End-to-end tests

Test mobile-critical journeys:

- quick daily logging;
- interrupted session;
- edit earlier entry;
- export;
- disable module;
- recover from save failure.

---

# 15. Migration strategy

Every evidence record and module should include a schema version.

Migrations must be:

- explicit;
- testable;
- reversible where practical;
- non-destructive by default;
- applied before incompatible data is read.

Adding a pregnancy module should not require migration of unrelated smoking or nutrition records.

---

# 16. Feasibility register

| Capability | Assessment | Notes |
|---|---|---|
| Registered modular architecture | Straightforward | Best established before modules multiply |
| IndexedDB local-first storage | Straightforward | Suitable for prototype and offline use |
| Autosave | Straightforward | Requires repository abstraction and reliable error state |
| Basic export | Straightforward | JSON first, CSV views later |
| Module retirement preserving history | Straightforward | Status separate from data deletion |
| Retrospective entries | Straightforward | Multiple timestamps required |
| Basic descriptive insights | Straightforward | Depends on consistent schemas |
| Lagged and cumulative insights | Feasible with trade-offs | Needs enough observations and careful methodology |
| Adaptive friction | Feasible with trade-offs | Must not alter core evidence |
| Secure cloud sync | Feasible with trade-offs | Backend, auth, encryption and conflicts |
| Fully private on-device AI | Risky / expensive | Better deferred |
| Medical-grade analysis | Out of scope | Not a diagnostic product |

---

# 17. Architecture gate for coding tasks

Before implementation, the coding agent must:

1. Read all four governing documents.
2. Identify affected modules and shared services.
3. Confirm the request does not create duplicate state.
4. Confirm historical data remains valid.
5. State feasibility and trade-offs.
6. Raise conflicts before coding.
7. Update documentation when a decision changes.



# 18. Client navigation and render concurrency

Top-level navigation must use one shared navigation function. Individual navigation controls must not call page renderers directly.

The navigation service must:

- update selected-route chrome immediately;
- serialise asynchronous page renders;
- retain the latest requested route while an earlier render is running;
- render the latest route after the current render completes;
- prevent an older asynchronous render from becoming the final visible page;
- reuse the same route refresh path for focus and post-save refreshes;
- preserve a single navigation state rather than creating page-specific state.

This is required for iPhone Safari, where IndexedDB reads and DOM work can complete in a different order during rapid taps.

## 18.1 Navigation regression tests

Test:

- rapid Today → Review → History taps;
- repeated taps on the current page;
- navigation while a page is reading IndexedDB;
- returning to the app from the background;
- navigation immediately after saving evidence;
- active navigation state matching the final visible page.


## Mobile encrypted-backup compatibility

Encrypted backup key derivation must use Web Crypto PBKDF2 `deriveBits` followed by AES-GCM key import for Safari compatibility. Backup creation must fail with actionable context when Web Crypto is unavailable, must not alter evidence save status, and must keep file delivery as a separate user-initiated action.
