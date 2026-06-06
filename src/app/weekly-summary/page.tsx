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

  useEffect(() => {
    fetch('/api/weekly-summary')
      .then((r) => r.json())
      .then((data) => {
        if (data.empty) setEmpty(true)
        else setSummary(data)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <span className="font-bold text-gray-900">MindTrack</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Summary</h1>
          <p className="text-gray-500 mt-1">Your emotional wellness this week</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && empty && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-700 mb-1">Not enough data yet</h3>
            <p className="text-gray-400 text-sm mb-4">Complete at least one check-in this week to see your summary</p>
            <button
              onClick={() => router.push('/checkin')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Start Check-in
            </button>
          </div>
        )}

        {!loading && summary && (
          <div className="space-y-6">
            {/* Narrative */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-3">{moodEmoji}</div>
              <p className="text-lg font-medium leading-relaxed opacity-95">{summary.narrative}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Average Mood"
                value={`${moodEmoji} ${summary.avgMood.toFixed(1)}`}
                sub={moodLabel}
                color="indigo"
              />
              <MetricCard
                label="Average Stress"
                value={`${summary.avgStress.toFixed(1)}/5`}
                sub={summary.avgStress > 3 ? 'Elevated' : 'Manageable'}
                color="red"
              />
              <MetricCard
                label="Average Energy"
                value={`${summary.avgEnergy.toFixed(1)}/5`}
                sub={summary.avgEnergy < 2.5 ? 'Low' : summary.avgEnergy >= 4 ? 'High' : 'Moderate'}
                color="green"
              />
              <MetricCard
                label="Check-ins"
                value={`${summary.checkInCount}`}
                sub={`${summary.checkInCount >= 5 ? 'Great' : summary.checkInCount >= 3 ? 'Good' : 'Keep going'} consistency`}
                color="purple"
              />
            </div>

            {/* Top Trigger */}
            {summary.topTrigger !== 'None' && (
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">⚡</div>
                  <div>
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Top Stress Trigger</p>
                    <p className="font-semibold text-gray-900">{summary.topTrigger}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Radar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Wellness Balance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
                  <Radar name="You" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <button
              onClick={() => router.push('/checkin')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Start Today&apos;s Check-in →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label, value, sub, color,
}: {
  label: string
  value: string
  sub: string
  color: 'indigo' | 'red' | 'green' | 'purple'
}) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}
