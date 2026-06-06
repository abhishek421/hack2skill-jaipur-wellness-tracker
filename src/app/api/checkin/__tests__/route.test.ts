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
  for (const m of ['select', 'insert', 'eq', 'in', 'gte', 'order', 'limit']) {
    c[m] = () => c
  }
  c.single = () => Promise.resolve(result)
  c.maybeSingle = () => Promise.resolve(result)
  c.then = (fn: (v: any) => any) => Promise.resolve(result).then(fn)
  return c
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('../route')
    const res = await POST(makeRequest({ mood: 3, stressLevel: 3, energyLevel: 3 }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { POST } = await import('../route')
    const res = await POST(makeRequest({ mood: 3 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when mood is out of range', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { POST } = await import('../route')
    const res = await POST(makeRequest({ mood: 6, stressLevel: 3, energyLevel: 3 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when stressLevel is out of range', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { POST } = await import('../route')
    const res = await POST(makeRequest({ mood: 3, stressLevel: 0, energyLevel: 3 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when triggers array exceeds limit', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { POST } = await import('../route')
    const triggers = Array.from({ length: 21 }, (_, i) => `trigger-${i}`)
    const res = await POST(makeRequest({ mood: 3, stressLevel: 3, energyLevel: 3, triggers }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when reflection exceeds 1000 chars', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { POST } = await import('../route')
    const res = await POST(makeRequest({
      mood: 3, stressLevel: 3, energyLevel: 3,
      reflection: 'x'.repeat(1001),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with insight and recommendation on success', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })

    const checkIn = { id: 'ci-1', mood: 3, stress_level: 3, energy_level: 3 }
    const action = { id: 'a-1' }
    let checkInsCallCount = 0
    let wellnessCallCount = 0

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'check_ins') {
        checkInsCallCount++
        return chain({ data: checkInsCallCount === 1 ? checkIn : [], error: null })
      }
      if (table === 'triggers') return chain({ data: [], error: null })
      if (table === 'reflections') return chain({ data: null, error: null })
      if (table === 'wellness_actions') {
        wellnessCallCount++
        return chain({ data: wellnessCallCount === 1 ? [] : action, error: null })
      }
      return chain({ data: null, error: null })
    })

    const { POST } = await import('../route')
    const res = await POST(makeRequest({ mood: 3, stressLevel: 3, energyLevel: 3 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('insight')
    expect(body).toHaveProperty('recommendation')
    expect(typeof body.insight).toBe('string')
    expect(typeof body.recommendation).toBe('string')
  })
})
