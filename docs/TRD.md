# Technical Requirements Document (TRD)

# Mental Wellness Tracker

Version: 1.0
Type: Hackathon MVP
Target Users: Students preparing for examinations

---

# 1. Technical Overview

Mental Wellness Tracker is a lightweight web application that enables students to:

* Track emotional well-being daily
* Identify stress triggers
* Reflect through journaling
* Visualize emotional patterns
* Receive personalized wellness insights
* Receive actionable daily wellness recommendations

The application is not intended to diagnose, treat, or provide mental health services.

The primary goal is to create a self-awareness and self-improvement loop:

Track → Understand → Improve

---

# 2. System Architecture

## Frontend

Responsibilities:

* Daily Check-In Form
* Trigger Selection
* Reflection Journal
* Dashboard Visualization
* Wellness Recommendation Display
* Recommendation History

Suggested Stack:

* React
* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

---

## Backend

Responsibilities:

* User Authentication
* Check-In Storage
* Trend Analysis
* Insight Generation
* Recommendation Generation

Suggested Stack:

* Next.js API Routes
* Node.js
* TypeScript

---

## Database

Suggested:

* PostgreSQL
* Supabase

Tables:

* users
* check_ins
* reflections
* wellness_actions

---

# 3. Functional Modules

## Module 1: User Authentication

### Features

* Sign Up
* Login
* Session Management

### Data Stored

User:

* id
* name
* email
* created_at

---

## Module 2: Daily Check-In

### Purpose

Capture current emotional state.

### Inputs

Mood

Options:

* Very Happy
* Happy
* Neutral
* Sad
* Very Sad

Stress Level

Range:
1–5

Energy Level

Range:
1–5

### Output

Check-In Record

---

## Module 3: Trigger Selection

### Purpose

Identify sources of emotional pressure.

### Trigger Options

Academic

* Exam Anxiety
* Study Backlog
* Poor Performance
* Lack of Preparation
* Burnout
* Self-Doubt

Lifestyle

* Poor Sleep
* Health Issues
* Social Media

Social

* Family Expectations
* Peer Comparison
* Relationship Issues

Other

* Other (custom text)

### Rules

* Multiple selection allowed
* Optional custom trigger

---

## Module 4: Reflection Journal

### Purpose

Allow students to express emotions.

### Input

Text Area

Constraints:

* Minimum: 0 characters
* Maximum: 1000 characters

### Storage

Saved with associated check-in.

---

## Module 5: Wellness Insight Engine

### Purpose

Generate meaningful observations from collected data.

### Inputs

Current:

* Mood
* Stress
* Energy
* Triggers

Historical:

* Previous Check-Ins
* Previous Triggers
* Previous Recommendations

### Output

One Insight Statement

Examples:

"You've reported exam anxiety three times this week."

"Low energy has appeared frequently alongside poor sleep."

"Stress levels have increased over the last four days."

### Logic

Rule-based engine.

No AI required for MVP.

---

## Module 6: Wellness Recommendation Engine

### Purpose

Generate one contextual daily action.

### Inputs

Current Check-In:

* Mood
* Stress
* Energy
* Triggers

Historical Data:

* Trigger frequency
* Mood trend
* Recommendation history

### Output

One Wellness Action

Examples:

* Break study goals into smaller tasks.
* Prioritize sleep tonight.
* Take a 15-minute outdoor walk.
* Review strong subjects first.
* Focus on one achievable task today.

### Recommendation Rules

#### Study Backlog

Condition:
Trigger = Study Backlog

Recommendation:
Break tomorrow's study target into three smaller tasks.

---

#### Exam Anxiety

Condition:
Trigger = Exam Anxiety

Recommendation:
Spend 10 minutes reviewing familiar topics.

---

#### Poor Sleep

Condition:
Trigger = Poor Sleep AND Energy ≤ 2

Recommendation:
Maintain a consistent bedtime tonight.

---

#### Peer Comparison

Condition:
Trigger = Peer Comparison

