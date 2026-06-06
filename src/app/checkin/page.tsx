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
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step !== 'result' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {stepIndex + 1} of 3
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                ✕ Cancel
              </button>
            </div>
            <div
              className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-full h-2 shadow-inner"
              role="progressbar"
              aria-valuenow={stepIndex + 1}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Step ${stepIndex + 1} of 3`}
            >
              <div
                className="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(59,130,246,0.1)] p-8 border border-white/60">
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
      <h2 className="text-2xl font-bold text-slate-900 mb-1">How are you feeling?</h2>
      <p className="text-slate-500 mb-6">Select your current mood</p>

      <div className="flex justify-between mb-8">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            aria-pressed={mood === m}
            aria-label={MOOD_LABELS[m]}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all shadow-sm ${
              mood === m
                ? 'bg-white/90 border-2 border-blue-500 shadow-[0_8px_30px_rgb(59,130,246,0.2)] scale-110'
                : 'bg-white/50 backdrop-blur-sm border-2 border-white/60 hover:bg-white/70'
            }`}
          >
            <span className="text-3xl">{MOOD_EMOJIS[m]}</span>
            <span className="text-xs mt-1 text-slate-600 text-center leading-tight">
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
        />
        <SliderField
          label="Energy Level"
          value={energy}
          onChange={setEnergy}
          low="Exhausted"
          high="Energized"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!mood}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
      >
        Continue →
      </button>
    </div>
  )
}

function SliderField({
  label, value, onChange, low, high,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  low: string
  high: string
}) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        <span aria-hidden="true" className="text-sm font-bold text-blue-600">
          {value}/5
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        aria-label={`${label}: ${value} out of 5`}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-white/50 backdrop-blur-sm border border-white/60 shadow-inner"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1" aria-hidden="true">
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
  const [customText, setCustomText] = useState('')
  const [customAdded, setCustomAdded] = useState(false)

  function addCustom() {
    const text = customText.trim()
    if (!text) return
    toggle(`Other: ${text}`)
    setCustomAdded(true)
    setCustomText('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">What&apos;s weighing on you?</h2>
      <p className="text-slate-500 mb-6">Select all that apply (optional)</p>

      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-1">
        {Object.entries(TRIGGERS).filter(([cat]) => cat !== 'Other').map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {(items as readonly string[]).map((item) => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  aria-pressed={selected.includes(item)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    selected.includes(item)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-blue-500'
                      : 'bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-white/70 border-white/60 shadow-sm'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom trigger input */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Other</p>
        <div className="flex gap-2">
          <label htmlFor="custom-trigger-input" className="sr-only">Describe another trigger</label>
          <input
            id="custom-trigger-input"
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder="Describe another trigger..."
            maxLength={80}
            className="flex-1 px-3 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-sm"
          />
          <button
            onClick={addCustom}
            disabled={!customText.trim()}
            className="px-4 py-2 rounded-xl bg-blue-100/50 backdrop-blur-sm text-blue-700 text-sm font-medium hover:bg-blue-100 border border-white/60 disabled:opacity-40 transition shadow-sm"
          >
            Add
          </button>
        </div>
        {selected.filter((t) => t.startsWith('Other: ')).map((t) => (
          <div key={t} className="mt-2 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm shadow-sm">{t.replace('Other: ', '')}</span>
            <button
              onClick={() => toggle(t)}
              aria-label={`Remove trigger: ${t.replace('Other: ', '')}`}
              className="text-slate-400 hover:text-red-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-slate-600 font-medium hover:bg-white/70 transition shadow-sm"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
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
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Reflect on your day</h2>
      <p className="text-slate-500 mb-6">Write freely — this is just for you (optional)</p>

      <label htmlFor="reflection-text" className="sr-only">Reflection journal</label>
      <textarea
        id="reflection-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        rows={5}
        placeholder="What's on your mind? How did today feel? Any wins or challenges..."
        aria-describedby="reflection-char-count"
        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800 resize-none mb-2 shadow-sm"
      />
      <p id="reflection-char-count" className="text-xs text-slate-400 text-right mb-6">{value.length}/1000</p>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-slate-600 font-medium hover:bg-white/70 transition shadow-sm"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-60 shadow-lg shadow-blue-500/30"
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
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Check-in complete!</h2>
      <p className="text-slate-500 mb-8">Here&apos;s your personalized wellness insight</p>

      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 mb-4 text-left border border-white/60 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Today&apos;s Insight</p>
            <p className="text-slate-700 leading-relaxed">{insight}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 mb-8 text-left border border-white/60 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Recommended Action</p>
            <p className="text-slate-700 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
      >
        View Dashboard →
      </button>
    </div>
  )
}
