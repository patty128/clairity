# Clairity Design System

**Version:** 1.0.0  
**Status:** Approved baseline direction  
**Owner:** Claire  
**Last updated:** 2026-07-23  
**Depends on:** `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_DECISION_LOG.md`  

---

## Document responsibility

This document defines **how approved behaviour should look, sound and interact**. Exact visual choices marked open require a prototype review by Claire.

## Change history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-23 | Initial approved governance baseline |

---

# 1. Design principles

Clairity should feel:

- calm;
- private;
- precise;
- premium;
- editorial;
- modern;
- mobile-first;
- supportive without being sentimental;
- structured without feeling clinical;
- low-friction without becoming vague.

The interface should help Claire record evidence quickly and understand what is known, missing or uncertain.

---

# 2. Interaction principles

## 2.1 Specific, not vague

Use specific prompts:

- “How is your energy?”
- “How strong is the urge to smoke?”
- “What time did you fall asleep?”
- “Any symptoms right now?”

Do not use:

- “How are you feeling?”
- “Tell us about your day.”
- “Were you good today?”

## 2.2 Independent actions

Each evidence item should be loggable independently.

The interface must not require:

- Start check-in;
- Submit;
- Save;
- Finish check-in.

## 2.3 One-tap first

The first useful value should be easy to record in one interaction where possible.

Optional context should follow through:

- expansion;
- secondary screen;
- bottom sheet;
- “Add detail” action.

## 2.4 Autosave feedback

Use subtle status language:

- Saving…
- Saved on this device
- Couldn’t save — tap to retry

Do not use celebratory confirmation for ordinary evidence logging.

## 2.5 Missing is visible

Unrecorded data should look different from:

- none;
- zero;
- unknown;
- skipped;
- not applicable.

Never preselect a neutral answer merely to make a card look complete.

---

# 3. Visual direction

## 3.1 Overall style

Use a restrained editorial aesthetic:

- clear hierarchy;
- generous but efficient spacing;
- soft surfaces;
- minimal decoration;
- high legibility;
- subtle depth;
- calm motion;
- strong alignment.

Avoid:

- childish wellness illustrations;
- excessive gradients;
- bright gamification;
- confetti;
- streak flames;
- dense dashboard clutter;
- medical-device sterility;
- diet-app aesthetics.

## 3.2 Layout

Primary target: iPhone portrait.

Recommended structure:

- compact top bar;
- one main content column;
- full-width evidence cards;
- persistent bottom navigation where useful;
- bottom sheets for quick entry;
- safe-area-aware spacing.

Tablet and desktop may widen the column but should not turn the app into a dense enterprise dashboard.

---

# 4. Colour system

The exact palette still requires visual approval, but the baseline rules are agreed.

## 4.1 Palette behaviour

Use:

- one restrained accent colour;
- warm or neutral background surfaces;
- clear text contrast;
- semantic colours only where meaning is necessary.

Avoid:

- red/green as the only distinction;
- bright diet-app greens;
- heavy blue clinical interfaces;
- excessive status colours.

## 4.2 Semantic colour roles

Define tokens rather than hard-coded colours:

- `background`
- `surface`
- `surface-raised`
- `text-primary`
- `text-secondary`
- `border-subtle`
- `accent`
- `success`
- `warning`
- `danger`
- `focus-ring`

Dark mode should have equivalent semantic tokens, not inverted ad hoc values.

---

# 5. Typography

Use a highly legible system or licensed web-safe family.

Recommended approach for initial build:

- Apple system font stack on iOS;
- platform system fallback elsewhere.

Hierarchy:

- Display: rare, major insight or page title;
- Heading 1: screen title;
- Heading 2: section title;
- Body: standard content;
- Label: field and card labels;
- Caption: timestamps, save state and limitations.

Rules:

- avoid very light font weights;
- avoid long all-caps labels;
- use tabular numerals for repeated metrics where supported;
- maintain readable line height;
- do not shrink explanatory text below comfortable mobile size.

---

# 6. Spacing and sizing

Use a consistent spacing scale, for example:

- 4
- 8
- 12
- 16
- 24
- 32
- 48

Touch targets should be at least approximately 44 × 44 CSS pixels.

Cards should use:

- clear internal padding;
- consistent radius;
- subtle border or elevation;
- enough separation to prevent accidental taps.

Do not rely on oversized blank space that forces excessive scrolling.

---

# 7. Core components

## 7.1 Evidence card

