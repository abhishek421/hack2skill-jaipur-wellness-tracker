import { describe, it, expect } from 'vitest'
import { slope, trend } from '../trend'

describe('slope', () => {
  it('returns 0 for a single value', () => {
    expect(slope([3])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(slope([])).toBe(0)
  })

  it('returns positive for ascending sequence', () => {
    expect(slope([1, 2, 3, 4, 5])).toBeGreaterThan(0)
  })

  it('returns negative for descending sequence', () => {
    expect(slope([5, 4, 3, 2, 1])).toBeLessThan(0)
  })

  it('returns 0 for flat sequence', () => {
    expect(slope([3, 3, 3, 3])).toBe(0)
  })

  it('returns 0 when denominator is zero (all x same)', () => {
    expect(slope([2, 2])).toBe(0)
  })
})

describe('trend', () => {
  it('returns stable for single value', () => {
    expect(trend([3])).toBe('stable')
  })

  it('returns improving for ascending values with low variance', () => {
    expect(trend([3, 3.5, 4, 4.5])).toBe('improving')
  })

  it('returns declining for descending values with low variance', () => {
    expect(trend([4.5, 4, 3.5, 3])).toBe('declining')
  })

  it('returns volatile for wide-swinging values (e.g. [1,2,3,4,5] has variance 2)', () => {
    expect(trend([1, 2, 3, 4, 5])).toBe('volatile')
  })

  it('returns stable for flat values', () => {
    expect(trend([3, 3, 3, 3])).toBe('stable')
  })

  it('returns volatile for high-variance oscillation', () => {
    expect(trend([1, 5, 1, 5, 1])).toBe('volatile')
  })

  it('returns stable for near-flat gradual change', () => {
    expect(trend([3, 3, 3.1, 3.1])).toBe('stable')
  })

  it('returns improving when slope > 0.15 and variance <= 1.2', () => {
    expect(trend([2, 3, 4])).toBe('improving')
  })

  it('returns declining when slope < -0.15 and variance <= 1.2', () => {
    expect(trend([4, 3, 2])).toBe('declining')
  })
})
