import { describe, it, expect } from 'vitest'
import { generateInsight } from '../insight'
import type { CheckIn } from '@/lib/types'

const baseCheckIn = (overrides: Partial<CheckIn> = {}): CheckIn => ({
  id: 'ci-1',
  user_id: 'u-1',
  mood: 3,
  stress_level: 3,
  energy_level: 3,
  created_at: new Date().toISOString(),
  ...overrides,
})

const noHistory = { checkIns: [], triggers: [] }

describe('generateInsight', () => {
  it('reports recurring trigger when it appears 3+ times', () => {
    const triggers = [
      { check_in_id: 'ci-1', trigger_name: 'Exam Anxiety' },
      { check_in_id: 'ci-2', trigger_name: 'Exam Anxiety' },
    ]
    const result = generateInsight({
      current: { mood: 3, stress: 3, energy: 3, triggers: ['Exam Anxiety'] },
      history: { checkIns: [], triggers },
    })
    expect(result).toMatch(/exam anxiety/i)
    expect(result).toMatch(/3 times/)
  })

  it('reports elevated stress when avg stress > 3.5 over recent check-ins', () => {
    const checkIns = [
      baseCheckIn({ stress_level: 4 }),
      baseCheckIn({ stress_level: 4 }),
      baseCheckIn({ stress_level: 5 }),
    ]
    const result = generateInsight({
      current: { mood: 3, stress: 2, energy: 3, triggers: [] },
      history: { checkIns, triggers: [] },
    })
    expect(result).toMatch(/stress levels have been elevated/i)
  })

  it('reports low energy when avg energy < 2.5 over recent check-ins', () => {
    const checkIns = [
      baseCheckIn({ energy_level: 2, stress_level: 2 }),
      baseCheckIn({ energy_level: 1, stress_level: 2 }),
      baseCheckIn({ energy_level: 2, stress_level: 2 }),
    ]
    const result = generateInsight({
      current: { mood: 3, stress: 2, energy: 2, triggers: [] },
      history: { checkIns, triggers: [] },
    })
    expect(result).toMatch(/energy levels have been consistently low/i)
  })

  it('reports declining mood when mood trend is downward', () => {
    const checkIns = [
      baseCheckIn({ mood: 5, stress_level: 2, energy_level: 4 }),
      baseCheckIn({ mood: 4, stress_level: 2, energy_level: 4 }),
      baseCheckIn({ mood: 3, stress_level: 2, energy_level: 4 }),
    ]
    const result = generateInsight({
      current: { mood: 2, stress: 2, energy: 4, triggers: [] },
      history: { checkIns, triggers: [] },
    })
    expect(result).toMatch(/mood has been gradually declining/i)
  })

  it('returns exam anxiety insight when trigger present and no history pattern', () => {
    const result = generateInsight({
      current: { mood: 3, stress: 2, energy: 3, triggers: ['Exam Anxiety'] },
      history: noHistory,
    })
    expect(result).toMatch(/exam anxiety is weighing on you/i)
  })

  it('returns high stress + low energy insight when stress > 3 and energy < 3', () => {
    const result = generateInsight({
      current: { mood: 3, stress: 4, energy: 2, triggers: [] },
      history: noHistory,
    })
    expect(result).toMatch(/high stress combined with low energy/i)
  })

  it('returns positive mood insight when mood >= 4 with no other patterns', () => {
    const result = generateInsight({
      current: { mood: 4, stress: 2, energy: 4, triggers: [] },
      history: noHistory,
    })
    expect(result).toMatch(/good emotional space/i)
  })

  it('returns generic fallback insight when no patterns match', () => {
    const result = generateInsight({
      current: { mood: 3, stress: 2, energy: 3, triggers: [] },
      history: noHistory,
    })
    expect(result).toMatch(/positive step by checking in/i)
  })
})
