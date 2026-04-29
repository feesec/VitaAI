# BaseUI to shadcn/ui Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `baseui` and `styletron` in the frontend with Tailwind CSS and `shadcn/ui`, while preserving the current routes and health-management flows.

**Architecture:** The migration introduces Tailwind CSS as the styling foundation, `shadcn/ui` primitives under `frontend/src/components/ui/`, and a thin project-specific layer under `frontend/src/components/app/`. Pages are migrated in batches so the app remains buildable after each task, and the final cleanup removes all `baseui` and `styletron` dependencies.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, Zustand, ESLint

---

## File Structure

### Existing files to modify

- `frontend/package.json`
- `frontend/pnpm-lock.yaml`
- `frontend/src/main.tsx`
- `frontend/src/index.css`
- `frontend/src/App.css`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/LoadingSpinner.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/RecordsPage.tsx`
- `frontend/src/pages/RecordDetailPage.tsx`
- `frontend/src/pages/NewRecordPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/OrgansPage.tsx`

### New files to create

- `frontend/components.json`
- `frontend/postcss.config.js`
- `frontend/src/lib/utils.ts`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/input.tsx`
- `frontend/src/components/ui/label.tsx`
- `frontend/src/components/ui/checkbox.tsx`
- `frontend/src/components/ui/select.tsx`
- `frontend/src/components/ui/tabs.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/alert.tsx`
- `frontend/src/components/ui/separator.tsx`
- `frontend/src/components/app/page-shell.tsx`
- `frontend/src/components/app/form-field.tsx`
- `frontend/src/components/app/status-banner.tsx`
- `frontend/src/components/app/empty-state.tsx`

### Responsibility boundaries

- `components/ui/*` contains primitive building blocks with no VitaAI-specific copy.
- `components/app/*` contains reusable page-level patterns specific to VitaAI.
- Page files keep data fetching and state, but should stop defining raw layout and alert primitives inline.

## Task 1: Install Tailwind and shadcn foundation

**Files:**
- Create: `frontend/postcss.config.js`
- Create: `frontend/components.json`
- Create: `frontend/src/lib/utils.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.css`

- [ ] **Step 1: Add the new UI dependencies**

Update `frontend/package.json` to remove `baseui`, `styletron-engine-atomic`, and `styletron-react`, and add the new stack:

```json
{
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-tabs": "^1.1.13",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.511.0",
    "tailwind-merge": "^3.3.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.7",
    "tailwindcss": "^4.1.7"
  }
}
```

- [ ] **Step 2: Install and refresh the lockfile**

Run: `cd frontend && pnpm install`
Expected: `pnpm-lock.yaml` updates and install completes without `baseui`/`styletron` in the dependency graph.

- [ ] **Step 3: Add Tailwind + shadcn config files**

Create `frontend/postcss.config.js`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

Create `frontend/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 4: Add the shared class helper**

Create `frontend/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Replace the current global CSS with Tailwind-driven tokens**

Replace the Vite-template styles in `frontend/src/index.css` with a token-based file that starts like this:

```css
@import "tailwindcss";

:root {
  --background: 210 40% 98%;
  --foreground: 222.2 47.4% 11.2%;
  --card: 0 0% 100%;
  --primary: 195 90% 60%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --ring: 195 90% 60%;
  --radius: 1rem;
}

body {
  @apply bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased;
}

#root {
  @apply min-h-screen;
}
```

Reduce `frontend/src/App.css` to either an empty file or a tiny compatibility stub:

```css
/* Intentionally minimal after Tailwind migration. */
```

- [ ] **Step 6: Verify the frontend still builds with the new CSS pipeline**

Run: `cd frontend && pnpm build`
Expected: TypeScript and Vite build succeed before component migration starts.

## Task 2: Add primitive UI components and remove providers

