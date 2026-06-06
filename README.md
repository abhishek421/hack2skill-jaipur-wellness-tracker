# MindTrack 🧘

**MindTrack** is a lightweight, responsive mental wellness tracker designed to help students monitor and improve their emotional well-being during high-pressure periods such as board exams, competitive entrance tests, and results seasons (NEET, JEE, CUET, CAT, GATE, UPSC, etc.).

By adopting a **Track → Understand → Improve** loop, MindTrack empowers students to build emotional self-awareness, identify stress triggers, log reflections, and receive actionable, rule-based daily recommendations.

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
- **Daily Recommended Actions**: Simple, actionable, and non-clinical tasks (e.g., deep breathing, breaking study goals, screen-free periods, ormastery reviews) designed to fit into a student's daily routine without guilt. Includes anti-repetition logic to avoid repeating recommendations within a 3-day window.

### 3. Historical Analytics Dashboard
A visual control center to review mental health trends over time:
- **Stat Cards**: Live indicators for current mood, current streak (consecutive days), latest stress level, and latest energy level.
- **Mood & Stress Trend**: Interactive Recharts line graph displaying historical trajectories over custom periods (7, 14, or 30 days).
- **Top Stress Triggers**: Dynamic bar chart showing the frequency of stress triggers.
- **Recent Wellness Actions**: Timeline logging recommended actions alongside their generation dates.

### 4. Weekly Summary
A weekly emotional synthesis compiling:
- **7-day average metrics** for Mood, Stress, and Energy.
- **Consistency analysis** tracking overall check-in count.
- **Weekly Narrative**: A synthesis summarizing the week's emotional highlights.
- **Wellness Balance Radar Chart**: Map showing the balance between Mood, Energy, and Calmness.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Recharts, Lucide Icons.
- **Backend & APIs**: Next.js Server Components, Next.js API routes.
- **Database & Auth**: Supabase PostgreSQL, Supabase SSR/Client Auth, Row Level Security (RLS) policies.

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
│   │   ├── layout.tsx         # Global layouts
│   │   └── page.tsx           # Session redirect root
│   ├── components/            # UI components
│   ├── lib/
│   │   ├── engines/           # Rule-based insight & recommendation engines
│   │   ├── supabase/          # Supabase client/server initializers
│   │   └── types.ts           # Shared TypeScript interfaces
│   └── middleware.ts          # Authentication router guard
├── supabase/                  # Local Supabase configurations
├── supabase-schema.sql        # Database schema script
└── flow.md                    # Detailed User Flow & E2E Testing specification
```

---

## ⚙️ Setup & Local Installation

### Prerequisites
- Node.js (v18.x or later)
- NPM, Yarn, or PNPM
- A Supabase account and project

### 1. Database Configuration
Execute the contents of [supabase-schema.sql](file:///Users/abhi/Documents/hack2skill/supabase-schema.sql) in your Supabase SQL Editor. This sets up the following PostgreSQL tables with Row Level Security (RLS) policies:
- `check_ins` — Records daily mood, stress, and energy details.
- `triggers` — Logs stress triggers corresponding to a check-in.
- `reflections` — Holds private journal content.
- `wellness_actions` — Stores generated insights and recommendations.

### 2. Local Configuration
Clone the repository and install the project dependencies:
```bash
npm install
```

Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Testing & User Journeys

For a comprehensive, step-by-step breakdown of user flows, interface selectors, API request payloads, and testing assertions, refer to the **[flow.md](file:///Users/abhi/Documents/hack2skill/flow.md)** specification file.
