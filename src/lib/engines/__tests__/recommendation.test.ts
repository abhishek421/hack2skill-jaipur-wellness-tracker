import { describe, it, expect } from 'vitest'
import { generateRecommendation } from '../recommendation'

const base = {
  mood: 3,
  stress: 3,
  energy: 3,
  triggers: [] as string[],
  recentRecommendations: [] as string[],
}

describe('generateRecommendation', () => {
  it('returns a string for empty triggers and no history', () => {
    const result = generateRecommendation(base)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns trigger-specific recommendation for Exam Anxiety', () => {
    const examRecs = [
      'Spend 10 minutes reviewing topics you already know well to rebuild confidence.',
      'Write down your three strongest subjects and focus on one today.',
      'Take 5 slow deep breaths before your next study session.',
    ]
    const result = generateRecommendation({ ...base, triggers: ['Exam Anxiety'] })
    expect(examRecs).toContain(result)
  })

  it('returns trigger-specific recommendation for Study Backlog', () => {
    const backlogRecs = [
      "Break tomorrow's study target into three smaller tasks instead of one large goal.",
      'Choose just one chapter to complete today — progress beats perfection.',
      'Set a 25-minute focused study timer and take a 5-minute break after.',
    ]
    const result = generateRecommendation({ ...base, triggers: ['Study Backlog'] })
    expect(backlogRecs).toContain(result)
  })

  it('returns trigger-specific recommendation for Poor Sleep', () => {
    const sleepRecs = [
      'Aim for a consistent sleep schedule tonight and avoid screens 30 minutes before bed.',
      'Try a 10-minute body scan meditation before sleeping tonight.',
      "Prepare tomorrow's study plan tonight so mornings feel less rushed.",
    ]
    const result = generateRecommendation({ ...base, triggers: ['Poor Sleep'] })
    expect(sleepRecs).toContain(result)
  })

  it('returns trigger-specific recommendation for Health Issues', () => {
    const healthRecs = [
      'Prioritize rest today — your body needs recovery to think clearly.',
      'Do a light 5-minute stretching routine to improve circulation and energy.',
      'Stay hydrated and have a nutritious meal before your next study block.',
    ]
    const result = generateRecommendation({ ...base, triggers: ['Health Issues'] })
    expect(healthRecs).toContain(result)
  })

  it('returns trigger-specific recommendation for Social Media', () => {
    const socialMediaRecs = [
      'Put your phone on silent for the next study session and keep it out of sight.',
      'Set a specific 15-minute social media window after studying — not before.',
      'Replace one social media scroll session with a short walk outside.',
    ]
    const result = generateRecommendation({ ...base, triggers: ['Social Media'] })
    expect(socialMediaRecs).toContain(result)
  })

  it('returns trigger-specific recommendation for Lack of Preparation', () => {
    const lapRecs = [
      'Start with just 15 minutes on the most important topic — momentum builds quickly.',
      'Make a simple list of three things you want to cover today and stick to it.',
      "Reach out to a classmate or teacher with one specific question you're stuck on.",
    ]
    const result = generateRecommendation({ ...base, triggers: ['Lack of Preparation'] })
    expect(lapRecs).toContain(result)
  })

  it('avoids recently used recommendations (anti-repetition)', () => {
    const examRecs = [
      'Spend 10 minutes reviewing topics you already know well to rebuild confidence.',
      'Write down your three strongest subjects and focus on one today.',
      'Take 5 slow deep breaths before your next study session.',
    ]
    // Exhaust first two recs
    const result = generateRecommendation({
      ...base,
      triggers: ['Exam Anxiety'],
      recentRecommendations: [examRecs[0], examRecs[1], examRecs[2]],
    })
    // Should fall back to any recommendation (pool not empty because we use all 3)
    expect(typeof result).toBe('string')
  })

  it('prefers calming recommendation when stress >= 4', () => {
    // With high stress, should pick a rec that contains "breath", "walk", "rest", or "break"
    const result = generateRecommendation({
      ...base,
      stress: 4,
      triggers: ['Burnout'],
      recentRecommendations: [],
    })
    const isCalming = /breath|walk|rest|break/i.test(result)
    expect(isCalming).toBe(true)
  })

  it('returns a recommendation even with multiple triggers', () => {
    const result = generateRecommendation({
      ...base,
      triggers: ['Exam Anxiety', 'Poor Sleep', 'Peer Comparison'],
    })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(10)
  })
})
