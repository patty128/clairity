# Clairity — 2.0 beta

Clairity is a private, local-first personal health evidence app designed for one user. The current build is **2.0.0-beta.4.4**.

## Current capability

- independent Mood, physical and mental Energy, Motivation and Appetite evidence;
- Sleep timing, quality, interruptions, naps and calculated duration;
- meal-level calories and macros;
- Symptoms with severity and notes;
- Weight with preferred display unit and a descriptive seven-day trend;
- Movement and activity;
- menstrual bleeding, spotting and clearly labelled estimates;
- supplements and medication definitions and intake;
- Today timeline, History and seven-day Review;
- retrospective recording and editing;
- encrypted local backup and transactional restore;
- IndexedDB schema version 5, including an additive repair migration for older local databases.

## Run

Open `index.html` in a modern browser. Data is stored locally in IndexedDB on that device. Safari on iPhone is a primary supported browser.

## Product rules

- Evidence interactions remain independent and low friction.
- Valid input is preserved immediately; there is no required start, save or finish workflow.
- Missing evidence is never treated as zero.
- Recorded, calculated and estimated information remain visibly distinct.
- Clairity describes patterns but does not diagnose or claim causation.

## Development baseline

Use the latest full repository ZIP or the GitHub `main` branch as the source of truth. Preserve canonical filenames and paths, extend shared architecture, and do not introduce parallel storage, navigation or save systems.
