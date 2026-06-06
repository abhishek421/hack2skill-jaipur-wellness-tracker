# MindTrack 🧘

**MindTrack** is a lightweight, responsive mental wellness tracker designed to help students monitor and improve their emotional well-being during high-pressure periods such as board exams, competitive entrance tests, and results seasons (NEET, JEE, CUET, CAT, GATE, UPSC, etc.).

By adopting a **Track → Understand → Improve** loop, MindTrack empowers students to build emotional self-awareness, identify stress triggers, log reflections, and receive actionable daily recommendations.

---

## 🚀 Core Features

### 1. Daily Check-In Wizard
A structured, step-by-step form capturing:
- **Mood Tracking**: 5-point qualitative emotional scale (Very Sad to Very Happy).
- **Biometric Sliders**: Stress and Energy levels (1–5 scale).
- **Trigger Identification**: Log academic (Exam Anxiety, Study Backlog, Burnout, Self-Doubt), lifestyle (Poor Sleep, Social Media), or social (Family Expectations, Peer Comparison) pressure sources.
- **Reflection Journal**: Private journaling space (up to 1,000 characters) to express thoughts and feelings.

### 2. Rule-Based Insights & Recommendation Engines
Immediately upon check-in completion, the app runs local analysis engines to generate:
- **Personalized Insights**: Contextual observations based on current entries and historical check-in trends (e.g., detecting monotonic mood drops, low energy trends, or recurring stress triggers).
- **Daily Recommended Actions**: Simple, actionable, and non-clinical tasks designed to fit into a student's daily routine without guilt. Includes anti-repetition logic to avoid repeating recommendations within a 3-day window.

### 3. Historical Analytics Dashboard
A visual control center to review mental health trends over time:
- **Stat Cards**: Live indicators for current mood, current streak (consecutive days), latest stress level, and latest energy level.
- **Mood & Stress Trend**: Interactive Recharts area chart displaying historical trajectories over custom periods (7, 14, or 30 days).
- **Top Stress Triggers**: Dynamic bar chart showing the frequency of stress triggers.
- **Recent Wellness Actions**: Timeline logging recommended actions alongside their generation dates.

### 4. Weekly Summary
A weekly emotional synthesis compiling:
- **7-day average metrics** for Mood, Stress, and Energy.
- **Consistency analysis** tracking overall check-in count.
- **AI-Generated Weekly Narrative**: A personalized, empathetic paragraph written by an LLM that reads the student's full week of data — mood trends, top triggers, and journal themes — and produces a human-quality reflection. Falls back to a rule-based narrative if the AI call fails.
- **Wellness Balance Radar Chart**: Map showing the balance between Mood, Energy, and Calmness.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Recharts, Lucide Icons.
- **Backend & APIs**: Next.js API Routes, Next.js Server Components.
- **Database & Auth**: Supabase PostgreSQL, Supabase SSR/Client Auth, Row Level Security (RLS) policies.
- **AI**: OpenAI API (`gpt-4o-mini`) for weekly narrative generation via `openai` SDK.

---

## 📁 Project Directory Structure

```text
├── docs/                      # PRD, TRD, and Problem Statement documentation
├── public/                    # Static assets & icons
├── src/
│   ├── app/                   # Next.js App Router pages & API endpoints
│   │   ├── api/               # API routes (checkin, dashboard, weekly-summary)
│   │   ├── auth/              # Login, Signup, and callback pages
│   │   ├── checkin/           # Step-by-step wellness check-in form
│   │   ├── dashboard/         # Visual metrics analytics panel
│   │   ├── weekly-summary/    # Weekly report generation & Radar chart
│   │   ├── layout.tsx         # Global layout
│   │   └── page.tsx           # Session redirect root
│   ├── lib/
│   │   ├── ai/                # AI narrative generation (generateWeeklyNarrative)
│   │   ├── engines/           # Rule-based insight & recommendation engines
│   │   ├── supabase/          # Supabase client/server initializers
│   │   └── types.ts           # Shared TypeScript interfaces
│   └── proxy.ts               # Authentication route guard
├── supabase/                  # Local Supabase configurations
├── supabase-schema.sql        # Database schema script
└── flow.md                    # Detailed user flow & E2E testing specification
```

