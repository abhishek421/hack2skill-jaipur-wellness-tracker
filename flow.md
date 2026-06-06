# MindTrack - User Flow & Test Specification

This document details the user journey, interaction flows, accessibility features, and verification checkpoints for **MindTrack** (Airy Cloud Glassmorphism Version). It is written for both human developers and automated AI testing agents.

---

## 1. Overview & Architecture

MindTrack implements the **Track → Understand → Improve** wellness cycle. The application utilizes a Next.js 16 frontend styled with an **Airy Cloud Glassmorphism** system, backed by a Supabase database and OpenAI-driven weekly syntheses.

### Core Routing Map
- **Public Routes:**
  - `GET /` — Redirects to `/dashboard` if authenticated, else `/auth/login`.
  - `GET /auth/login` — Sign-in interface.
  - `GET /auth/signup` — Account registration.
- **Authenticated/Protected Routes:** (Guard logic defined in [src/proxy.ts](file:///Users/abhi/Documents/hack2skill/src/proxy.ts))
  - `GET /dashboard` — Analytics, trends, and recent recommendations.
  - `GET /checkin` — Multi-step wellness logging wizard.
  - `GET /weekly-summary` — AI-generated weekly report.
- **Backend APIs:**
  - `POST /api/checkin` — Saves check-in data with server-side validation.
  - `GET /api/dashboard` — Retrieves metrics, streak, and recent actions.
  - `GET /api/weekly-summary` — Retrieves weekly statistics and AI narrative with fallback capability.

---

## 2. Design System: Airy Cloud Glassmorphism

Testing agents must expect the following CSS structures and styles representing the **Airy Cloud** theme:
- **Global Theme Color:** Restricted to soft sky blues, cyans, and clean white tones.
- **Global Background:** Gradient from light sky blue to pure white: `.bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF]`.
- **Card Containers:** Frosted white panels using: `.bg-white/70 .backdrop-blur-xl .border-white/60 .shadow-[0_8px_30px_rgb(59,130,246,0.1)]`.
- **Primary Buttons:** Blue actions with glowing shadow offsets: `.bg-blue-500 .text-white .shadow-lg .shadow-blue-500/30`.
- **Interactive Elements:** Emojis are retained for friendly mood icons, but decorative emojis are hidden using `aria-hidden="true"`.

---

## 3. Step-by-Step User Flows & Test Cases

### Flow 1: User Registration (Signup)

- **Endpoint / URL:** `/auth/signup`
- **Theme Frame:** Frosted glass panel wrapping authentication forms (`AuthLayout`) with a hidden-on-mobile banner image (`public/auth-banner.png`) on the left.
- **UI Elements & Selectors:**
  - Name input: `input[id="signup-name"]` or `input[type="text"]` (placeholder: `"Your name"`) linked to a `<label>`
  - Email input: `input[type="email"]` linked to a `<label>`
  - Password input: `input[type="password"]` (placeholder: `"At least 6 characters"`) linked to a `<label>`
  - Submit Button: `button[type="submit"]` (text: `"Create Account"`, has `aria-busy` set to true during submission)

#### Assertions & Verification:
1. Navigate to `/auth/signup`.
2. Enter valid registration fields. Click **Create Account**.
3. **Assertion:** Upon successful signup, the router redirects to `/dashboard`.
4. **Validation Check:** Server-side constraints reject empty fields.

---

### Flow 2: User Login & Session Gate

- **Endpoint / URL:** `/auth/login`
- **UI Elements:**
  - Email input: `input[type="email"]`
  - Password input: `input[type="password"]`
  - Submit Button: `button[type="submit"]` (text: `"Sign In"`)
  - Error Box: `[role="alert"]` with `aria-live="polite"`

#### Assertions & Verification:
1. Navigate to `/dashboard` directly without authentication.
2. **Assertion:** Guard logic redirects the browser back to `/auth/login`.
3. Input correct credentials on `/auth/login` and submit.
4. **Assertion:** Navigates to `/dashboard`. Invalid submissions render an error box displaying `role="alert"` and `aria-live="polite"`.

---

### Flow 3: Daily Check-In Flow (Multi-step Wizard)

- **Endpoint / URL:** `/checkin`
- **Wizard Progress Bar:** `role="progressbar"` with attributes `aria-valuenow`, `aria-valuemin={1}`, `aria-valuemax={3}`, and `aria-label="Step X of 3"`.

#### Step 3.1: Mood, Stress, & Energy Selection (`step = 'mood'`)
- **UI Elements:**
  - Emojis: 5 buttons containing `😢`, `😞`, `😐`, `🙂`, `😄` having `aria-pressed` set to true when selected and `aria-label` matching mood labels.
  - Stress Slider: `input[type="range"][id="slider-stress-level"]` with `aria-label="Stress Level: X out of 5"`, `aria-valuenow`.
  - Energy Slider: `input[type="range"][id="slider-energy-level"]` with `aria-label="Energy Level: X out of 5"`, `aria-valuenow`.
  - Continue Button: `button` with text `"Continue →"` (disabled until a mood is selected).

#### Step 3.2: Trigger Identification (`step = 'triggers'`)
- **UI Elements:**
  - Standard trigger pills: Individual buttons (e.g. `Exam Anxiety`, `Study Backlog`) with `aria-pressed` state.
  - Custom trigger input: Text box `input[id="custom-trigger-input"]` with placeholder `"Describe another trigger..."` and label hidden using `.sr-only`.
  - Add Button: `button` with text `"Add"` (disabled if input is empty).
  - Custom triggers list: Shows added trigger pills with a remove button containing `aria-label="Remove trigger: [name]"`.

#### Step 3.3: Reflection Journal (`step = 'reflection'`)
- **UI Elements:**
  - Textarea: `textarea[id="reflection-text"]` linked to a screen-reader-only label and `aria-describedby="reflection-char-count"`.
  - Character counter: `p[id="reflection-char-count"]` displaying `X/1000`.

#### Step 3.4: Insight & Recommendation Results (`step = 'result'`)
- **UI Elements:**
  - `💡 Today's Insight` container containing rule-based insights.
  - `🎯 Recommended Action` container containing personalized recommendations.

#### API Validation Guard (Server-Side Checks):
If an agent attempts a direct POST to `/api/checkin`:
- `mood`, `stressLevel`, and `energyLevel` must be integers between `1` and `5`. (Out-of-range returns `400`).
- `triggers` array length must be $\le 20$, and each trigger string must be $\le 100$ characters.
- `reflection` string must be $\le 1000$ characters.

---

### Flow 4: Dashboard Overview

- **Endpoint / URL:** `/dashboard`
- **UI Elements & Visuals:**
  - Header: Welcoming string `"Hello, [Name] 👋"`.
  - Stat Cards: Glassmorphic boxes representing mood emoji, streak days count, stress level, and energy level.
  - Timeframe Filters: 3 buttons `"7 days"`, `"14 days"`, and `"30 days"`.
  - Recharts SVG Wrapper: Wrapped in `[role="img"][aria-label="Mood & Stress Trend"]` and `[role="img"][aria-label="Top Stress Triggers"]`.
  - Recent Wellness Actions: Panel displaying the recent history.

#### Test Steps & Assertions:
1. **Sanitisation Verification:** Click `"30 days"` filter.
   - **Assertion:** Triggers API fetch `/api/dashboard?days=30`. The backend sanitizes the parameter using `Math.min(Math.max(rawDays, 1), 90)` to prevent excessive DB queries.
2. **Null-Dereference Safety:** Verify dashboard does not crash on slow or failing network requests. The rendering is protected via a loading state wrapper and null-guards on data fields.

---

### Flow 5: Weekly Summary & AI-Powered Narrative

- **Endpoint / URL:** `/weekly-summary`
- **UI Elements:**
  - Narrative Card: Outstanding floating glass pane containing the dynamic reflection narrative.
  - Metrics Grid: Average mood, average stress, average energy, and check-ins count.
  - Radar Chart: Wrapped in `[role="img"][aria-label="Wellness balance radar chart: ..."]` mapping Mood, Energy, and Calmness (`6 - avgStress`).

#### AI Narrative Engine & Lifecycle Specs:
The backend fetches check-ins, triggers, and reflection journals to build the LLM payload.
1. **PII Sanitisation:** Before sending data to the OpenAI API:
   - Email addresses and phone numbers in reflection text are replaced with `[contact]`.
   - Excerpts are limited to 3 snippets, and each is truncated to 100 characters max (`…` appended).
   - Curly braces `{}` are removed to prevent prompt injections.
2. **LLM Execution:** The server calls OpenAI with the configured model (default `gpt-4o-mini`) using `OPENAI_API_KEY`.
3. **Hard Constraint Guardrails:**
   - **Word Limit:** The server truncates and appends `…` if the narrative exceeds 120 words.
   - **Latency Timeout:** Enforces a 5-second hard timeout. If exceeded, the engine cancels the call and triggers the fallback.
4. **Caching Rule:**
   - *Current (Open) Week:* Evaluated on-the-fly on every request (narrative is not cached).
   - *Closed Week:* The generated narrative is permanently saved to the `weekly_summaries` table to prevent duplicate LLM calls.
5. **Fallback:** If OpenAI throws an error or times out, the API gracefully falls back to the deterministic rule-based generator, returning `narrativeSource: 'rule-based'` in the JSON response.

---

## 4. Automated Testing Suite

MindTrack uses **Vitest** to run unit and integration tests. Run the test suite using:
```bash
npm run test
```

### Test Coverage Map
- **Insight Engine Unit Tests (`src/lib/engines/__tests__/insight.test.ts`):** Verifies trigger-based insights, elevated stress alerts, low energy patterns, declining mood trends, and fallback defaults.
- **Recommendation Engine Unit Tests (`src/lib/engines/__tests__/recommendation.test.ts`):** Verifies trigger mappings, motivating defaults, anti-repetition filter limits, and calming keyword prioritization.
- **Check-in API Handler Tests (`src/app/api/checkin/__tests__/route.test.ts`):** Mocks Supabase and tests authorization (401), invalid ranges (400 for out-of-bounds metrics, length limits), and successful insertion (200).
- **Dashboard API Handler Tests (`src/app/api/dashboard/__tests__/route.test.ts`):** Verifies streak calculations, data structuring, and history limits.
- **Weekly Summary API Handler Tests (`src/app/api/weekly-summary/__tests__/route.test.ts`):** Mocks the OpenAI client to verify the AI summary workflow, database caching checks, and the rule-based fallback mechanism when the AI fails.