**Files:**
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/label.tsx`
- Create: `frontend/src/components/ui/checkbox.tsx`
- Create: `frontend/src/components/ui/select.tsx`
- Create: `frontend/src/components/ui/tabs.tsx`
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/alert.tsx`
- Create: `frontend/src/components/ui/separator.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create the button primitive**

Create `frontend/src/components/ui/button.tsx` with a standard shadcn-style variant API:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-600",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        outline: "border border-slate-200 bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

- [ ] **Step 2: Create the remaining primitives**

Add `Input`, `Label`, `Checkbox`, `Select`, `Tabs`, `Card`, `Alert`, and `Separator` using standard Radix-backed shadcn patterns. Keep each file self-contained and import `cn` from `@/lib/utils`.

Representative `input.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
      className
    )}
    {...props}
  />
));
```

- [ ] **Step 3: Remove Styletron and BaseUI providers from the app entry**

Replace `frontend/src/main.tsx` with:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 4: Verify there are no provider-related compile errors**

Run: `cd frontend && pnpm lint`
Expected: import errors point only to remaining page migrations, not to missing providers or utility files.

## Task 3: Build shared VitaAI app components

**Files:**
- Create: `frontend/src/components/app/page-shell.tsx`
- Create: `frontend/src/components/app/form-field.tsx`
- Create: `frontend/src/components/app/status-banner.tsx`
- Create: `frontend/src/components/app/empty-state.tsx`
- Modify: `frontend/src/components/LoadingSpinner.tsx`

- [ ] **Step 1: Add a reusable page container**

Create `frontend/src/components/app/page-shell.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, description, action, children, className }: PageShellProps) {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Add shared form and banner wrappers**

Create `form-field.tsx` and `status-banner.tsx` so pages stop manually wiring label/help/error blocks:

```tsx
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}
```

`status-banner.tsx` should wrap `Alert` and accept `variant: "info" | "success" | "error"`.

- [ ] **Step 3: Replace the spinner component**

Rewrite `frontend/src/components/LoadingSpinner.tsx` to use `Loader2` from `lucide-react`:

```tsx
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Verify shared components in isolation**

Run: `cd frontend && pnpm build`
Expected: build passes with the new app-layer components available to page migrations.

## Task 4: Migrate auth and profile pages

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`
- Modify: `frontend/src/pages/ProfilePage.tsx`

- [ ] **Step 1: Migrate `LoginPage.tsx` to class-based layout and shadcn primitives**

Replace `useStyletron`, `FormControl`, `Input`, `Button`, and `Notification` usage with `Card`, `Input`, `Button`, `FormField`, and `StatusBanner`.

The component shape should start like:

```tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/app/form-field";
import { StatusBanner } from "@/components/app/status-banner";
```

- [ ] **Step 2: Migrate `RegisterPage.tsx` with the same shared form structure**

Keep the existing register flow, field names, and redirect behavior. Do not change the auth store contract.

Representative button block:

```tsx
<Button type="submit" className="w-full" disabled={loading}>
  {loading ? "注册中..." : "创建账户"}
</Button>
```

- [ ] **Step 3: Migrate `ProfilePage.tsx`, including checkbox and select controls**

Map the profile form to the new shared field wrappers. Use `Checkbox` for smoking and `Select` for drinking/exercise. Keep the current payload shape:

```ts
const data: HealthProfileCreate = {
  age: age ? Number(age) : undefined,
  gender: gender || undefined,
  height_cm: height ? Number(height) : undefined,
  weight_kg: weight ? Number(weight) : undefined,
  smoking,
  drinking,
  exercise,
};
```

For the selects, normalize local state from `BaseUI` array shape to string IDs:

```ts
const [drinking, setDrinking] = useState("none");
const [exercise, setExercise] = useState("occasional");
```

- [ ] **Step 4: Verify the auth/profile batch**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/login`
- `/register`
- `/profile`

Expected: forms render, submit handlers still compile, and the select conversion does not break the profile payload.

## Task 5: Migrate records and interpretation pages

**Files:**
- Modify: `frontend/src/pages/RecordsPage.tsx`
- Modify: `frontend/src/pages/RecordDetailPage.tsx`
- Modify: `frontend/src/pages/NewRecordPage.tsx`

- [ ] **Step 1: Migrate the records list page using shared shells and empty states**

`RecordsPage.tsx` should use `PageShell`, `Button`, `Card`, and `EmptyState` instead of inline Styletron objects.

Representative empty state:

```tsx
<EmptyState
  title="暂无健康记录"
  description="添加您的第一条体检记录，开始 AI 健康分析"
  action={<Button onClick={() => navigate("/records/new")}>立即添加</Button>}
/>
```

- [ ] **Step 2: Migrate `RecordDetailPage.tsx` without changing the interpretation logic**

Keep the existing `getRecord` and `interpretRecord` flow. Replace only the visual structure:

```tsx
{error ? <StatusBanner variant="error" message={error} /> : null}
```

Use cards and badge-like spans for indicator status and risk levels. Keep the `JSON.parse(record.interpretation_json)` path unchanged.

- [ ] **Step 3: Migrate `NewRecordPage.tsx`, including tabs and upload feedback**

Replace `Tabs`/`Tab` from BaseUI with shadcn tabs:

```tsx
<Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="manual">手动录入</TabsTrigger>
    <TabsTrigger value="upload">上传报告</TabsTrigger>
  </TabsList>
  <TabsContent value="manual">...</TabsContent>
  <TabsContent value="upload">...</TabsContent>
</Tabs>
```

Keep drag-and-drop behavior and `uploadStatus` state. Convert upload notifications into `StatusBanner`.

- [ ] **Step 4: Verify the records batch**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/records`
- `/records/new`
- `/records/:id`

Expected: manual entry, file-selection UI, and AI interpretation actions still render and navigate correctly.

## Task 6: Migrate layout, dashboard, and organs pages

**Files:**
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/pages/OrgansPage.tsx`

- [ ] **Step 1: Rebuild `Layout.tsx` as a Tailwind sidebar shell**

Keep the same nav destinations and logout behavior. Replace `NavLink` styling with class-based active-state handling:

```tsx
className={({ isActive }) =>
  cn(
    "block rounded-xl px-4 py-3 text-sm transition-colors",
    isActive
      ? "bg-sky-500/10 text-sky-300"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  )
}
```

- [ ] **Step 2: Migrate `DashboardPage.tsx` to cards and action buttons**

Keep `getOrgans()` and `getRecords()` calls as they are. Rebuild the quick actions, organ overview cards, and recent record cards using `Card` and `Button`.

- [ ] **Step 3: Migrate `OrgansPage.tsx` to the same card language**

Retain the existing risk color mapping and updated date formatting, but express the UI through the shared primitives and Tailwind classes.

- [ ] **Step 4: Verify the navigation batch**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke check:
- `/dashboard`
- `/organs`
- sidebar navigation
- logout

Expected: the authenticated shell remains usable and route changes still work.

## Task 7: Remove dead imports, clean CSS, and run final validation

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Modify: all files under `frontend/src/` that still reference `baseui` or `styletron`

- [ ] **Step 1: Confirm all BaseUI and Styletron imports are gone**

Run: `cd frontend && rg -n "baseui|styletron" src`
Expected: no matches.

- [ ] **Step 2: Clean leftover template assets and dead style hooks if still present**

Delete references to Vite starter artifacts that are no longer used, but only if they are already dead after migration:

```bash
cd frontend && rg -n "react.svg|vite.svg|hero.png|App.css" src
```

- [ ] **Step 3: Run the final verification suite**

Run:
- `cd frontend && pnpm lint`
- `cd frontend && pnpm build`

Manual smoke checklist:
- login
- registration
- profile edit
- record creation
- record detail view
- dashboard navigation
- organs view

Expected: all major routes render, the app builds, and no BaseUI dependency remains.

- [ ] **Step 4: Commit the completed migration**

Run:

```bash
git add frontend/package.json frontend/pnpm-lock.yaml frontend/components.json frontend/postcss.config.js frontend/src
git commit -m "migrate frontend from BaseUI to shadcn"
```

## Self-Review

### Spec coverage

- Tailwind setup is covered in Task 1.
- `shadcn/ui` primitives and provider removal are covered in Task 2.
- Thin app wrappers are covered in Task 3.
- Form pages are covered in Task 4.
- Record flows are covered in Task 5.
- Navigation and overview pages are covered in Task 6.
- Dependency removal and final validation are covered in Task 7.

No spec requirement is currently uncovered.

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation markers remain.
- Each task lists concrete file paths and verification commands.
- The only intentionally flexible area is the internal styling details of individual cards and wrappers, which does not affect the migration boundary or interface contracts.

### Type consistency

- Shared component names are consistent across tasks: `PageShell`, `FormField`, `StatusBanner`, `EmptyState`.
- The profile page migration normalizes select state to strings consistently with the planned `Select` component usage.
- Route paths and API function names match the existing codebase.
