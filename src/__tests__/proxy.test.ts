import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`)
}

describe('proxy middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated user from /dashboard to /auth/login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/dashboard'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/auth\/login$/)
  })

  it('redirects unauthenticated user from /checkin to /auth/login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/checkin'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/auth\/login$/)
  })

  it('redirects unauthenticated user from /weekly-summary to /auth/login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/weekly-summary'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/auth\/login$/)
  })

  it('redirects authenticated user from /auth/login to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/auth/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/dashboard$/)
  })

  it('redirects authenticated user from /auth/signup to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/auth/signup'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/dashboard$/)
  })

  it('passes through authenticated user on protected routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/dashboard'))
    expect(res.status).not.toBe(307)
  })

  it('passes through unauthenticated user on public routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { proxy } = await import('../proxy')
    const res = await proxy(makeRequest('/'))
    expect(res.status).not.toBe(307)
  })
})
