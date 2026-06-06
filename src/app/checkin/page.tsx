'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOOD_EMOJIS, MOOD_LABELS, TRIGGERS } from '@/lib/types'
import type { Mood } from '@/lib/types'

type Step = 'mood' | 'triggers' | 'reflection' | 'result'

interface Result {
  insight: string
  recommendation: string
}

export default function CheckInPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('mood')
  const [mood, setMood] = useState<Mood | null>(null)
  const [stress, setStress] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  function toggleTrigger(t: string) {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          stressLevel: stress,
          energyLevel: energy,
          triggers: selectedTriggers,
          reflection,
        }),
      })
      if (!res.ok) throw new Error('Failed to save check-in')
      const data = await res.json()
      setResult({ insight: data.insight, recommendation: data.recommendation })
      setStep('result')
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps: Step[] = ['mood', 'triggers', 'reflection', 'result']
  const stepIndex = steps.indexOf(step)
  const progress = ((stepIndex) / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step !== 'result' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {stepIndex + 1} of 3
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                ✕ Cancel
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 'mood' && (
            <MoodStep
              mood={mood}
              setMood={setMood}
              stress={stress}
              setStress={setStress}
              energy={energy}
              setEnergy={setEnergy}
              onNext={() => setStep('triggers')}
            />
          )}
          {step === 'triggers' && (
            <TriggersStep
              selected={selectedTriggers}
              toggle={toggleTrigger}
              onBack={() => setStep('mood')}
              onNext={() => setStep('reflection')}
            />
          )}
          {step === 'reflection' && (
            <ReflectionStep
              value={reflection}
              onChange={setReflection}
              onBack={() => setStep('triggers')}
              onSubmit={submit}
              loading={loading}
              error={error}
            />
          )}
          {step === 'result' && result && (
            <ResultStep
              insight={result.insight}
              recommendation={result.recommendation}
              mood={mood!}
              onDone={() => router.push('/dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function MoodStep({
  mood, setMood, stress, setStress, energy, setEnergy, onNext,
}: {
  mood: Mood | null
  setMood: (m: Mood) => void
  stress: number
  setStress: (v: number) => void
  energy: number
  setEnergy: (v: number) => void
  onNext: () => void
}) {
  const moods: Mood[] = [1, 2, 3, 4, 5]
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">How are you feeling?</h2>
      <p className="text-gray-500 mb-6">Select your current mood</p>

      <div className="flex justify-between mb-8">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              mood === m
                ? 'bg-indigo-50 border-2 border-indigo-500 scale-110'
                : 'border-2 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl">{MOOD_EMOJIS[m]}</span>
            <span className="text-xs mt-1 text-gray-600 text-center leading-tight">
              {MOOD_LABELS[m].replace(' ', '\n')}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-5 mb-8">
        <SliderField
          label="Stress Level"
          value={stress}
          onChange={setStress}
          low="Calm"
          high="Very Stressed"
          color="red"
        />
        <SliderField
          label="Energy Level"
          value={energy}
          onChange={setEnergy}
          low="Exhausted"
          high="Energized"
          color="green"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!mood}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  )
}

function SliderField({
  label, value, onChange, low, high, color,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  low: string
  high: string
  color: 'red' | 'green'
}) {
  const trackColor = color === 'red' ? 'accent-red-500' : 'accent-green-500'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${color === 'red' ? 'text-red-600' : 'text-green-600'}`}>
          {value}/5
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${trackColor} bg-gray-200`}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

function TriggersStep({
  selected, toggle, onBack, onNext,
}: {
  selected: string[]
  toggle: (t: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">What&apos;s weighing on you?</h2>
      <p className="text-gray-500 mb-6">Select all that apply (optional)</p>

      <div className="space-y-4 mb-8 max-h-72 overflow-y-auto pr-1">
        {Object.entries(TRIGGERS).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {(items as readonly string[]).map((item) => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selected.includes(item)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

function ReflectionStep({
  value, onChange, onBack, onSubmit, loading, error,
}: {
  value: string
  onChange: (v: string) => void
  onBack: () => void
  onSubmit: () => void
  loading: boolean
  error: string
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Reflect on your day</h2>
      <p className="text-gray-500 mb-6">Write freely — this is just for you (optional)</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        rows={5}
        placeholder="What's on your mind? How did today feel? Any wins or challenges..."
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 resize-none mb-2"
      />
      <p className="text-xs text-gray-400 text-right mb-6">{value.length}/1000</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-60"
        >
          {loading ? 'Saving...' : '✓ Complete'}
        </button>
      </div>
    </div>
  )
}

function ResultStep({
  insight, recommendation, mood, onDone,
}: {
  insight: string
  recommendation: string
  mood: Mood
  onDone: () => void
}) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">{MOOD_EMOJIS[mood]}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Check-in complete!</h2>
      <p className="text-gray-500 mb-8">Here&apos;s your personalized wellness insight</p>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-4 text-left border border-indigo-100">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Today&apos;s Insight</p>
            <p className="text-gray-700 leading-relaxed">{insight}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-8 text-left border border-green-100">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Recommended Action</p>
            <p className="text-gray-700 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
      >
        View Dashboard →
      </button>
    </div>
  )
}
