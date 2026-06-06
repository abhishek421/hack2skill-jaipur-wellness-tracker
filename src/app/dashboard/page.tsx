'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types'
import type { DashboardData } from '@/lib/types'

const TRIGGER_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f472b6', '#fb7185']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?days=${days}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchDashboard()
  }, [fetchDashboard, supabase.auth])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'
  const latestMood = data?.moodTrend?.slice(-1)[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <span className="font-bold text-gray-900 text-lg">MindTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/weekly-summary')}
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Weekly Summary
            </button>
            <button
              onClick={() => router.push('/checkin')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition shadow-sm"
            >
              + Check In
            </button>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s how you&apos;ve been feeling lately</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Current Mood"
            value={latestMood ? `${MOOD_EMOJIS[latestMood.mood as 1|2|3|4|5]}` : '—'}
            sub={latestMood ? MOOD_LABELS[latestMood.mood as 1|2|3|4|5] : 'No check-ins yet'}
            bg="from-indigo-500 to-purple-600"
          />
          <StatCard
            label="Streak"
            value={`${data?.streakDays ?? 0}`}
            sub="consecutive days"
            bg="from-orange-400 to-pink-500"
          />
          <StatCard
            label="Latest Stress"
            value={latestMood ? `${latestMood.stress}/5` : '—'}
            sub={(latestMood?.stress ?? 0) >= 4 ? 'High — take breaks' : 'Under control'}
            bg="from-red-400 to-rose-500"
          />
          <StatCard
            label="Latest Energy"
            value={latestMood ? `${latestMood.energy}/5` : '—'}
            sub={(latestMood?.energy ?? 5) <= 2 ? 'Low — rest up' : 'Good energy'}
            bg="from-emerald-400 to-teal-500"
          />
        </div>

        {/* Period toggle */}
        <div className="flex gap-2 mb-6">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                days === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mood Trend */}
            {data?.moodTrend && data.moodTrend.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <ChartCard title="Mood & Stress Trend" icon="📈">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.moodTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Mood" />
                      <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} name="Stress" />
                      <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Energy" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {data.triggerFrequency.length > 0 && (
                  <ChartCard title="Top Stress Triggers" icon="⚡">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.triggerFrequency.slice(0, 6)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip />
                        <Bar dataKey="count" name="Times" radius={[0, 4, 4, 0]}>
                          {data.triggerFrequency.slice(0, 6).map((_, i) => (
                            <Cell key={i} fill={TRIGGER_COLORS[i % TRIGGER_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </div>
            ) : (
              <EmptyState />
            )}

            {/* Recent Wellness Actions */}
            {data?.recentActions && data.recentActions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎯</span> Recent Wellness Actions
                </h3>
                <div className="space-y-3">
                  {data.recentActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {new Date(action.generated_at).getDate()}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          {new Date(action.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-700">{action.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, bg }: { label: string; value: string; sub: string; bg: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-5 text-white shadow-sm`}>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-1">{sub}</p>
    </div>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}

function EmptyState() {
  const router = useRouter()
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
      <div className="text-4xl mb-3">🌱</div>
      <h3 className="font-semibold text-gray-700 mb-1">No check-ins yet</h3>
      <p className="text-gray-400 text-sm mb-4">Start tracking to see your wellness trends</p>
      <button
        onClick={() => router.push('/checkin')}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
      >
        Start your first check-in
      </button>
    </div>
  )
}
