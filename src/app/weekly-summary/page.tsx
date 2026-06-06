'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types'
import type { WeeklySummary } from '@/lib/types'

export default function WeeklySummaryPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/weekly-summary')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (data.empty) setEmpty(true)
        else setSummary(data)
      })
      .catch(() => {
        setFetchError('Failed to load your weekly summary. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const moodEmoji = summary ? MOOD_EMOJIS[Math.round(summary.avgMood) as 1 | 2 | 3 | 4 | 5] : '😐'
  const moodLabel = summary ? MOOD_LABELS[Math.round(summary.avgMood) as 1 | 2 | 3 | 4 | 5] : 'Neutral'

  const radarData = summary
    ? [
        { subject: 'Mood', value: summary.avgMood, fullMark: 5 },
        { subject: 'Energy', value: summary.avgEnergy, fullMark: 5 },
        { subject: 'Calm', value: 6 - summary.avgStress, fullMark: 5 },
      ]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF]">
      <nav aria-label="Main navigation" className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-white/60 px-6 py-3 shadow-[0_8px_30px_rgb(59,130,246,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <span className="font-bold text-slate-900">MindTrack</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Weekly Summary</h1>
          <p className="text-slate-500 mt-1">Your emotional wellness this week</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div role="status" aria-label="Loading weekly summary" className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && fetchError && (
          <div role="alert" aria-live="polite" className="bg-white/70 backdrop-blur-xl rounded-3xl border border-red-200 p-8 text-center text-red-700 text-sm">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && empty && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-slate-700 mb-1">Not enough data yet</h3>
            <p className="text-slate-500 text-sm mb-4">Complete at least one check-in this week to see your summary</p>
            <button
              onClick={() => router.push('/checkin')}
              className="px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
            >
              Start Check-in
            </button>
          </div>
        )}

        {!loading && !fetchError && summary && (
          <div className="space-y-6">
            {/* Narrative */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 text-slate-900 shadow-[0_8px_30px_rgb(59,130,246,0.2)] border border-white/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-100/50 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="text-4xl mb-3">{moodEmoji}</div>
                <p className="text-lg font-medium leading-relaxed opacity-95">{summary.narrative}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Average Mood"
                value={`${moodEmoji} ${summary.avgMood.toFixed(1)}`}
                sub={moodLabel}
              />
              <MetricCard
                label="Average Stress"
                value={`${summary.avgStress.toFixed(1)}/5`}
                sub={summary.avgStress > 3 ? 'Elevated' : 'Manageable'}
              />
              <MetricCard
                label="Average Energy"
                value={`${summary.avgEnergy.toFixed(1)}/5`}
                sub={summary.avgEnergy < 2.5 ? 'Low' : summary.avgEnergy >= 4 ? 'High' : 'Moderate'}
              />
              <MetricCard
                label="Check-ins"
                value={`${summary.checkInCount}`}
                sub={`${summary.checkInCount >= 5 ? 'Great' : summary.checkInCount >= 3 ? 'Good' : 'Keep going'} consistency`}
              />
            </div>

            {/* Top Trigger */}
            {summary.topTrigger !== 'None' && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 shadow-inner flex items-center justify-center text-lg">⚡</div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Top Stress Trigger</p>
                    <p className="font-semibold text-slate-900">{summary.topTrigger}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Radar Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Wellness Balance</h3>
              <div
                role="img"
                aria-label={`Wellness balance radar chart: Mood ${summary.avgMood.toFixed(1)}, Energy ${summary.avgEnergy.toFixed(1)}, Calm ${(6 - summary.avgStress).toFixed(1)} out of 5`}
                className="w-full h-[220px]"
              >
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e0f2fe" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: '#64748B' }} />
                  <Radar name="You" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
              </div>
            </div>


            <button
              onClick={() => router.push('/checkin')}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
            >
              Start Today&apos;s Check-in →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-sm p-4 shadow-sm text-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}
