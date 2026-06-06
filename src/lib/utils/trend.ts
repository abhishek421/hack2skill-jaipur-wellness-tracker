import type { TrendDirection } from '@/lib/ai/generateWeeklyNarrative'

export function slope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0
  const meanX = (n - 1) / 2
  const meanY = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY)
    den += (i - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

export function trend(values: number[]): TrendDirection {
  if (values.length < 2) return 'stable'
  const s = slope(values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  if (variance > 1.2) return 'volatile'
  if (s > 0.15) return 'improving'
  if (s < -0.15) return 'declining'
  return 'stable'
}