Purpose: show one evidence area and its current state.

Contains:

- specific label;
- latest value or “Not recorded”;
- optional timestamp;
- quick-log interaction;
- optional detail affordance;
- save state only when active.

States:

- unrecorded;
- recorded;
- editing;
- saving;
- save failed;
- disabled;
- retired/history-only.

## 7.2 Scale selector

Use when a bounded scale is appropriate.

Requirements:

- labels must explain endpoints;
- selected state must be visually and textually clear;
- no answer should be preselected;
- the scale must remain stable over time;
- numbers may be hidden or shown based on the approved measure design.

## 7.3 Segmented choice

Use for small mutually exclusive choices.

Avoid using it for long or ambiguous option sets.

## 7.4 Multi-select chips

Use when multiple symptoms or contexts can coexist.

Each option must toggle independently.

## 7.5 Numeric entry

Use for:

- weight;
- calories;
- macros;
- cigarette count;
- duration.

Requirements:

- appropriate mobile keyboard;
- unit visible;
- estimated values supported where relevant;
- validation must be calm and specific.

## 7.6 Time and duration input

Use native mobile controls where they provide the best experience.

Sleep must distinguish clock time from total duration.

## 7.7 Optional detail panel

Use progressive disclosure for:

- notes;
- triggers;
- context;
- food detail;
- symptom description.

Opening optional detail must not be required to preserve the first value.

## 7.8 Insight card

Contains:

- concise title;
- plain-language summary;
- evidence period;
- confidence or evidence-strength label;
- limitations;
- link to supporting history.

Never present a hypothesis in the visual style of a confirmed fact.

## 7.9 Missing-context prompt

Tone:

- curious;
- neutral;
- optional.

Example:

> There isn’t enough recorded context to explain this yet. Was anything different in the previous two days?

Avoid:

> You forgot to log important information.

## 7.10 Module control

Settings should allow a module to be:

- enabled;
- hidden;
- retired;
- re-enabled.

The interface must explain that retirement preserves history.

---

# 8. Navigation

Baseline areas:

- Today;
- History;
- Insights;
- Settings.

This top-level structure remains subject to final product review, but navigation should stay simple.

Rules:

- Today opens to immediate useful actions;
- History supports reviewing and correcting evidence;
- Insights separates observation from hypothesis;
- Settings contains modules, privacy, export and preferences.

Avoid placing every module in primary navigation.

---

# 9. Today screen

Within five seconds, Claire should be able to understand:

- today’s recorded state;
- what core evidence is still missing;
- the quickest useful action;
- whether anything recently changed.

The Today screen should not resemble a checklist that punishes incompletion.

Possible structure:

1. concise date/context header;
2. core evidence cards;
3. active module quick actions;
4. optional recent context;
5. passive save state only when relevant.

Adaptive presentation may reorder or simplify controls, but all core evidence must remain available.

---

# 10. History

History should make retrospective logging and correction easy.

Potential views:

- calendar;
- reverse-chronological list, newest first;
- module filter;
- measure filter;
- day detail.


## 10.1 Ordering rule

Historical evidence, Review dates and other multi-day records must default to reverse chronological order so the most recent data is visible first. Within a single day, a deliberate time-of-day timeline may remain chronological where that helps the user understand the day.

Requirements:

- distinguish event date from date recorded where relevant;
- make edited records clear without clutter;
- preserve missing days without framing them as failure.

---

# 11. Insights

## 11.1 Visual hierarchy

Clearly label:

- Observation;
- Association;
- Hypothesis;
- Limitation.

## 11.2 Confidence

Use plain language rather than false precision:

- Limited evidence;
- Emerging pattern;
- Repeated pattern.

Exact confidence vocabulary remains open for later approval.

## 11.3 Chart rules

Charts should:

- show units;
- show time range;
- indicate missing data;
- avoid smoothing that hides meaningful variation;
- explain any moving average;
- avoid dual axes unless essential;
- remain readable on mobile.

## 11.4 Weight presentation

Weight should not use alarmist daily-change styling.

Potential design principles:

- trend available alongside raw values;
- contextual annotations for cycle, sleep or other relevant factors;
- no red/green judgement for daily movement.

Final presentation requires product approval.

---

# 12. Tone and content

## 12.1 Voice

Clairity should sound:

- calm;
- intelligent;
- curious;
- concise;
- respectful;
- non-judgemental.

## 12.2 Preferred phrasing

