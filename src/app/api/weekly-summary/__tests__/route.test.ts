import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

vi.mock('@/lib/ai/generateWeeklyNarrative', () => ({
  generateWeeklyNarrative: vi.fn().mockResolvedValue('AI-generated weekly narrative.'),
}))

function chain(result: { data: any; error: any }) {
  const c: Record<string, any> = {}
  for (const m of ['select', 'eq', 'in', 'gte', 'order', 'limit']) {
    c[m] = () => c
  }
  c.single = () => Promise.resolve(result)
  c.maybeSingle = () => Promise.resolve(result)
  c.upsert = () => Promise.resolve(result)
  c.then = (fn: (v: any) => any) => Promise.resolve(result).then(fn)
  return c
}

describe('GET /api/weekly-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns empty:true when user has no check-ins this week', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mockSupabase.from.mockReturnValue(chain({ data: [], error: null }))

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.empty).toBe(true)
  })

  it('returns summary with narrative when check-ins exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', user_metadata: { name: 'Alex' } } },
    })

    const checkIns = [
      { id: 'ci-1', created_at: new Date().toISOString(), mood: 4, stress_level: 2, energy_level: 4 },
      { id: 'ci-2', created_at: new Date().toISOString(), mood: 3, stress_level: 3, energy_level: 3 },
    ]
    const triggers = [{ trigger_name: 'Exam Anxiety' }]

    let checkInsCallCount = 0
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'check_ins') {
        checkInsCallCount++
        return chain({ data: checkInsCallCount === 1 ? checkIns : [], error: null })
      }
      if (table === 'triggers') return chain({ data: triggers, error: null })
      if (table === 'reflections') return chain({ data: [], error: null })
      if (table === 'weekly_summaries') return chain({ data: null, error: null })
      return chain({ data: null, error: null })
    })

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('narrative')
    expect(body).toHaveProperty('avgMood')
    expect(body).toHaveProperty('avgStress')
    expect(body).toHaveProperty('avgEnergy')
    expect(body).toHaveProperty('topTrigger')
    expect(body).toHaveProperty('checkInCount')
    expect(typeof body.narrative).toBe('string')
    expect(body.checkInCount).toBe(2)
  })

  it('falls back to rule-based narrative when AI call fails', async () => {
    const { generateWeeklyNarrative } = await import('@/lib/ai/generateWeeklyNarrative')
    vi.mocked(generateWeeklyNarrative).mockRejectedValueOnce(new Error('OpenAI error'))

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', user_metadata: {} } },
    })

    const checkIns = [
      { id: 'ci-1', created_at: new Date().toISOString(), mood: 3, stress_level: 3, energy_level: 3 },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'check_ins') return chain({ data: checkIns, error: null })
      if (table === 'triggers') return chain({ data: [], error: null })
      if (table === 'reflections') return chain({ data: [], error: null })
      if (table === 'weekly_summaries') return chain({ data: null, error: null })
      return chain({ data: null, error: null })
    })

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.narrativeSource).toBe('rule-based')
    expect(typeof body.narrative).toBe('string')
    expect(body.narrative.length).toBeGreaterThan(0)
  })

  it('returns cached weekly summary when week is closed', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', user_metadata: {} } },
    })

    const checkIns = [
      { id: 'ci-1', created_at: '2026-05-01T00:00:00Z', mood: 4, stress_level: 2, energy_level: 4 },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'check_ins') return chain({ data: checkIns, error: null })
      if (table === 'triggers') return chain({ data: [], error: null })
      if (table === 'reflections') return chain({ data: [], error: null })
      if (table === 'weekly_summaries') {
        return chain({ data: { narrative: 'Cached AI narrative.', source: 'ai' }, error: null })
      }
      return chain({ data: null, error: null })
    })

    const { GET } = await import('../route')
    const request = new NextRequest('http://localhost/api/weekly-summary?date=2026-05-01')
    const res = await GET(request)
    
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.narrative).toBe('Cached AI narrative.')
    expect(body.narrativeSource).toBe('ai')
  })
})
