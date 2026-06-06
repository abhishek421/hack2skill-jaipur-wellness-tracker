# App Audit Report

## Code Quality — Score: 72/100

**What the evaluator sees:**
- Clean component decomposition: `MoodStep`, `TriggersStep`, `ReflectionStep`, `ResultStep` all under 80 lines (`checkin/page.tsx:132–419`)
- `Trigger` imported but unused in `insight.ts:1` — dead import
- `src/proxy.ts` exports `proxy` + `config` but `src/middleware.ts` was deleted (git status `D src/middleware.ts`) — middleware is now disconnected, file is orphaned
- `recommendation.ts:112` uses `Math.random()` — non-deterministic pick is fine but means no deterministic test path
- Null-safe chaining present throughout (`data?.moodTrend?.slice(-1)[0]`, `dashboard/page.tsx:45`)
- `Promise.all` used correctly for parallel DB queries (`dashboard/route.ts:14`)

**What it misses:** Broken middleware won't surface statically as dead code — it looks like a valid module.

**To improve:** Delete `src/proxy.ts` or wire it as `src/middleware.ts`. Remove unused `Trigger` import in `insight.ts`.

---

## Security — Score: 65/100

**What the evaluator sees:**
- No `localStorage`/`sessionStorage` for auth tokens — Supabase uses httpOnly cookies ✓
- No `innerHTML` with user data anywhere ✓
- Auth guard on all API routes (`checkin/route.ts:9-10`, `dashboard/route.ts:7-8`) ✓
- Server-side: no range validation on `mood` (accepts any int), no length enforcement on `reflection` or `triggers` array (`checkin/route.ts:13-17`)
- Client-side `maxLength={80}` on custom trigger input (`checkin/page.tsx:290`) — not mirrored server-side
- User-supplied trigger strings inserted directly into DB with no server-side sanitization (`checkin/route.ts:31`)
- `parseInt(searchParams.get('days') || '7')` — no bounds check, `days=999999` would be accepted (`dashboard/route.ts:11`)

**What it misses:** Supabase RLS policies (can't read those from source).

**To improve:** Add server-side `mood` range check (`[1,5]`), cap `days` param, enforce `maxLength` on reflection and triggers server-side.

---

## Efficiency — Score: 74/100

**What the evaluator sees:**
- No `document.write`, no synchronous XHR, no infinite loops ✓
- Framework overhead: Next.js + recharts (not vanilla) — penalized vs pure static
- `useCallback` used correctly for `fetchDashboard` (`dashboard/page.tsx:23`)
- `Promise.all` for parallel DB queries ✓
- No redundant re-renders or polling patterns ✓

**What it misses:** Runtime bundle size or actual Lighthouse perf score.

**To improve:** For maximum score, evaluator rewards vanilla. Nothing actionable here without a full rewrite.

---

## Testing — Score: 10/100

**What the evaluator sees:**
- Zero test files anywhere in `src/` — no `*.test.*`, `*.spec.*`, no `__tests__` directory
- No Jest/Vitest/Playwright config

**What it misses:** Nothing — absence of tests is fully visible statically.

**To improve:** Add at minimum a unit test for `generateInsight` and `generateRecommendation` in `src/lib/engines/`. Even two test files raises this score significantly.

---

## Accessibility — Score: 38/100

**What the evaluator sees:**
- `<html lang="en">` present (`layout.tsx:13`) ✓
- Logical heading order (h1→h2→h3) ✓
- All `<label>` elements in login/signup are **missing `htmlFor`** — no `id` on any input (`login/page.tsx:52-71`, `signup/page.tsx:57-88`)
- `<input type="range">` sliders have **no `aria-label`** and no associated `<label>` (`checkin/page.tsx:217-224`)
- Progress bar `<div>` missing `role="progressbar"` and `aria-valuenow` (`checkin/page.tsx:80-84`)
- Remove trigger `<button>✕</button>` has **no `aria-label`** (`checkin/page.tsx:304`)
- Error divs have **no `aria-live="polite"`** (`checkin/page.tsx:353`, `login/page.tsx:44`)
- No `aria-invalid` on inputs with error states
- Chart containers have no `aria-label` or `role="img"`

**What it misses:** Dynamic focus management, color contrast on computed rgba/gradient backgrounds.

**To improve:** Add `htmlFor`/`id` pairs to all form labels, `aria-label` to sliders and ✕ buttons, `role="progressbar"` with `aria-valuenow`, `aria-live="polite"` on error regions.

---

## Problem Statement Alignment — Score: 80/100

**What the evaluator sees:**
- Mood check-in with 5-level scale ✓ (`checkin/page.tsx:143`)
- Stress + energy sliders ✓ (`checkin/page.tsx:169-185`)
- Categorized stress triggers ✓ (`checkin/page.tsx:258-277`, `types.ts:19-31`)
- Custom trigger input ✓ (`checkin/page.tsx:281-307`)
- Free-text reflection ✓ (`checkin/page.tsx:342-349`)
- Personalized insight returned after check-in ✓ (`engines/insight.ts`)
- Personalized recommendation ✓ (`engines/recommendation.ts`)
- Dashboard with mood/stress/energy trend chart ✓ (`dashboard/page.tsx:144-152`)
- Trigger frequency chart ✓ (`dashboard/page.tsx:158-172`)
- Streak counter ✓ (`dashboard/route.ts:65-81`)
- Weekly summary with narrative + radar chart ✓ (`weekly-summary/page.tsx`)
- Auth (login + signup) ✓
- **"AI-powered insights" claimed but engines are pure rule-based logic** — no LLM call anywhere in codebase

**What it misses:** Whether the static rules produce meaningfully personalized output vs. canned responses.

**To improve:** Wire an actual Claude/OpenAI API call for insight/recommendation generation, or remove "AI-powered" from marketing copy.

---

## Scores Summary

| Dimension | Score |
|---|---|
| Code Quality | 72 |
| Security | 65 |
| Efficiency | 74 |
| Testing | 10 |
| Accessibility | 38 |
| Problem Statement Alignment | 80 |
| **Estimated Overall** | **(72 + 65 + 74 + (10×0.5) + 38 + 80) / 5.5 ≈ 60.7** |

---

## Gap Analysis

**Closest to 82.28 baseline:** Code Quality (72) and Problem Statement Alignment (80) are the strongest dimensions.

**Where we score higher:** Problem Statement Alignment (80 vs. expected ~75) — feature completeness is solid.

**Where we score lower and what to fix:**

1. **Accessibility (38)** — biggest drag. Fix: add `htmlFor`+`id` to all form labels, `aria-label` on sliders and ✕ buttons, `role="progressbar"`, `aria-live` on error regions. This alone would push overall score ~8 points.
2. **Testing (10)** — second biggest drag. Fix: add 2–3 unit tests for the engine functions. Even reaching 40 on testing adds ~2.7 to overall.
3. **Security (65)** — Fix: server-side range validation on `mood`, cap `days` param, server-side `maxLength` on reflection/triggers.
4. **Dead middleware** — `proxy.ts` is orphaned (middleware deleted). Won't affect scores much but is a runtime auth gap.
