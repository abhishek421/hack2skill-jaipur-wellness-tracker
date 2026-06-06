import { describe, it, expect } from 'vitest'
import { sanitiseSnippets } from '../generateWeeklyNarrative'

describe('sanitiseSnippets', () => {
  it('returns empty array for empty input', () => {
    expect(sanitiseSnippets([])).toEqual([])
  })

  it('takes at most 3 snippets', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    expect(sanitiseSnippets(input)).toHaveLength(3)
  })

  it('redacts email addresses', () => {
    const result = sanitiseSnippets(['contact me at user@example.com please'])
    expect(result[0]).toContain('[contact]')
    expect(result[0]).not.toContain('@')
  })

  it('redacts phone numbers', () => {
    const result = sanitiseSnippets(['call me at +1 800 555 1234'])
    expect(result[0]).toContain('[contact]')
    expect(result[0]).not.toContain('800 555')
  })

  it('strips curly braces', () => {
    const result = sanitiseSnippets(['some {template} content}'])
    expect(result[0]).not.toContain('{')
    expect(result[0]).not.toContain('}')
  })

  it('truncates strings longer than 100 characters with ellipsis', () => {
    const long = 'a'.repeat(150)
    const result = sanitiseSnippets([long])
    expect(result[0].endsWith('…')).toBe(true)
    expect(result[0].replace('…', '')).toHaveLength(100)
  })

  it('passes through clean short strings unchanged', () => {
    const result = sanitiseSnippets(['Today was a good day'])
    expect(result[0]).toBe('Today was a good day')
  })

  it('handles exactly 100 character strings without truncation', () => {
    const exact = 'a'.repeat(100)
    const result = sanitiseSnippets([exact])
    expect(result[0]).toBe(exact)
    expect(result[0].endsWith('…')).toBe(false)
  })

  it('redacts multiple emails in one snippet', () => {
    const result = sanitiseSnippets(['from a@b.com to c@d.org'])
    expect(result[0]).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  })
})
