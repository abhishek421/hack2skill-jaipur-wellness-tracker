import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sanitiseSnippets } from '../generateWeeklyNarrative'
import type { WeeklyNarrativeInput } from '../generateWeeklyNarrative'

const baseInput: WeeklyNarrativeInput = {
  studentName: 'Alex',
  weekStartDate: '2024-01-01',
  checkInCount: 5,
  averageMood: 3.2,
  averageStress: 3.0,
  averageEnergy: 3.5,
  moodTrend: 'stable',
  stressTrend: 'stable',
  topTriggers: ['Exam Anxiety'],
  triggerFrequency: { 'Exam Anxiety': 3 },
  reflectionSnippets: ['Feeling tired lately.'],
  lowestMoodDay: '2024-01-03',
  highestMoodDay: '2024-01-05',
}

const mockCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: 'This is a generated narrative for Alex.' } }],
})

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = { completions: { create: mockCreate } }
      constructor(_opts: unknown) {}
    },
  }
})

describe('sanitiseSnippets', () => {
  it('redacts email addresses', () => {
    const result = sanitiseSnippets(['Contact me at test@example.com please'])
    expect(result[0]).not.toMatch(/test@example\.com/)
    expect(result[0]).toContain('[contact]')
  })

  it('redacts phone numbers', () => {
    const result = sanitiseSnippets(['Call me at +91 98765 43210'])
    expect(result[0]).not.toMatch(/98765/)
    expect(result[0]).toContain('[contact]')
  })

  it('truncates snippets longer than 100 chars', () => {
    const long = 'x'.repeat(150)
    const result = sanitiseSnippets([long])
    expect(result[0].length).toBeLessThanOrEqual(103)
    expect(result[0]).toMatch(/…$/)
  })

  it('limits output to at most 3 snippets', () => {
    const result = sanitiseSnippets(['a', 'b', 'c', 'd', 'e'])
    expect(result).toHaveLength(3)
  })

  it('removes curly braces to prevent prompt injection', () => {
    const result = sanitiseSnippets(['Hello {world} and {foo}'])
    expect(result[0]).not.toContain('{')
    expect(result[0]).not.toContain('}')
  })

  it('returns empty array for empty input', () => {
    expect(sanitiseSnippets([])).toEqual([])
  })

  it('passes through clean short snippets unchanged', () => {
    const result = sanitiseSnippets(['Feeling okay today.'])
    expect(result[0]).toBe('Feeling okay today.')
  })
})

describe('generateWeeklyNarrative', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key')
    vi.stubEnv('NARRATIVE_MODEL', 'gpt-4o-mini')
  })

  it('throws when OPENAI_API_KEY is not set', async () => {
    vi.unstubAllEnvs()
    const { generateWeeklyNarrative } = await import('../generateWeeklyNarrative')
    await expect(generateWeeklyNarrative(baseInput)).rejects.toThrow('OPENAI_API_KEY not set')
  })

  it('returns narrative string on success', async () => {
    const { generateWeeklyNarrative } = await import('../generateWeeklyNarrative')
    const result = await generateWeeklyNarrative(baseInput)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('caps response at 120 words', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: Array(200).fill('word').join(' ') } }],
    })
    const { generateWeeklyNarrative } = await import('../generateWeeklyNarrative')
    const result = await generateWeeklyNarrative(baseInput)
    expect(result.split(/\s+/).length).toBeLessThanOrEqual(121)
    expect(result).toMatch(/…$/)
  })

  it('throws on empty response from LLM', async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: '' } }] })
    const { generateWeeklyNarrative } = await import('../generateWeeklyNarrative')
    await expect(generateWeeklyNarrative(baseInput)).rejects.toThrow('Empty response from LLM')
  })
})