- “Not recorded”
- “Add context”
- “This appeared alongside…”
- “There may be a relationship…”
- “The evidence is limited because…”
- “A possible missing factor is…”

## 12.3 Avoid

- “Failed”
- “Bad day”
- “Cheat”
- “You broke your streak”
- “You should have”
- “X definitely caused Y”
- generic motivational slogans.

---

# 13. Accessibility

The interface must:

- meet sensible contrast standards;
- support dynamic text where practical;
- not rely on colour alone;
- provide visible focus states;
- use meaningful control labels;
- support screen readers;
- support reduced motion;
- preserve large touch targets;
- avoid time-limited interactions;
- keep errors close to the affected input.

---

# 14. Motion

Use motion sparingly.

Appropriate:

- bottom-sheet transitions;
- save-state change;
- card expansion;
- navigation transitions;
- subtle progress indication.

Avoid:

- bouncing rewards;
- confetti;
- distracting loops;
- motion that implies moral success or failure.

Reduced-motion settings must be respected.

---

# 15. Empty, error and partial states

## 15.1 Empty

Use:

> Nothing recorded here yet.

Not:

> You haven’t started your journey.

## 15.2 Partial day

Use:

> Three items recorded today.

Not:

> Your check-in is incomplete.

## 15.3 Save error

Use:

> This hasn’t saved yet. Tap to retry.

Do not silently discard or falsely confirm.

## 15.4 No insight

Use:

> There isn’t enough evidence for a useful pattern yet.

Explain what is missing where appropriate.

---

# 16. Module-specific consistency

Every module should inherit:

- shared card structure;
- shared save feedback;
- shared missing state;
- shared history behaviour;
- shared module settings;
- shared accessibility rules.

Modules may define specialised controls, but should not introduce a completely separate visual language.

A future pregnancy module should feel native to Clairity rather than like a separate app bolted onto it.

---

# 17. Design feasibility

| Area | Assessment | Notes |
|---|---|---|
| Mobile-first component system | Straightforward | Should be created before screens multiply |
| Light and dark semantic tokens | Straightforward | Requires contrast testing |
| Independent evidence cards | Straightforward | Core interaction pattern |
| Progressive disclosure | Straightforward | Reduces friction |
| Adaptive UI presentation | Feasible with trade-offs | Must preserve evidence availability |
| Rich mobile charts | Feasible with trade-offs | Keep initial charts simple |
| Highly custom visualisation system | Better deferred | Not needed for MVP |
| Complex animated coaching | Out of scope | Conflicts with calm evidence-first design |

---

# 18. Design acceptance checklist

Before a component or screen is approved:

- Is the prompt specific?
- Can the first useful value be captured quickly?
- Does it autosave?
- Is missing data distinct?
- Is optional detail truly optional?
- Does it work on an iPhone-sized screen?
- Is the language non-judgemental?
- Does it preserve core evidence?
- Does it reuse the design system?
- Does it handle errors and interrupted use?
- Does it avoid implying causation?
- Does it remain usable in dark mode and with reduced motion?

---

# 19. Open visual decisions

These require Claire’s later approval through a visual prototype:

- exact colour palette;
- final typography;
- corner radius and elevation style;
- icon style;
- exact bottom-navigation treatment;
- Today-screen information hierarchy;
- measurement-scale presentation;
- chart visual language;
- weight trend presentation.

These are intentionally not invented in this baseline document.



# 20. iPhone Safari interaction requirements

Clairity is mobile-first and iPhone Safari is a primary acceptance environment.

Required behaviour:

- top-level navigation responds to a single tap and the selected state changes immediately;
- the final visible page always matches the last navigation tap;
- fixed navigation respects the home indicator and dynamic Safari toolbar;
- no primary screen requires horizontal page scrolling;
- inputs use at least 16px text on mobile to avoid unintended Safari zoom;
- touch controls use `touch-action: manipulation` where appropriate;
- bottom sheets remain usable with the keyboard open and within the dynamic viewport;
- content containers use `min-width: 0` so grids and long values cannot force overflow.

Mobile Safari regression testing is required before a beta or stable release.


## Mobile density and progressive disclosure

- iPhone Safari is the primary layout target.
- Mobile screens should favour compact cards and progressive disclosure over displaying every control at once.
- Settings groups must use expandable sections.
- Review summaries and explanatory legends may be collapsed so daily evidence remains the primary content.
- Touch targets remain at least 40px while surrounding white space should be used deliberately rather than uniformly.
