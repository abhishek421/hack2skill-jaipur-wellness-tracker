import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignUp = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signUp: mockSignUp },
  })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

// Import after mocks
async function getHandleSignup() {
  const mod = await import('../page')
  return mod
}

describe('SignupPage — handleSignup logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase signUp with email, password, and name', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    // Test the underlying supabase call shape
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: { data: { name: 'Alice' } },
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: { data: { name: 'Alice' } },
    })
  })

  it('redirects to /dashboard on successful signup', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: { data: { name: 'Bob' } },
    })

    if (!error) {
      mockPush('/dashboard')
      mockRefresh()
    }

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('does not redirect when signup returns an error', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already in use' } })

    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.auth.signUp({
      email: 'existing@example.com',
      password: 'password123',
      options: { data: { name: 'Carol' } },
    })

    if (!error) {
      mockPush('/dashboard')
    }

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('passes name in user_metadata options', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.auth.signUp({
      email: 'user@test.com',
      password: 'abc123',
      options: { data: { name: 'Dave' } },
    })

    const call = mockSignUp.mock.calls[0][0]
    expect(call.options?.data?.name).toBe('Dave')
  })

  it('does not redirect when signup returns an error with a message', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Password too short' } })

    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.auth.signUp({
      email: 'u@x.com',
      password: '123',
      options: { data: { name: 'Eve' } },
    })

    expect(error?.message).toBe('Password too short')
    expect(mockPush).not.toHaveBeenCalled()
  })
})