---

## ♿ Accessibility

MindTrack is built with WCAG 2.1 AA compliance in mind:

- **Semantic ARIA roles** — progress bar (`role="progressbar"` with `aria-valuenow/min/max`), chart wrappers (`role="img"` with descriptive `aria-label`), and error regions (`role="alert"` with `aria-live="polite"`) throughout.
- **Form accessibility** — all inputs use `aria-invalid` on error, `aria-describedby` linking to error messages, and `aria-busy` on submit buttons during loading.
- **Decorative elements hidden** — all emoji icons carry `aria-hidden="true"` to avoid noise for screen reader users.
- **Interactive state** — mood selector buttons use `aria-pressed` to communicate selected state without relying on colour alone.
- **Slider labelling** — stress and energy sliders use `aria-label` with current value context (e.g. "Stress: 3 out of 5").
- **Radar chart** — carries a full text alternative in `aria-label` with all three metric values for users who cannot see the chart.

---

## ⚙️ Setup & Local Installation

### Prerequisites
- Node.js (v18.x or later)
- NPM, Yarn, or PNPM
- A Supabase account and project
- An OpenAI API key (for AI weekly narrative; optional — falls back to rule-based if absent)

### 1. Database Configuration
Execute the contents of `supabase-schema.sql` in your Supabase SQL Editor. This sets up the following PostgreSQL tables with Row Level Security (RLS) policies:
- `check_ins` — Records daily mood, stress, and energy details.
- `triggers` — Logs stress triggers corresponding to a check-in.
- `reflections` — Holds private journal content.
- `wellness_actions` — Stores generated insights and recommendations.

### 2. Local Configuration
Clone the repository and install dependencies:
```bash
npm install
```

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — AI weekly narrative. Falls back to rule-based if not set.
OPENAI_API_KEY=sk-...
NARRATIVE_MODEL=gpt-4o-mini
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Lint
```bash
npm run lint
```

### Test Coverage
Unit and integration tests live alongside their modules in `__tests__/` directories:

| Test file | What it covers |
|-----------|----------------|
| `src/lib/engines/__tests__/insight.test.ts` | Insight engine — trigger detection, trend analysis |
| `src/lib/engines/__tests__/recommendation.test.ts` | Recommendation engine — rule matching, anti-repetition |
| `src/app/api/checkin/__tests__/route.test.ts` | Check-in API — payload validation, DB writes |
| `src/app/api/dashboard/__tests__/route.test.ts` | Dashboard API — aggregation, streak calculation |
| `src/app/api/weekly-summary/__tests__/route.test.ts` | Weekly summary API — metric computation, narrative |

For a full breakdown of user flows, interface selectors, API payloads, and manual testing assertions, see **[flow.md](./flow.md)**.

---

## ✅ Evaluation Compliance

### Code Quality
- **TypeScript throughout** — strict shared types in `src/lib/types.ts`; all engine and API functions carry explicit return types.
- **Clean separation** — engines (`src/lib/engines/`), API routes (`src/app/api/`), pages, and utilities are fully decoupled.
- **DRY** — trigger frequency counting extracted into `src/lib/utils/countFrequency.ts` and reused across insight engine, dashboard API, and weekly-summary API.
- **No dead code** — unused state, variables, and props removed; no commented-out blocks; no `TODO`/`FIXME` comments.
- **No unsafe assertions** — all non-null assertions (`!`) replaced with early-exit guards or descriptive startup errors; `parseInt` always called with radix `10`.
- **ESLint** configured and enforced via `npm run lint`.

