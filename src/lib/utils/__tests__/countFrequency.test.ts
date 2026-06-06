import { describe, it, expect } from 'vitest'
import { countFrequency } from '../countFrequency'

describe('countFrequency', () => {
  it('returns empty object for empty array', () => {
    expect(countFrequency([])).toEqual({})
  })

  it('counts single item', () => {
    expect(countFrequency(['Exam Anxiety'])).toEqual({ 'Exam Anxiety': 1 })
  })

  it('counts multiple occurrences of the same item', () => {
    expect(countFrequency(['Poor Sleep', 'Poor Sleep', 'Poor Sleep'])).toEqual({ 'Poor Sleep': 3 })
  })

  it('counts multiple distinct items', () => {
    const result = countFrequency(['Burnout', 'Exam Anxiety', 'Burnout'])
    expect(result).toEqual({ Burnout: 2, 'Exam Anxiety': 1 })
  })

  it('treats different casing as distinct keys', () => {
    const result = countFrequency(['burnout', 'Burnout'])
    expect(result['burnout']).toBe(1)
    expect(result['Burnout']).toBe(1)
  })
})
