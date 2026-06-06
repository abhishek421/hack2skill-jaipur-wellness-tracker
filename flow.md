# MindTrack - User Flow & Test Specification

This document details the user journey and interaction flows for **MindTrack**, a mental wellness tracking application tailored for students preparing for examinations. It serves as both a user manual and a step-by-step testing specification for automated testing tools or AI agents.

---

## 1. Overview & Architecture

MindTrack implements the **Track → Understand → Improve** self-awareness cycle through a Next.js 16 frontend, Next.js API routes, and a Supabase backend database.

### Core Routing Map
- **Public Routes:**
  - `GET /` — Redirects to `/dashboard` if authenticated, else `/auth/login`.
  - `GET /auth/login` — Sign-in interface.
  - `GET /auth/signup` — Account registration.
  - `GET /auth/callback` — Supabase authentication callback router.
- **Authenticated/Protected Routes:** (Guard enforced via [middleware.ts](file:///Users/abhi/Documents/hack2skill/src/middleware.ts))
  - `GET /dashboard` — Metrics overview, charts, and recommendations.
  - `GET /checkin` — Step-by-step wellness tracking wizard.
  - `GET /weekly-summary` — Aggregated weekly emotional synthesis.
- **Backend APIs:**
  - `POST /api/checkin` — Submits checklist data, processes rule engines, and returns recommendations.
  - `GET /api/dashboard` — Retrieves metrics, streak calculations, trends, and recent actions.
  - `GET /api/weekly-summary` — Retrieves 7-day average metrics and generated narratives.

---

## 2. Prerequisites & Local Setup

Before conducting tests, ensure the development environment is running and configured:

1. **Environment Variables:**
   Create a `.env.local` file in the project root containing valid Supabase parameters:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Database Schema:**
   Ensure the PostgreSQL tables (`check_ins`, `triggers`, `reflections`, `wellness_actions`) and RLS policies are applied in your Supabase instance using [supabase-schema.sql](file:///Users/abhi/Documents/hack2skill/supabase-schema.sql).

3. **Start Server:**
   ```bash
   npm run dev
   ```
   Open the application at `http://localhost:3000`.

---

## 3. Step-by-Step User Flows & Test Cases

### Flow 1: User Signup & Registration

- **Endpoint / URL:** `http://localhost:3000/auth/signup`
- **Goal:** Create a new user profile.
- **UI Elements & Selectors:**
  - Name input: `input[type="text"]` (placeholder: `"Your name"`)
  - Email input: `input[type="email"]` (placeholder: `"you@example.com"`)
  - Password input: `input[type="password"]` (placeholder: `"At least 6 characters"`)
  - Submit Button: `button[type="submit"]` (text: `"Create Account"`, transitions to `"Creating account..."` on click)
  - Navigation Link: `a[href="/auth/login"]` (text: `"Sign in"`)

#### Test Steps & Assertions:
1. Navigate to `/auth/signup`.
2. Input a test Name (e.g., `Test User`), Email (e.g., `testuser@example.com`), and a Password (minimum 6 characters, e.g., `password123`).
3. Click the **Create Account** button.
4. **Assertion:** The page redirects to `/dashboard` upon successful signup.
5. *Edge Case Assertion:* Input a password with fewer than 6 characters and attempt to submit. Verify the input field shows validation errors, or that the UI displays an error alert if the signup fails due to existing credentials.

---

### Flow 2: User Login & Authentication Guard

- **Endpoint / URL:** `http://localhost:3000/auth/login`
- **Goal:** Authenticate an existing user or verify security redirection.
- **UI Elements & Selectors:**
  - Email input: `input[type="email"]` (placeholder: `"you@example.com"`)
  - Password input: `input[type="password"]` (placeholder: `"••••••••"`)
  - Submit Button: `button[type="submit"]` (text: `"Sign In"`, transitions to `"Signing in..."` on click)
  - Registration Link: `a[href="/auth/signup"]` (text: `"Sign up"`)

#### Test Steps & Assertions:
1. **Redirection Check:** Try navigating directly to `http://localhost:3000/dashboard` without a session.
   - **Assertion:** The middleware blocks navigation and redirects the browser back to `/auth/login`.
2. Navigate to `/auth/login`.
3. Input registered credentials (`testuser@example.com` / `password123`).
4. Click **Sign In**.
5. **Assertion:** The browser successfully navigates to `/dashboard`.
6. *Incorrect Credentials Check:* Input incorrect credentials and click **Sign In**.
   - **Assertion:** An error message block appears (`.bg-red-50.border-red-200.text-red-700`) stating the auth error details.

---

### Flow 3: Daily Check-In Flow (Multi-step Wizard)

- **Endpoint / URL:** `http://localhost:3000/checkin`
- **Goal:** Track mood, specify stress/energy values, select emotional triggers, log journal notes, and retrieve wellness actions.
- **Wizard Progress Indicator:** `Step X of 3` text accompanied by a loading progress bar.
- **Cancel Button:** `✕ Cancel` redirects to `/dashboard`.

#### Step 3.1: Mood, Stress, & Energy Level Selection (`step = 'mood'`)
- **UI Elements:**
  - Emojis: 5 buttons containing `😢`, `😞`, `😐`, `🙂`, `😄` respectively.
  - Stress Slider: `input[type="range"]` representing "Stress Level" (value range 1-5).
  - Energy Slider: `input[type="range"]` representing "Energy Level" (value range 1-5).
  - Continue Button: `button` containing `"Continue →"` (disabled by default).
- **Test Steps & Assertions:**
  - Attempt to click `"Continue →"` initially. **Assertion:** The button is disabled.
  - Click the emoji `😐` (Mood: 3). **Assertion:** The button is highlighted and `"Continue →"` becomes active.
  - Drag the Stress level slider to `4`.
  - Drag the Energy level slider to `2`.
  - Click `"Continue →"`. **Assertion:** Wizard changes interface to the triggers step.

#### Step 3.2: Trigger Identification (`step = 'triggers'`)
- **UI Elements:**
  - Categorized stress triggers grouped under *Academic*, *Lifestyle*, *Social*, and *Other*.
  - Trigger Buttons: Individual clickable pills (e.g. `Exam Anxiety`, `Study Backlog`, `Poor Sleep`, `Peer Comparison`, `Other`).
  - Back Button: `button` with text `"← Back"`.
  - Continue Button: `button` with text `"Continue →"`.
- **Test Steps & Assertions:**
  - Verify that no trigger pills are active by default.
  - Select `Exam Anxiety` and `Poor Sleep`. **Assertion:** Selected pills update style to solid background (`bg-indigo-600 text-white`).
  - Click `"Continue →"`. **Assertion:** Wizard changes interface to the reflection journal step.

#### Step 3.3: Reflection Journal Entry (`step = 'reflection'`)
- **UI Elements:**
  - Textarea: `textarea` (placeholder: `"What's on your mind?..."`)
  - Counter: Character tracker (e.g., `0/1000`)
  - Back Button: `button` with text `"← Back"`.
  - Complete Button: `button` with text `"✓ Complete"` (transitions to `"Saving..."` on click).
- **Test Steps & Assertions:**
  - Enter reflection content: `Feeling a bit stressed about the upcoming mock tests, sleep was interrupted.`
  - Verify that the character counter updates to match the input length.
  - Click `"✓ Complete"`.
  - **Assertion:** Trigger a POST request to `/api/checkin` containing all selections. On success, change step to results.

#### Step 3.4: Insight & Recommendation Result (`step = 'result'`)
- **UI Elements:**
  - Complete Message: `"Check-in complete!"`
  - Insight Box: Container displaying the rule-generated wellness observation (`💡 Today's Insight`).
  - Recommendation Box: Container displaying the recommended action (`🎯 Recommended Action`).
  - Completion Button: `button` containing `"View Dashboard →"`.
- **Test Steps & Assertions:**
  - **Assertion:** Insight box and Recommendation box display non-empty text values returned by the API.
  - Click `"View Dashboard →"`.
  - **Assertion:** Router navigates back to `/dashboard`.

---

### Flow 4: Dashboard Overview

- **Endpoint / URL:** `http://localhost:3000/dashboard`
- **Goal:** Access aggregated statistics, visual progress charts, and recommendation history.
- **UI Elements & Selectors:**
  - Nav Items: `"Weekly Summary"` button, `"+ Check In"` button, `"Sign out"` button.
  - Header: `"Hello, [Name] 👋"` text.
  - Stat Cards:
    - Current Mood: Shows the emoji (e.g. `😐`) and the label text (e.g. `Neutral`).
    - Streak: Displays integer value representing consecutive check-in days.
    - Latest Stress: Displays numeric level (e.g. `4/5`).
    - Latest Energy: Displays numeric level (e.g. `2/5`).
  - Timeframe Filters: Group of 3 buttons: `"7 days"`, `"14 days"`, and `"30 days"`.
  - Trend Charts (Recharts SVGs):
    - `Mood & Stress Trend` LineChart.
    - `Top Stress Triggers` BarChart.
  - Wellness Action History: Panel titled `"Recent Wellness Actions"` listing generated recommendations.

#### Test Steps & Assertions:
1. Navigate to `/dashboard`.
2. **Assertion (Active State):** Since a check-in was completed in Flow 3, the dashboard exhibits live charts and populated stat cards.
3. Observe the Stat Cards: Verify they match the inputs from Flow 3 (Mood: `😐`, Stress: `4/5`, Energy: `2/5`).
4. Click the `"14 days"` and `"30 days"` filter buttons. **Assertion:** The loading spinner briefly activates and charts recalculate without crashing.
5. Locate the **Recent Wellness Actions** list. Verify the action generated in Flow 3 (from step 3.4) appears at the top of this list with today's date.
6. *Empty State Assertion (New Users):* On a completely fresh account before any check-ins:
   - **Assertion:** Charts are replaced by an empty state container displaying `🌱 No check-ins yet` and a `"Start your first check-in"` CTA button.

---

### Flow 5: Weekly Summary View

- **Endpoint / URL:** `http://localhost:3000/weekly-summary`
- **Goal:** Review synthesis data of the user's progress over the last 7 days.
- **UI Elements & Selectors:**
  - Back Button: `"← Dashboard"` redirect.
  - Narrative Card: Top card containing the dynamic text narrative explaining the week's patterns.
  - Metric Cards Grid:
    - `"Average Mood"` card (shows decimal average and label).
    - `"Average Stress"` card.
    - `"Average Energy"` card.
    - `"Check-ins"` count card.
  - Trigger Alert: `"Top Stress Trigger"` highlights card displaying the most frequent trigger.
  - Radar Chart: `"Wellness Balance"` polar radar map mapping Mood, Energy, and Calmness.
  - CTA Button: `"Start Today's Check-in →"` (redirects to `/checkin`).

#### Test Steps & Assertions:
1. Navigate to `/weekly-summary`.
2. **Assertion:** If at least one check-in exists in the last 7 days, the dynamic narrative block and metric grid render properly.
3. Compare the Average Mood, Stress, and Energy with completed check-ins. Verify they accurately reflect the computed mean.
4. Verify the Wellness Balance radar chart SVG is rendered on-screen.
5. *Insufficient Data Assertion:* If there are no check-ins in the last 7 days:
   - **Assertion:** The UI shows an empty state block stating `📊 Not enough data yet` and a `"Start Check-in"` button.

---

### Flow 6: Logout Flow

- **Goal:** End user session and clear security tokens.
- **UI Elements:**
  - Sign out Button: `"Sign out"` inside the navigation bar.

#### Test Steps & Assertions:
1. On `/dashboard`, click the **Sign out** button.
2. **Assertion:** Router redirects back to `/auth/login`.
3. Try navigating back to `/dashboard` using the browser's back history.
   - **Assertion:** The session is cleared, and middleware redirects the page to `/auth/login`.

---

## 4. Rule-Based Engine Verification Specs

Automated verification agents should confirm the logic inside the local insight and recommendation engines:

### 1. Insight Engine Logic (`src/lib/engines/insight.ts`)
Verify the output string changes based on context:
* **Recurring Stress Trigger:** If the current check-in includes a trigger that has been logged 3 or more times recently:
  - *Expected Insight:* `"You've reported [trigger] as a recurring source of stress [count] times recently."`
* **Elevated Stress Pattern:** If average stress of the last 4 check-ins is > 3.5:
  - *Expected Insight:* `"Your stress levels have been elevated over the last few days. Small breaks can make a big difference."`
* **Declining Energy Pattern:** If average energy of the last 4 check-ins is < 2.5:
  - *Expected Insight:* `"Your energy levels have been consistently low recently. Rest and recovery may be needed."`
* **Gradual Mood Decline:** If mood is monotonically decreasing over the last 4 check-ins:
  - *Expected Insight:* `"Your mood has been gradually declining. Consider taking a short break to recharge."`
* **High Stress + Low Energy Combination:** If current stress > 3 and current energy < 3:
  - *Expected Insight:* `"High stress combined with low energy can make studying feel overwhelming. Small, focused sessions work better now."`

### 2. Recommendation Engine Logic (`src/lib/engines/recommendation.ts`)
Verify action outputs and anti-repetition rules:
* **Trigger Specifics:** If trigger is `Exam Anxiety`, recommendation should be drawn from the exam anxiety pool (e.g., breathing exercises or reviewing known subjects).
* **Anti-Repetition:** If a recommendation is inside the last 3 wellness actions logged, the engine must filter it out (unless all candidates have been exhausted) and pick an alternate recommendation.
* **Calming Prioritization:** If stress level is high ($\ge 4$), the engine must prioritize recommendations containing calming keywords (`breath`, `walk`, `rest`, or `break`).
