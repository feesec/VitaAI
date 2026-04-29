# Trend-First UI Redesign Design

## Goal

Redesign the VitaAI frontend so the product is centered on recent abnormal changes, not generic dashboard summaries.

The new experience should feel medically professional: clean, restrained, credible, and easy to scan. The core user question on entry becomes:

"What abnormal changes have happened recently?"

## Product Direction

### Primary homepage question

The homepage should answer:

- what has changed recently

Not:

- an overall health score
- organ summaries first
- a generic welcome screen

### Primary signal model

Recent changes should be driven mainly by:

- same-indicator time trends

Examples:

- total cholesterol rising across recent records
- ALT / AST continuing upward
- blood pressure trending upward over multiple entries

Organ-level summaries still matter, but they should be secondary and derived from indicator changes, not the first thing the user sees.

### Presentation style

The presentation model is mixed:

- first give a short conclusion
- immediately follow with trend evidence
- then show next-step advice

This avoids two bad extremes:

- pure report mode, where users must interpret everything themselves
- over-simplified coach mode, where evidence is hidden behind slogans

## Experience Principles

### 1. Change first

The system should foreground what is changing, especially what is worsening, before showing static summaries.

### 2. Evidence near interpretation

Whenever the UI says something is concerning, the supporting trend evidence should appear immediately nearby.

### 3. Professional restraint

The UI should avoid decorative noise, overly colorful blocks, consumer wellness aesthetics, or playful dashboard patterns. It should feel closer to a clinical decision-support surface than a lifestyle app.

### 4. Clear next action

Every important abnormal change should lead naturally to one of these outcomes:

- understand the change
- inspect the underlying records
- see what to do next

## Information Architecture

### Navigation

The current "dashboard-first" structure should be reframed around changes.

Recommended top-level navigation:

- `异常变化` or `趋势概览`
- `健康记录`
- `器官健康`
- `健康档案`

Rationale:

- `异常变化 / 趋势概览` becomes the main operational homepage
- `健康记录` becomes the historical data entry and review area
- `器官健康` becomes a secondary thematic analysis area
- `健康档案` remains supporting profile data

If naming is implemented incrementally, the route can remain `/dashboard` while the visible label changes first.

## Page Redesign

### 1. Homepage: trend-first overview

The homepage should no longer open with a greeting and organ cards.

Instead, the first screen should contain:

#### A. Change summary block

A concise summary sentence describing the most important recent change.

Example:

- "最近 3 次记录中，血脂和转氨酶持续上升，值得优先关注。"

This block should be calm and authoritative, not alarmist.

#### B. Trend cards

Show 2 to 4 high-priority trend cards.

Each card should focus on one indicator and include:

- indicator name
- current value
- change relative to previous value
- recent direction, such as rising / falling / stable
- reference range
- a compact mini trend visualization

The card should help the user answer:

- is this changing?
- is it getting worse?
- how unusual is it?

#### C. Meaning and next step

Below the main trend area, show two short supporting sections:

- what this may mean
- what to do next

These should be brief and tightly connected to the highlighted trend changes.

#### D. Secondary sections

Move these lower on the page:

- organ overview
- recent record list

They remain useful, but they are no longer the primary narrative.

### 2. Record list page

The record list should no longer function only as a chronological archive.

It should become a change index.

Recommended structure:

#### A. Filter bar

Filters should support:

- indicator category
- time range
- continuous abnormality

#### B. Change-led list

The main list should prioritize trend tracks rather than raw records.

Example:

- `总胆固醇：最近 3 次持续升高`
- `ALT：近 2 次明显上升`

Selecting one should lead the user into the specific supporting records and details.

#### C. Historical records as secondary access

Chronological records should still be accessible, but as a supporting view rather than the main presentation mode.

### 3. Record detail page

The detail page should move from "table plus AI interpretation" to a three-part structure.

#### A. This-record summary

State clearly:

- which indicators worsened versus the previous record
- which returned toward normal
- which remain abnormal

#### B. Trend evidence per abnormal indicator

For each important abnormal indicator, show:

- current value
- previous value
- recent trend direction
- reference range
- short explanation of why this pattern matters

