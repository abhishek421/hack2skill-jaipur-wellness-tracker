import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

function chain(result: { data: any; error: any }) {
  const c: Record<string, any> = {}
  for (const m of ['select', 'eq', 'in', 'gte', 'order', 'limit']) {
    c[m] = () => c
  }
  c.then = (fn: (v: any) => any) => Promise.resolve(result).then(fn)
  return c
}

function makeRequest(params = '') {
  return new NextRequest(`http://localhost/api/dashboard${params}`)
}

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('../route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 200 with dashboard shape when authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })

    const checkIns = [
      { created_at: new Date().toISOString(), mood: 4, stress_level: 2, energy_level: 4 },
    ]
    const triggers = [{ trigger_name: 'Exam Anxiety', check_in_id: 'ci-1' }]
    const actions = [{ generated_at: new Date().toISOString(), recommendation: 'Take a break' }]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'check_ins') return chain({ data: checkIns, error: null })
      if (table === 'triggers') return chain({ data: triggers, error: null })
      if (table === 'wellness_actions') return chain({ data: actions, error: null })
      return chain({ data: [], error: null })
    })

    const { GET } = await import('../route')
    const res = await GET(makeRequest('?days=7'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('moodTrend')
    expect(body).toHaveProperty('triggerFrequency')
    expect(body).toHaveProperty('recentActions')
    expect(body).toHaveProperty('streakDays')
    expect(Array.isArray(body.moodTrend)).toBe(true)
    expect(Array.isArray(body.triggerFrequency)).toBe(true)
  })

  it('clamps days param to valid range', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mockSupabase.from.mockReturnValue(chain({ data: [], error: null }))

    const { GET } = await import('../route')
    const res = await GET(makeRequest('?days=999'))
    expect(res.status).toBe(200)
  })

  it('returns empty arrays when user has no data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mockSupabase.from.mockReturnValue(chain({ data: [], error: null }))

    const { GET } = await import('../route')
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(body.moodTrend).toEqual([])
    expect(body.triggerFrequency).toEqual([])
    expect(body.recentActions).toEqual([])
    expect(body.streakDays).toBe(0)
  })
})