Recommendation:
Set one personal goal unrelated to others.

---

#### Low Motivation

Condition:
Mood ≤ Neutral AND Energy ≤ 2

Recommendation:
Complete one task under 20 minutes.

### Anti-Repetition Logic

System should:

* Store previous recommendations
* Avoid repeating same recommendation within 3 days
* Select alternative recommendation when available

---

## Module 7: Dashboard

### Purpose

Provide emotional awareness.

### Components

#### Mood Trend Chart

Displays:

* Last 7 Days
* Last 30 Days

---

#### Stress Trend Chart

Displays:

* Daily stress scores

---

#### Trigger Frequency

Displays:

* Most common triggers

Example:

Exam Anxiety — 6 times

Poor Sleep — 4 times

Peer Comparison — 3 times

---

#### Wellness Action History

Displays:

Date + Recommended Action

Example:

May 1
Break study goals into smaller tasks.

May 2
Prioritize sleep tonight.

May 3
Focus on completed progress.

---

## Module 8: Weekly Summary

### Purpose

Provide simple reflection.

### Generated Metrics

* Average Mood
* Average Stress
* Average Energy
* Top Trigger
* Number of Check-Ins

### Summary Example

"This week, exam anxiety remained your most common stress trigger. Your mood remained stable, but energy levels decreased during the final three days."

---

# 4. Database Design

## users

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | String    |
| email      | String    |
| created_at | Timestamp |

---

## check_ins

| Field        | Type      |
| ------------ | --------- |
| id           | UUID      |
| user_id      | UUID      |
| mood         | Integer   |
| stress_level | Integer   |
| energy_level | Integer   |
| created_at   | Timestamp |

---

## triggers

| Field        | Type   |
| ------------ | ------ |
| id           | UUID   |
| check_in_id  | UUID   |
| trigger_name | String |

---

## reflections

| Field       | Type |
| ----------- | ---- |
| id          | UUID |
| check_in_id | UUID |
| content     | Text |

---

## wellness_actions

| Field          | Type      |
| -------------- | --------- |
| id             | UUID      |
| user_id        | UUID      |
| insight        | Text      |
| recommendation | Text      |
| generated_at   | Timestamp |

---

# 5. API Requirements

## POST /api/checkin

Create Daily Check-In

Payload:

{
mood: number,
stressLevel: number,
energyLevel: number,
triggers: string[],
reflection: string
}

Response:

{
checkInId: string,
insight: string,
recommendation: string
}

---

## GET /api/dashboard

Returns:

* Trend Data
* Trigger Statistics
* Recommendation History

---

## GET /api/weekly-summary

Returns:

* Weekly Analysis
* Generated Insight

---

# 6. Security Requirements

Authentication:

* JWT
* Supabase Auth

Validation:

* Input sanitization
* Length limits

Protection:

* Rate limiting
* Secure session handling

---

# 7. Performance Requirements

Dashboard Load:

< 2 seconds

Check-In Submission:

< 500ms

Recommendation Generation:

< 200ms

Weekly Summary:

< 1 second

---

# 8. Testing Requirements

Unit Tests

* Recommendation Engine
* Insight Engine
* Trend Calculations

Integration Tests

* Check-In Flow
* Dashboard Data Flow

Manual Testing

* Complete User Journey
* Edge Cases
* Empty Reflection
* Multiple Trigger Selection

---

# 9. Success Metrics

Product should enable students to:

* Track emotions consistently
* Identify recurring stress triggers
* Observe emotional trends
* Reflect regularly
* Receive useful wellness suggestions
* Apply one small wellness action daily

---

# MVP Deliverables

✓ Daily Mood Tracking

✓ Stress & Energy Tracking

✓ Trigger Identification

✓ Reflection Journal

✓ Insight Engine

✓ Recommendation Engine

✓ Historical Dashboard

✓ Wellness Action History

✓ Weekly Summary

✓ Authentication

✓ Responsive UI

Result:

Track → Understand → Improve