This is the central section of the page.

#### C. Interpretation and next steps

AI interpretation should remain, but it should appear as support for trend evidence rather than the sole centerpiece.

Recommended sequence:

- summary
- urgent attention items if any
- abnormal indicator explanations
- organ-risk interpretation
- recommendations
- full raw indicator table at the bottom

The full indicator table is still necessary, but it should no longer dominate the page.

### 4. Record creation page

The record entry experience should feel like adding a datapoint into the trend engine, not simply filling a form.

#### Manual entry

The most trend-relevant indicators should be visually prioritized.

Avoid giving every row equal weight. The UI should guide attention toward the indicators that commonly drive longitudinal insight.

#### Upload flow

The upload area should feel like a trustworthy medical-document intake surface:

- clear drop area
- restrained visual language
- visible file state
- parsing progress
- strong post-parse handoff into "what changed in this record"

Success should not end at "saved"; it should lead into "here is what changed".

### 5. Organ health page

The organ page should remain in the product, but its role changes.

It becomes:

- a thematic analysis view derived from indicator patterns

It is no longer the primary entry point into the experience.

Organ cards should feel more analytical and less dashboard-like. They should summarize derived risk and watch items, not compete with the homepage's change narrative.

## Visual System

### Look and feel

The visual language should communicate:

- clinical clarity
- information hierarchy
- controlled confidence

It should avoid:

- loud gradients
- decorative glow effects
- overly large rounded surfaces
- consumer wellness softness
- dense dashboard clutter

### Color

Use a restrained cool palette:

- near-white or light cool gray backgrounds
- slate / blue-gray text hierarchy
- blue-cyan reserved for primary action, focus, and important emphasis
- muted success / warning / error states with low-saturation backgrounds

Color should help interpretation, not become the visual subject.

### Surface and spacing

Recommended direction:

- flatter surfaces
- lighter shadows
- clearer borders
- slightly tighter radii than the current UI
- more consistent vertical rhythm

The product should feel systematic, not soft or playful.

### Typography

Typography should become more structured and more editorially calm:

- strong but restrained titles
- readable body copy
- compact metadata and labels
- fewer oversized headings

The hierarchy should support fast scanning of medical-ish content without shouting.

## Component System

The redesign should standardize around a small set of component types:

- summary card
- trend card
- evidence card
- recommendation card
- raw data table
- status banner

Each should have a clear responsibility.

Avoid many visually different card styles competing in one page.

## Scope Boundaries

This redesign includes:

- homepage information architecture
- record list information architecture
- record detail information architecture
- record creation flow presentation
- organ page visual and structural reprioritization
- navigation relabeling / restructuring at the UI level
- global visual system refinement

This redesign does not require:

- backend API redesign
- new health scoring models
- new medical inference logic
- route path changes if labels alone are sufficient

If existing data structures cannot fully support the ideal trend story, the frontend may use the best currently available approximation, as long as the UI direction remains trend-first.

## Risks

### Insufficient trend data

If users have too few records, a trend-first homepage may feel empty.

Mitigation:

- graceful empty states
- fallback explanation blocks
- clear prompts to add or upload more data

### Overclaiming from sparse evidence

If the UI sounds too certain when only one or two data points exist, credibility drops.

Mitigation:

- restrained wording
- explicit framing around "recent records" and "current observed changes"

### Detail-page complexity

Adding trend evidence and explanation can make the detail page long.

Mitigation:

- strong section hierarchy
- condensed evidence cards
- raw table pushed lower

## Validation Criteria

The redesign is successful when:

- the homepage's first screen clearly answers "what changed recently"
- users can identify worsening indicators without opening raw tables first
- trend evidence appears near conclusions
- organ health becomes secondary to indicator change analysis
- the UI feels cleaner, more disciplined, and more medically credible than the current version
- the main record flows still function without business-logic regression

## Implementation Notes

This redesign should not be treated as a color refresh. It is a narrative and hierarchy redesign.

The core change is:

- from a generic health dashboard
- to a trend-first abnormal-change reading experience

Visual refinement supports that shift, but does not replace it.
