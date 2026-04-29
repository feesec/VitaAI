# BaseUI to shadcn/ui Migration Design

## Goal

Replace the frontend's `baseui` and `styletron` stack with `shadcn/ui` and Tailwind CSS, while keeping the current routes, backend contracts, and user flows intact.

This is a full migration, not a long-term dual-stack transition.

## Current State

The frontend uses:

- `baseui`
- `styletron-engine-atomic`
- `styletron-react`

These are wired in `frontend/src/main.tsx` through `StyletronProvider` and `BaseProvider`.

Current BaseUI usage is concentrated in:

- `src/components/Layout.tsx`
- `src/components/LoadingSpinner.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/RecordsPage.tsx`
- `src/pages/RecordDetailPage.tsx`
- `src/pages/NewRecordPage.tsx`
- `src/pages/OrgansPage.tsx`

Current component dependencies are mostly:

- `Button`
- `Input`
- `FormControl`
- `Checkbox`
- `Select`
- `Tabs`
- `Notification`
- `Spinner`
- `useStyletron`

## Chosen Approach

Adopt `shadcn/ui` as the primary component system and add a thin application layer on top of it.

This means:

- add Tailwind CSS to the Vite app
- generate or add `shadcn/ui` primitives under `frontend/src/components/ui/`
- add lightweight project-level wrappers and layout helpers under `frontend/src/components/app/`
- remove `StyletronProvider` and `BaseProvider`
- remove all `baseui` and `styletron` imports from `frontend/src`
- remove the related packages from `frontend/package.json`

The thin app layer is intentional. It keeps project-level styling, spacing, and feedback patterns consistent without turning the UI layer into a custom design system.

## Why This Approach

### Option A: Direct page-by-page shadcn replacement

This is the fastest path to first render, but it spreads styling and behavioral decisions across every page. It is likely to create drift in spacing, alerts, button variants, and page shells.

### Option B: shadcn/ui plus thin app wrappers

This is the chosen approach. It keeps the migration straightforward while centralizing recurring patterns such as form sections, alert states, page containers, and loading states.

### Option C: Radix primitives with fully custom components

This gives maximum control, but it adds unnecessary design-system work for the current repo and is not justified by the app's size.

## Target Architecture

### Styling stack

The frontend will use:

- Tailwind CSS for utility styling
- CSS variables for project tokens such as colors, radii, borders, and surfaces
- `shadcn/ui` components for common primitives

The existing template-like styling in `frontend/src/index.css` and `frontend/src/App.css` should be replaced with app-specific global styles aligned with the product's health-focused UI.

### Component boundaries

Keep the UI split into two layers:

- `src/components/ui/`: low-level shadcn components and direct primitives
- `src/components/app/`: project-specific wrappers such as page shells, section cards, form rows, empty states, and loading states

This keeps third-party code and product-specific UI concerns separate.

## Component Mapping

BaseUI components should map as follows:

- `baseui/button` -> `Button`
- `baseui/input` -> `Input`
- `baseui/form-control` -> `Label` + field + helper/error text
- `baseui/checkbox` -> `Checkbox`
- `baseui/tabs-motion` -> `Tabs`
- `baseui/notification` -> `Alert`
- `baseui/spinner` -> animated icon-based loading state, likely `Loader2`

`Select` needs special handling:

- use `shadcn/ui` `Select` only if the current interaction is simple single-select
- if a page depends on searchable or more complex selection behavior, use a composed pattern such as `Popover + Command`

`useStyletron` should be fully removed. Component-local styling should move to class-based composition.

## Migration Sequence

Even though this is a full migration, the implementation should still proceed in small, reviewable steps.

1. Add Tailwind CSS and supporting utilities such as `cn`.
2. Add the base `shadcn/ui` setup and required primitives.
3. Remove provider usage from `frontend/src/main.tsx`.
4. Build the thin app layer for shared shells, form sections, feedback blocks, and loading states.
5. Migrate form-heavy pages first:
   - `LoginPage`
   - `RegisterPage`
   - `ProfilePage`
6. Migrate record flows next:
   - `RecordsPage`
   - `RecordDetailPage`
   - `NewRecordPage`
7. Migrate navigation and overview pages:
   - `Layout`
   - `DashboardPage`
   - `OrgansPage`
8. Remove unused `baseui` and `styletron` dependencies and any dead CSS.

This order is chosen because the form pages expose the core component and validation patterns early, while record creation and detail flows expose the harder interaction cases such as tabs, select-like controls, and feedback states.

## Scope Boundaries

This migration does not include:

- backend API changes
- route restructuring
- Zustand store redesign
- data model changes
- new product features

Refactoring is allowed only where it is necessary to make the new UI stack fit cleanly.

## Validation Criteria

The migration is complete when all of the following are true:

- `baseui`, `styletron-engine-atomic`, and `styletron-react` are removed from dependencies
- no `baseui` or `styletron` imports remain in `frontend/src`
- all current routes still render and navigate correctly
- primary user flows still work:
  - login
  - registration
  - profile edit
  - record creation
  - record detail view
- `pnpm lint` passes
- `pnpm build` passes
- manual browser smoke testing confirms that the major pages are usable and visually coherent

## Risks

### Select behavior mismatch

`baseui` `Select` is more feature-oriented than `shadcn/ui` `Select`. If the current pages depend on richer behavior, a composed replacement will be needed.

### Visual regression during provider removal

Removing `BaseProvider` and `StyletronProvider` will eliminate inherited styles immediately. Shared layout and form primitives need to be introduced before broad page migration, or the app will become visually inconsistent.

### Accidental scope creep

Because UI migration touches many files, there is a temptation to also rewrite structure, state, or copy. That should be avoided unless a change is required to keep the app working.

## Implementation Notes

The migration should favor consistency over one-to-one visual parity with BaseUI. The goal is not to preserve every old presentation detail, but to land on a coherent, maintainable UI system that better matches the app's current size and future direction.
