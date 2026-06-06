'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types'
import type { DashboardData } from '@/lib/types'

const TRIGGER_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f472b6', '#fb7185']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)

  const fetchDashboard = useCallback(async (signal: AbortSignal) => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/dashboard?days=${days}`, { signal })
      if (!res.ok) {
        setFetchError('Failed to load dashboard data. Please try again.')
      } else {
        setData(await res.json())
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setFetchError('Failed to load dashboard data. Please try again.')
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [days])

  useEffect(() => {
    const controller = new AbortController()
    supabase.auth.getUser()
      .then(({ data: { user } }) => setUser(user))
      .catch(() => {})
    fetchDashboard(controller.signal)
    return () => controller.abort()
  }, [fetchDashboard, supabase.auth])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  if (loading) {
    return <LoadingState signOut={signOut} router={router} />
  }

  if (!data) {
    return <ErrorOrEmptyState error={fetchError} signOut={signOut} router={router} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF]">
      <DashboardNav router={router} signOut={signOut} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <DashboardHeader userName={userName} />
        <StatsSection data={data} />
        <PeriodToggle days={days} setDays={setDays} />
        {fetchError && <ErrorMessage message={fetchError} />}
        <div className="space-y-6">
          <ChartSection data={data} />
          <RecentActionsCard actions={data.recentActions} />
        </div>
      </main>
    </div>
  )
}

function DashboardNav({ router, signOut }: { router: any; signOut: () => void }) {
  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-white/60 px-6 py-3 shadow-[0_8px_30px_rgb(59,130,246,0.05)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧘</span>
          <span className="font-bold text-slate-900 text-lg">MindTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/weekly-summary')}
            className="text-sm text-slate-600 hover:text-blue-600 font-medium transition"
          >
            Weekly Summary
          </button>
          <button
            onClick={() => router.push('/checkin')}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
          >
            + Check In
          </button>
          <button
            onClick={signOut}
            className="text-sm text-slate-400 hover:text-slate-600 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}

function DashboardHeader({ userName }: { userName: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Hello, {userName} 👋
      </h1>
      <p className="text-slate-500 mt-1">Here&apos;s how you&apos;ve been feeling lately</p>
    </div>
  )
}

function StatsSection({ data }: { data: DashboardData }) {
  const latestMood = data.moodTrend?.slice(-1)[0]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Current Mood"
        value={latestMood ? `${MOOD_EMOJIS[latestMood.mood as 1|2|3|4|5]}` : '—'}
        sub={latestMood ? MOOD_LABELS[latestMood.mood as 1|2|3|4|5] : 'No check-ins yet'}
      />
      <StatCard
        label="Streak"
        value={`${data.streakDays ?? 0}`}
        sub="consecutive days"
      />
      <StatCard
        label="Latest Stress"
        value={latestMood ? `${latestMood.stress}/5` : '—'}
        sub={(latestMood?.stress ?? 0) >= 4 ? 'High — take breaks' : 'Under control'}
      />
      <StatCard
        label="Latest Energy"
        value={latestMood ? `${latestMood.energy}/5` : '—'}
        sub={(latestMood?.energy ?? 5) <= 2 ? 'Low — rest up' : 'Good energy'}
      />
    </div>
  )
}

function PeriodToggle({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  return (
    <div className="flex gap-2 mb-6">
      {[7, 14, 30].map((d) => (
        <button
          key={d}
          onClick={() => setDays(d)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            days === d
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/50 backdrop-blur-md text-slate-600 hover:bg-white/70 border border-white/60 shadow-sm'
          }`}
        >
          {d} days
        </button>
      ))}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="polite" className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  )
}

function LoadingState({ signOut, router }: { signOut: () => void; router: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF]">
      <DashboardNav router={router} signOut={signOut} />
      <main className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-center py-20">
        <div role="status" aria-label="Loading dashboard" className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  )
}

function ErrorOrEmptyState({ error, signOut, router }: { error: string | null; signOut: () => void; router: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF]">
      <DashboardNav router={router} signOut={signOut} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && <ErrorMessage message={error} />}
        <EmptyState />
      </main>
    </div>
  )
}

function ChartSection({ data }: { data: DashboardData }) {
  if (!data.moodTrend || data.moodTrend.length === 0) {
    return <EmptyState />
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ChartCard title="Mood & Stress Trend" icon="📈">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.moodTrend}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#BAE6FD" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 30px rgba(59,130,246,0.1)', color: '#0F172A' }} />
            <Area type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Mood" />
            <Area type="monotone" dataKey="stress" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" name="Stress" />
            <Area type="monotone" dataKey="energy" stroke="#BAE6FD" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" name="Energy" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {data.triggerFrequency.length > 0 && (
        <ChartCard title="Top Stress Triggers" icon="⚡">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.triggerFrequency.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'rgba(59,130,246,0.05)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 30px rgba(59,130,246,0.1)', color: '#0F172A' }} />
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
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 text-slate-900 shadow-[0_8px_30px_rgb(59,130,246,0.1)] flex flex-col items-center justify-center text-center">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-6">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span aria-hidden="true">{icon}</span> {title}
      </h3>
      <div role="img" aria-label={title} className="w-full h-[200px]">
        {children}
      </div>
    </div>
  )
}

function RecentActionsCard({ actions }: { actions: Array<{ generated_at: string; recommendation: string }> }) {
  if (!actions || actions.length === 0) return null
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-6">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span aria-hidden="true">🎯</span> Recent Wellness Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.generated_at} className="flex items-start gap-3 p-3 rounded-2xl bg-white/50 border border-white/60 backdrop-blur-sm shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shadow-inner">
              {new Date(action.generated_at).getDate()}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">
                {new Date(action.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-slate-700">{action.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  const router = useRouter()
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-12 text-center">
      <div className="text-4xl mb-3">🌱</div>
      <h3 className="font-semibold text-slate-700 mb-1">No check-ins yet</h3>
      <p className="text-slate-500 text-sm mb-4">Start tracking to see your wellness trends</p>
      <button
        onClick={() => router.push('/checkin')}
        className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
      >
        Start your first check-in
      </button>
    </div>
  )
}