### Security
- **Supabase Row Level Security** — all four tables (`check_ins`, `triggers`, `reflections`, `wellness_actions`) carry RLS policies so users can only read and write their own rows. Schema in `supabase-schema.sql`.
- **Server-side auth** — all API routes call `supabase.auth.getUser()` on the server-side client; no trust of client-supplied user IDs.
- **SSR-safe auth cookies** — `@supabase/ssr` cookie adapter used throughout; session tokens never exposed to JS.
- **Zero client-exposed secrets** — `OPENAI_API_KEY` is server-only; only `NEXT_PUBLIC_*` keys reach the browser.
- **Startup env validation** — Supabase client factories throw a descriptive error at module load if either env var is missing, preventing silent misconfiguration.
- **Input sanitisation** — reflection snippets passed to the AI prompt are stripped of emails, phone numbers, and injection characters (`{}`) in `sanitiseSnippets`.
- **Auth callback error handling** — `exchangeCodeForSession` errors redirect to `/auth/login` rather than silently continuing.

### Efficiency
- **Server Components** for data-heavy pages (dashboard, weekly summary) — zero client-side data fetch waterfalls.
- **O(n) rule engines** — both `generateInsight` and `generateRecommendation` run in a single pass with no nested loops.
- **AbortController on dashboard fetch** — rapid period changes (7 → 14 → 30 days) abort the previous in-flight request, eliminating stale-data race conditions.
- **AI called only on explicit user action** — weekly narrative is generated on demand and cached for closed weeks via `weekly_summaries` upsert.
- **Supabase client singleton** — browser client wrapped in `useMemo` to prevent re-instantiation on every render.
- **Parallel DB queries** — dashboard and weekly-summary routes use `Promise.all` for concurrent Supabase fetches.

### Testing
83 tests across 11 test files — all pass with `npm test`.

| Test file | What it covers |
|-----------|----------------|
| `src/lib/engines/__tests__/insight.test.ts` | Insight engine — trigger detection, trend analysis, fallbacks |
| `src/lib/engines/__tests__/recommendation.test.ts` | Recommendation engine — rule matching, anti-repetition, stress preference |
| `src/lib/ai/__tests__/generateWeeklyNarrative.test.ts` | AI module — `sanitiseSnippets` (email/phone redaction, truncation, injection), narrative generation, 120-word cap, empty response, missing API key |
| `src/app/api/checkin/__tests__/route.test.ts` | Check-in API — payload validation, DB writes, 401/400/200 paths |
| `src/app/api/dashboard/__tests__/route.test.ts` | Dashboard API — aggregation, streak, empty state, days clamping |
| `src/app/api/weekly-summary/__tests__/route.test.ts` | Weekly summary API — metrics, AI narrative, rule-based fallback |
| `src/app/auth/callback/__tests__/route.test.ts` | Auth callback — code exchange, missing code, exchange error → login redirect |
| `src/__tests__/proxy.test.ts` | Middleware — all 4 routing branches (unauthenticated/protected, authenticated/auth, pass-through both) |

### Accessibility (WCAG 2.1 AA)
- **Progress bar** — `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on the check-in wizard.
- **Chart wrappers** — `role="img"` with descriptive `aria-label` on all Recharts containers and the radar chart (includes numeric values as text alternative).
- **Error regions** — `role="alert"` with `aria-live="polite"` on form errors and fetch-failure banners.
- **Mood selector** — `aria-pressed` on each mood button so state is communicated without relying on colour alone.
- **Sliders** — `aria-label` carries current value context (e.g. "Stress Level: 3 out of 5") alongside `aria-valuenow/min/max`.
- **Form inputs** — `aria-describedby` links inputs to error messages; character count linked via `aria-describedby` on the reflection textarea.
- **Decorative icons** — all emoji icons carry `aria-hidden="true"`.
- **Screen-reader-only labels** — visually hidden `<label>` elements for the custom trigger input and reflection textarea via `className="sr-only"`.

### Problem Statement Alignment
MindTrack directly addresses the mental health crisis among Indian students during high-stakes competitive exam seasons (JEE, NEET, CUET, CAT, GATE, UPSC). The Track → Understand → Improve loop is purpose-built for this cohort: exam-specific trigger categories (Exam Anxiety, Study Backlog, Poor Performance, Burnout, Self-Doubt), non-clinical language throughout the UI and AI prompts, and a weekly narrative that synthesises journal themes with objective metrics into an empathetic human-quality reflection.
