'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 mb-4 shadow-[0_8px_30px_rgb(59,130,246,0.1)]">
            <span className="text-2xl" aria-hidden="true">🧘</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">MindTrack</h1>
          <p className="text-slate-500 mt-1">Your wellness companion for exam success</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-8 border border-white/60">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Create your account</h2>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={error ? 'true' : undefined}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 shadow-sm"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'signup-error' : undefined}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 shadow-sm"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-describedby="signup-password-hint"
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 shadow-sm"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <p id="signup-password-hint" className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 font-medium hover:text-blue-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
  )
}
