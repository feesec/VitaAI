# Trend-First UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the frontend so the main experience focuses on recent abnormal indicator changes, with a cleaner and more medically credible interface.

**Architecture:** Keep the current React routes, API clients, and state model, but rework the UI narrative and layout hierarchy. The redesign is implemented entirely in the existing frontend, using the current Tailwind/Radix-based component layer and a small set of new page-specific view helpers where needed.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Zustand, Recharts, ESLint

---

## File Structure

### Existing files to modify

- `frontend/src/components/Layout.tsx`
- `frontend/src/components/app/page-shell.tsx`
- `frontend/src/components/app/empty-state.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/index.css`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/RecordsPage.tsx`
- `frontend/src/pages/RecordDetailPage.tsx`
- `frontend/src/pages/NewRecordPage.tsx`
- `frontend/src/pages/OrgansPage.tsx`

### New files to create

- `frontend/src/components/app/section-heading.tsx`
- `frontend/src/components/app/trend-summary-card.tsx`
- `frontend/src/components/app/trend-metric-card.tsx`
- `frontend/src/components/app/evidence-panel.tsx`
- `frontend/src/components/app/record-timeline-row.tsx`
- `frontend/src/components/app/record-change-banner.tsx`

### Responsibility boundaries

- `components/app/*` holds reusable redesign-specific presentation pieces.
- Page files keep fetching and page assembly logic.
- No backend files or API contracts change in this plan.

## Task 1: Refine the shared shell and visual language

**Files:**
- Create: `frontend/src/components/app/section-heading.tsx`
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/components/app/page-shell.tsx`
- Modify: `frontend/src/components/app/empty-state.tsx`
- Modify: `frontend/src/components/ui/card.tsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Tighten the global palette and spacing**

Update `frontend/src/index.css` to reduce decorative atmosphere and move to flatter, cooler surfaces. Replace the current body background and radius feel with something closer to:

```css
body {
  margin: 0;
  min-height: 100vh;
  background: #f5f8fb;
  color: hsl(var(--foreground));
  font-family:
    "Instrument Sans",
    "Segoe UI",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    sans-serif;
}
```

Reduce strong radial gradients and keep emphasis on neutral backgrounds, subtle borders, and consistent text contrast.

- [ ] **Step 2: Rework shared surface components**

Modify `frontend/src/components/ui/card.tsx` so cards feel more clinical and less glossy. Use slightly tighter radii, lighter shadow, and clearer borders. Representative root class:

```tsx
"rounded-2xl border border-slate-200/90 bg-white text-slate-950 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.18)]"
```

Update `page-shell.tsx` to reduce theatrical headings and align to a structured content rhythm:

```tsx
<div className="p-6 md:p-8 xl:p-10">
  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
```

- [ ] **Step 3: Introduce a standard section header**

Create `frontend/src/components/app/section-heading.tsx`:

```tsx
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

This should render a compact uppercase eyebrow, a restrained title, and optional action, so pages stop inventing their own section headers.

- [ ] **Step 4: Rebuild the authenticated layout around the new IA**

Modify `frontend/src/components/Layout.tsx` so navigation labels become trend-first while routes stay the same:

```ts
const NAV_ITEMS = [
  { to: "/dashboard", label: "异常变化", icon: Activity },
  { to: "/records", label: "健康记录", icon: NotepadText },
  { to: "/organs", label: "器官健康", icon: Stethoscope },
  { to: "/profile", label: "健康档案", icon: UserRound },
];
```

The sidebar should feel quieter and more structured: less visual glow, smaller logo emphasis, steadier spacing.

- [ ] **Step 5: Verify the shell baseline**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Expected: the app still compiles with the updated shell and shared styling before page-specific redesign starts.

## Task 2: Rebuild the homepage as a trend-first overview

**Files:**
- Create: `frontend/src/components/app/trend-summary-card.tsx`
- Create: `frontend/src/components/app/trend-metric-card.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/src/types/index.ts`

- [ ] **Step 1: Add summary and trend-card helpers**

Create `trend-summary-card.tsx` to render a short clinical summary plus supporting context.

Expected prop shape:

```tsx
interface TrendSummaryCardProps {
  summary: string;
  note?: string;
  action?: React.ReactNode;
}
```

Create `trend-metric-card.tsx` to render one indicator trend block.

Expected prop shape:

```tsx
interface TrendMetricCardProps {
  title: string;
  currentValue: string;
  deltaLabel: string;
  direction: "up" | "down" | "flat";
  referenceRange: string;
  series: number[];
  explanation: string;
}
```

- [ ] **Step 2: Compute lightweight trend summaries in `DashboardPage.tsx`**

Keep using `getOrgans()` and `getRecords()`, but transform recent records into a trend-first model. Add a local helper inside `DashboardPage.tsx` that:

- flattens recent record indicators
- groups by indicator name
- sorts by record date
- extracts the latest 2-3 values
- finds indicators with upward movement

Representative helper signature:

```ts
function buildTrendHighlights(records: HealthRecord[]): TrendHighlight[] { ... }
```

Where `TrendHighlight` is a local type containing:

```ts
type TrendHighlight = {
  name: string;
  latest: number;
  previous?: number;
  delta?: number;
  series: number[];
  referenceRange: string;
  explanation: string;
};
```

- [ ] **Step 3: Replace the homepage layout**

Rewrite `frontend/src/pages/DashboardPage.tsx` so the first screen is:

1. summary card
2. 2-4 trend metric cards
3. "这意味着什么" section
4. "下一步建议" section
5. organ overview
6. recent records

Keep recent records lower on the page. Avoid greeting-led hero sections.

- [ ] **Step 4: Verify the homepage redesign**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/dashboard`

Expected: the first screen answers “最近有哪些异常变化”, and trend cards appear before organ summaries.

## Task 3: Turn the records page into a change index

**Files:**
- Create: `frontend/src/components/app/record-timeline-row.tsx`
- Modify: `frontend/src/pages/RecordsPage.tsx`

- [ ] **Step 1: Add a reusable timeline/change row**

Create `record-timeline-row.tsx` with props that support a trend-led list item:

```tsx
interface RecordTimelineRowProps {
  title: string;
  subtitle: string;
  status: string;
  onClick?: () => void;
}
```

It should look like a change track, not a generic card.

- [ ] **Step 2: Add a filter strip to `RecordsPage.tsx`**

Add local UI state for:

- time range
- indicator category
- continuous abnormality only

These can be presentational filters first. Use existing `Select` and `Checkbox` components; do not add new backend queries.

- [ ] **Step 3: Rebuild the list to prioritize change narratives**

Transform the page from date cards to trend-led items such as:

- `总胆固醇：最近 3 次持续升高`
- `ALT：近 2 次明显上升`

Use existing records data to derive the text client-side. Keep a secondary section lower on the page for plain chronological record access.

- [ ] **Step 4: Verify the records page redesign**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/records`

Expected: the page reads like a change index first, with raw chronology demoted.

## Task 4: Rebuild record detail around “what changed”

**Files:**
- Create: `frontend/src/components/app/evidence-panel.tsx`
- Create: `frontend/src/components/app/record-change-banner.tsx`
- Modify: `frontend/src/pages/RecordDetailPage.tsx`

- [ ] **Step 1: Add record-summary presentation helpers**

Create `record-change-banner.tsx` with props:

```tsx
interface RecordChangeBannerProps {
  summary: string;
  worsened: string[];
  recovered: string[];
}
```

Create `evidence-panel.tsx` for one abnormal indicator:

```tsx
interface EvidencePanelProps {
  name: string;
  currentValue: string;
  previousValue?: string;
  directionLabel: string;
  referenceRange: string;
  explanation: string;
}
```

- [ ] **Step 2: Add previous-record comparison logic to `RecordDetailPage.tsx`**

Inside the page, compare the current record to the nearest older record from `getRecords()` or the already-fetched record set. Build a local comparison map by indicator name:

```ts
type IndicatorComparison = {
  name: string;
  current: number;
  previous?: number;
  delta?: number;
  status: "worsened" | "improved" | "unchanged";
};
```

This should power the new top summary and evidence panels.

- [ ] **Step 3: Reorder the page sections**

Change the page sequence to:

1. this-record summary banner
2. evidence panels for the most important abnormal indicators
3. interpretation summary
4. organ risks
5. recommendations
6. raw indicator table

Keep the raw table, but push it down.

- [ ] **Step 4: Verify the detail-page redesign**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/records/:id`

Expected: users can see what worsened before reading the full raw table.

## Task 5: Reframe record entry and organ pages

**Files:**
- Modify: `frontend/src/pages/NewRecordPage.tsx`
- Modify: `frontend/src/pages/OrgansPage.tsx`

- [ ] **Step 1: Reprioritize manual-entry layout**

In `NewRecordPage.tsx`, visually promote the most trend-relevant indicators. Split the existing flat table into:

- a "重点指标" block
- a secondary "更多指标" block

Keep the same payload shape and submit logic. This is a layout reprioritization only.

- [ ] **Step 2: Make upload flow feel like a medical intake surface**

Refine the upload card so it is cleaner and more restrained:

- smaller icon emphasis
- stronger file-state clarity
- calmer status banners
- explicit handoff copy after parse success such as “解析完成后将带你查看本次新增变化”

- [ ] **Step 3: Reframe the organ page as derived analysis**

In `OrgansPage.tsx`, keep the same data source, but change the page tone and hierarchy so the organ cards feel secondary and analytical rather than dashboard-primary. Add short framing copy clarifying that this page summarizes patterns inferred from indicator trends.

- [ ] **Step 4: Verify the secondary-page redesign**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/records/new`
- `/organs`

Expected: the record-entry flow feels trend-aware, and the organ page reads as a derived view rather than the main overview.

## Task 6: Final pass on naming, spacing, and visual consistency

**Files:**
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/pages/RecordsPage.tsx`
- Modify: `frontend/src/pages/RecordDetailPage.tsx`
- Modify: `frontend/src/pages/NewRecordPage.tsx`
- Modify: `frontend/src/pages/OrgansPage.tsx`

- [ ] **Step 1: Normalize visible labels**

Ensure the navigation, section headings, and helper copy consistently reflect the trend-first story:

- `仪表盘` -> `异常变化` or `趋势概览`
- avoid generic “欢迎使用” wording
- emphasize “变化 / 趋势 / 最近记录 / 下一步”

- [ ] **Step 2: Normalize card density and section spacing**

Sweep the modified pages for:

- inconsistent card padding
- headline size drift
- overly decorative accents
- overly large radii

Use `SectionHeading`, `Card`, and the redesign helpers to reduce visual drift.

- [ ] **Step 3: Run the final verification suite**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke checklist:
- `/dashboard`
- `/records`
- `/records/:id`
- `/records/new`
- `/organs`
- sidebar navigation

Expected: the product feels clinically cleaner and narratively centered on recent abnormal changes.

- [ ] **Step 4: Commit the redesign**

Run:

```bash
git add frontend/src frontend/src/components/app frontend/src/components/ui frontend/src/index.css
git commit -m "redesign frontend around trend-first health changes"
```

## Self-Review

### Spec coverage

- Homepage trend-first narrative is covered in Task 2.
- Records page as a change index is covered in Task 3.
- Record detail “what changed” structure is covered in Task 4.
- Record entry and organ reprioritization are covered in Task 5.
- Navigation relabeling and global visual consistency are covered in Tasks 1 and 6.

No spec requirement is currently uncovered.

### Placeholder scan

- No `TBD`, `TODO`, or deferred requirements remain.
- Every task contains specific file paths and verification commands.
- The plan intentionally avoids adding new backend data contracts or test frameworks.

### Type consistency

- New helper component names are used consistently: `SectionHeading`, `TrendSummaryCard`, `TrendMetricCard`, `EvidencePanel`, `RecordTimelineRow`, `RecordChangeBanner`.
- Existing route paths remain unchanged.
- The redesign continues to rely on existing `HealthRecord`, `IndicatorValue`, `OrganProfile`, and `InterpretationResult` types, with local comparison types introduced only inside page modules.
