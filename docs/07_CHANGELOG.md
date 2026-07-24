# Clairity Changelog

All notable changes to Clairity governance, product scope and releases will be recorded here.

Clairity uses [Semantic Versioning](https://semver.org/) in the following way:

- **Major:** product philosophy, constitutional or breaking architecture change;
- **Minor:** approved new module or significant capability;
- **Patch:** non-breaking clarification, defect correction or wording improvement.

## [2.0.0-alpha.2] — 2026-07-24

### Added

- Expanded Sleep evidence with estimated sleep time, calculated sleep duration, interruptions, estimated awake minutes and nap context.
- Optional target bedtime and target sleep duration settings.
- A Today sleep overview showing the latest recorded duration, timing, quality and optional targets.
- A preferred Weight display unit while retaining the original unit on every evidence record.
- A neutral Today weight overview with cycle context and a seven-day rolling-average comparison when enough evidence exists.
- Retrospective date and time fields for Weight evidence.

### Changed

- Sleep duration is calculated from estimated sleep time when available, otherwise from bedtime, and subtracts recorded awake minutes.
- Weight trends convert mixed-unit history for display without rewriting the original records.
- Review uses the smoothed seven-day weight comparison rather than foregrounding first-to-last daily change.
- Application and asset versions identify the second Clairity 2.0 alpha slice.

### Compatibility

- No IndexedDB schema change.
- Earlier Sleep records without the new optional fields remain readable and editable.
- Existing Weight records retain their stored values and units.

## [2.0.0-alpha.1] — 2026-07-24

### Added

- Independent Motivation evidence with date, time, five-point scale and optional context.
- Independent Appetite evidence with date, time, five-point scale and optional context.
- A Today core-evidence panel for Mood, Energy, Motivation and Appetite, supporting repeated observations during the day.

### Changed

- The combined Daily State card is no longer the primary capture route.
- Existing combined Daily State records remain visible and editable as a clearly labelled earlier format.
- Today context recognises either independent core evidence or an existing combined Daily State record.
- Application and asset versions now identify the first Clairity 2.0 alpha slice.

### Compatibility

- No IndexedDB schema change.
- Existing evidence, settings, routines, supplements, medications, backups and restores remain compatible.

## [1.3.0] — 2026-07-24

### Added

- A Review area with 7, 30 and 90-day evidence ranges, selectable evidence filters, summary cards and a chronological comparison view.
- Optional calorie and macro targets with progress shown alongside daily nutrition totals.
- Reusable saved meals that can be inserted into a new nutrition entry and adjusted without changing the saved original.
- A neutral daily context indicator showing which evidence areas have records, including a missing-context note when symptoms are recorded without sleep, nutrition or daily-state context.
- Fertile-window, potential-ovulation and today markers within the main Cycle ring.

### Changed

- The Cycle visual is now exclusive to the Cycle area.
- Today shows cycle information only when the next period is estimated within three days or bleeding was recorded today or yesterday. Recorded bleeding takes priority over estimates.
- The daily-state card now uses neutral evidence-led wording rather than asking “How are you today?”.
- Insights navigation is renamed Review to reflect comparison of recorded evidence without causal claims.

### Notes

- Review summaries describe associations and recorded timing only; they do not infer causation.
- This release makes no IndexedDB schema change and preserves existing evidence records.

## [1.2.0] — 2026-07-24

### Added

- A dedicated Cycle area with a cycle-day dashboard, monthly calendar, period history and conservative estimates for the next period, fertile window and potential ovulation.
- Expanded menstrual logging for flow, cramps, pelvic pain, possible ovulation-type pain and optional notes, without adding colour, clot, discharge or within-day flow tracking.
- Daily nutrition totals for calories, protein, carbohydrates and fat, plus recent-meal duplication and optional portion details.
- A compact daily state check-in for mood, energy, motivation, appetite, stress and cravings.
- Password-protected local backup export and validated restore using Web Crypto, including an automatic pre-restore safety export.

### Changed

- Main navigation now includes a dedicated Cycle destination.
- Cycle predictions are clearly labelled as estimates and can be hidden in Settings.
- Daily state and menstrual entries use one stable record per date to avoid duplicate daily records.
- Settings now includes a Data Protection section and the last successful backup date.

### Notes

- Cycle estimates do not confirm ovulation and must not be used as contraception guidance.
- This release makes no IndexedDB schema change and preserves existing evidence records.

## [1.1.0] — 2026-07-24

### Added

- An About section in Settings showing the app version, IndexedDB version and local storage model.
- Visible focus states and reduced-motion support for accessibility.

### Changed

- Refined the full interface with a more polished, premium visual hierarchy while preserving the existing navigation and workflows.
- Improved card depth, spacing, typography, form controls, timeline rows, bottom navigation, sheets, buttons and save-state presentation.
- Improved responsive behaviour on narrow mobile screens and larger desktop browser windows.
- Added version query strings to application assets to reduce stale browser caching between releases.

## [1.0.1] — 2026-07-23

### Changed

- Evidence records are validated automatically immediately before saving, without adding confirmation prompts or a review step.
- Menstruation records now use one stable record per date so changing the same day updates the existing daily entry rather than creating duplicates.
- Menstruation entries use the consistent category label “Menstruation” in the timeline and History.

### Fixed

- Menstruation entries no longer display empty or legacy placeholder values such as `None None`.
- Repeated taps on the Done button cannot submit the same form more than once while a save is in progress.
- Save failures keep the form open and show a contained error instead of closing and losing the unsaved entry.

## [1.0.0] — 2026-07-23

### Added

- Approved Product Constitution.
- Approved Product Requirements baseline.
- Decision Log with rationale and superseded decisions.
- Technical Architecture baseline.
- Design System baseline direction.
- Separate Backlog for unapproved and deferred ideas.
- Contribution workflow for human and AI developers.
- Shared Glossary.
- Initial Architecture Decision Records:
  - ADR-001 Modular registered architecture;
  - ADR-002 Local-first IndexedDB persistence;
  - ADR-003 Immediate autosave;
  - ADR-004 Insight evidence hierarchy.

### Changed

- Governance documentation moved under numbered `/docs` structure.
- Constitution separated from Product Requirements.
- Semantic versioning formally adopted.

### Notes

Exact visual palette, typography, scale design, chart language and Today-screen hierarchy remain subject to Claire’s prototype approval.

