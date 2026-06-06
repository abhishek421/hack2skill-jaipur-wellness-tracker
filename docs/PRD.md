# Wellness Actions

## Purpose

Beyond helping students monitor their emotional well-being, the application should encourage small, practical actions that support healthier emotional habits during exam preparation.

The objective is not treatment or therapy.

The objective is to provide simple, achievable recommendations that help students manage stress, improve emotional resilience, and maintain balance throughout their academic journey.

---

## User Flow

After completing the Daily Check-In, Trigger Selection, and Reflection Journal, the student receives:

1. Personalized Wellness Insight
2. Recommended Wellness Action

The insight and recommendation are stored and surfaced in the dashboard history.

---

## Daily Wellness Recommendation

The system should generate one contextual recommendation based on:

* Current mood
* Stress level
* Energy level
* Selected triggers
* Historical patterns

Recommendations should be:

* Simple
* Actionable
* Non-clinical
* Achievable within a day

---

## Example Recommendations

### Study Backlog

**Insight**

"You've reported study backlog as a recurring source of stress this week."

**Action**

"Break tomorrow's study target into three smaller tasks instead of one large goal."

---

### Exam Anxiety

**Insight**

"Upcoming exams appear to be contributing to your stress levels."

**Action**

"Spend 10 minutes reviewing topics you already know well to rebuild confidence."

---

### Poor Sleep

**Insight**

"Low energy levels and poor sleep have appeared together multiple times."

**Action**

"Aim for a consistent sleep schedule tonight and avoid screens 30 minutes before bed."

---

### Comparison With Others

**Insight**

"You've frequently mentioned comparing your progress with peers."

**Action**

"Focus on one personal improvement goal for tomorrow rather than comparing scores."

---

### Low Motivation

**Insight**

"Motivation has been declining over the last few days."

**Action**

"Choose one small task that can be completed in under 20 minutes and finish it first."

---

## Functional Requirements

### Wellness Recommendation Engine

The system must:

* Generate one personalized wellness action per check-in
* Consider current and historical emotional data
* Avoid repetitive recommendations
* Adapt suggestions based on recurring stress patterns

---

## Dashboard Enhancements

The dashboard should display:

### Recommended Actions History

Students can review previously suggested wellness actions.

Examples:

* Break study goals into smaller tasks
* Prioritize sleep tonight
* Take a short outdoor break
* Focus on completed progress rather than unfinished work

---

## Success Criteria Update

After seven days of usage, students should be able to:

* Understand emotional trends
* Identify common stress triggers
* Reflect consistently on their feelings
* Receive relevant wellness suggestions
* Apply small daily actions that support emotional well-being

---

## Weekly Summary

At the end of each week, the student receives a simple summary:

* Average Mood
* Average Stress
* Average Energy
* Top Trigger
* Number of Check-Ins
* Narrative observation

Example:

"This week, exam anxiety remained your most common stress trigger. Your mood remained stable, but energy levels decreased during the final three days."

---

## Product Value

The Mental Wellness Tracker supports both dimensions of the challenge:

### Monitor Mental Wellness

* Daily Mood Tracking
* Trigger Identification (including burnout and self-doubt)
* Reflection Journaling
* Historical Insights Dashboard

### Improve Mental Wellness

* Personalized Wellness Insights
* Context-Aware Daily Recommendations
* Actionable Emotional Support
* Weekly Summary for reflection

The product journey becomes:

**Track → Understand → Improve**

This creates a complete emotional self-awareness loop while remaining lightweight, practical, and achievable within a hackathon MVP scope.
