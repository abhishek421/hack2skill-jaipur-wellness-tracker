import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockExchangeCode = vi.fn()
const mockSupabase = {
  auth: { exchangeCodeForSession: mockExchangeCode },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

function makeRequest(code?: string) {
  const url = code
    ? `http://localhost/auth/callback?code=${code}`
    : 'http://localhost/auth/callback'
  return new NextRequest(url)
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges code and redirects to /dashboard', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const { GET } = await import('../route')
    const res = await GET(makeRequest('valid-code'))
    expect(mockExchangeCode).toHaveBeenCalledWith('valid-code')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/dashboard$/)
  })

  it('redirects to /dashboard when no code is present', async () => {
    const { GET } = await import('../route')
    const res = await GET(makeRequest())
    expect(mockExchangeCode).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/dashboard$/)
  })

  it('redirects to /auth/login on exchange error', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'invalid code' } })
    const { GET } = await import('../route')
    const res = await GET(makeRequest('bad-code'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/auth\/login/)
  })
})
