# Clairity Changelog

All notable changes to Clairity governance, product scope and releases will be recorded here.

Clairity uses [Semantic Versioning](https://semver.org/) in the following way:

- **Major:** product philosophy, constitutional or breaking architecture change;
- **Minor:** approved new module or significant capability;
- **Patch:** non-breaking clarification, defect correction or wording improvement.

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

