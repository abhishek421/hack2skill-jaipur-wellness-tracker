# Eval Audit Report — MindTrack (hack2skill)

**Date:** 2026-06-06  
**Evaluator:** claude-sonnet-4-6 (eval-app skill)  
**Baseline to beat:** 82.28

---

## Code Quality — Score: 72/100

**What the evaluator sees:**
- Three functions exceed 80 lines: `DashboardPage` (~200 lines, `dashboard/page.tsx:15`), `CheckInPage` (~123 lines, `checkin/page.tsx:15`), and the `GET` handler in `weekly-summary/route.ts:64` (~130 lines) — all flagged
- Null-dereference risk: `data.recentActions.map(...)` at `dashboard/page.tsx:194` is not null-guarded; `data` is typed as `DashboardData | null` and can be null after a failed fetch
- Good: naming quality, TypeScript types, separation of engine/route/UI, no dead code

**What it misses:** Dashboard renders `data.recentActions` inside the loading-false branch but doesn't guard against `data` being null from a silent fetch failure

**To improve:** Extract chart sections into separate components; add `if (!data) return <EmptyState />` before rendering `recentActions`

---

## Security — Score: 85/100

**What the evaluator sees:**
- All API routes authenticate via `supabase.auth.getUser()` server-side — not trusting client-sent user IDs ✓ (`checkin/route.ts:9`, `dashboard/route.ts:7`, `weekly-summary/route.ts:67`)
- Full input validation in checkin: integer range checks, array length limit (20), trigger string length (100), reflection max (1000) — `checkin/route.ts:19-33` ✓
- No `localStorage` for sensitive data — Supabase SSR uses httpOnly cookies
- No `innerHTML` usage anywhere ✓
- `OPENAI_API_KEY` from `process.env`, not hardcoded ✓
- `days` param sanitized: `Math.min(Math.max(rawDays, 1), 90)` at `dashboard/route.ts:12` ✓
- Reflection PII scrubbed before LLM via `sanitiseSnippets()` at `generateWeeklyNarrative.ts:30`

**What it misses:** No CSP headers; `aria-invalid` applied to all fields on any error (not per-field), but this is an a11y issue

**To improve:** Minor: tighten `aria-invalid` to field-specific error states

---

## Efficiency — Score: 75/100

**What the evaluator sees:**
- Next.js + Recharts + OpenAI SDK framework overhead — not vanilla
- No `document.write`, no sync XHR, no infinite loops ✓
- `Promise.all` for parallel DB queries in `dashboard/route.ts:15` and `weekly-summary/route.ts:86` ✓
- `useCallback` on `fetchDashboard` at `dashboard/page.tsx:23` ✓
- One nested async inside `Promise.all` at `dashboard/route.ts:27` (a second Supabase subquery inside `in()`)

**What it misses:** Runtime cost of the nested trigger subquery is real but not a static anti-pattern

**To improve:** Denormalize the trigger subquery or restructure the `Promise.all` to avoid serial Supabase calls inside the parallel block

---

## Testing — Score: 47/100

**What the evaluator sees:**
- Two test files exist: `src/lib/engines/__tests__/insight.test.ts` (8 cases) and `recommendation.test.ts` (9 cases)
- Vitest configured with path aliases — tests actually run ✓
- All branches of `generateInsight` covered; trigger-specific, anti-repetition, and calming-priority cases in `generateRecommendation` ✓

**What it misses:** No tests for 3 API routes, no tests for `generateWeeklyNarrative`, no UI component tests — ~18 of 20 source files are untested

**To improve:** Add route-level tests for `checkin`, `dashboard`, `weekly-summary`; mock Supabase and OpenAI clients

---

## Accessibility — Score: 80/100

**What the evaluator sees:**
- `<html lang="en">` ✓ (`layout.tsx:12`)
- `<label htmlFor>` on login, signup, reflection, slider inputs ✓
- Custom trigger `<input>` at `checkin/page.tsx:293` has **no `<label>` or `aria-label`** — only a `placeholder` — WCAG 1.3.1 violation ❌
- `role="progressbar"` with `aria-valuenow/min/max/label` ✓ (`checkin/page.tsx:83`)
- `role="alert"` + `aria-live="polite"` on errors in login, signup, reflection ✓
- `aria-invalid` on error state inputs ✓
- `aria-busy` on submit buttons ✓
- `role="img"` + `aria-label` on chart wrappers ✓
- Logical heading order h1→h2→h3 ✓
- Decorative emojis marked `aria-hidden="true"` ✓

**What it misses:** Mood emoji buttons and trigger pill buttons lack `aria-pressed` — selected state not programmatically conveyed; evaluator may not flag `aria-pressed` absence (WCAG 4.1.2 is runtime, not purely static)

**To improve:** Add `<label className="sr-only" htmlFor="custom-trigger-input">Describe another trigger</label>` at `checkin/page.tsx:293`; add `aria-pressed={selected.includes(item)}` to trigger pills

---

## Problem Statement Alignment — Score: 91/100

**What the evaluator sees:**
- ✓ Mood tracking (1–5 scale with emoji + label, `checkin/page.tsx`)
- ✓ Stress + energy sliders with live feedback
- ✓ Categorized trigger selection (Academic, Lifestyle, Social) + custom free-text
- ✓ Reflection journal with 1000-char cap
- ✓ AI insight engine (rule-based, `insight.ts`) — real logic, not static
- ✓ Personalized recommendation engine (trigger-keyed + anti-repetition, `recommendation.ts`)
- ✓ Dashboard with area chart (mood/stress/energy trend) + bar chart (trigger frequency)
- ✓ Check-in streak counter
- ✓ Weekly summary with **actual OpenAI call** (`generateWeeklyNarrative.ts:42`) + graceful rule-based fallback
- ✓ Wellness balance radar chart
- ✓ Auth (Supabase email/password login + signup)

**What it misses:** No push notifications or proactive reminders; `isClosed` logic at `weekly-summary/route.ts:73` is always false — cache path never runs for current weeks

**To improve:** Fix `isClosed`: it compares `now > weekStart + 7d` which equals `now > now` — always false; intended check is whether the week window has elapsed relative to a fixed anchor, not `Date.now()`

---

## Scores Summary

| Dimension | Score |
|---|---|
| Code Quality | 72 |
| Security | 85 |
| Efficiency | 75 |
| Testing | 47 |
| Accessibility | 80 |
| Problem Statement Alignment | 91 |
| **Estimated Overall** | **(72 + 85 + 75 + (47×0.5) + 80 + 91) / 5.5 ≈ 77.5** |

---

## Gap Analysis

**Closest to 82.28 baseline:** Security (85) and Alignment (91) both exceed it; A11y (80) is close

**Where we score higher:** Security (+3), Alignment (+9)

**Where we score lower and what to fix:**

| Dimension | Gap | Fix |
|---|---|---|
| Code Quality | −10 | Split `DashboardPage` and `weekly-summary GET` into sub-components/helpers; add null guard on `data.recentActions` |
| Testing | −35 | Add route tests for all 3 API handlers; mock Supabase via `vitest.mock` |
| Efficiency | −7 | Flatten the nested trigger subquery out of `Promise.all` |
| Accessibility | −2 | Add `<label>` to custom trigger input; add `aria-pressed` to pills |

Fixing Code Quality + Testing alone would raise the overall to ~83+, beating the 82.28 baseline.
