import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MOOD_LABELS } from '@/lib/types'
import { generateWeeklyNarrative } from '@/lib/ai/generateWeeklyNarrative'
import type { WeeklyNarrativeInput } from '@/lib/ai/generateWeeklyNarrative'
import { trend } from '@/lib/utils/trend'
import { countFrequency } from '@/lib/utils/countFrequency'

function ruleBased(
  checkInCount: number,
  topTrigger: string,
  avgMood: number,
  avgStress: number,
  avgEnergy: number,
  moodValues: number[]
): string {
  const moodLabel = MOOD_LABELS[Math.min(5, Math.max(1, Math.round(avgMood))) as 1 | 2 | 3 | 4 | 5]
  const moodTrend = moodValues.slice(-3)
  const moodDeclining = moodTrend.length >= 2 && moodTrend[moodTrend.length - 1] < moodTrend[0]

  let narrative = `This week, you completed ${checkInCount} check-in${checkInCount !== 1 ? 's' : ''}. `
  if (topTrigger !== 'None') narrative += `${topTrigger} was your most common source of stress. `
  if (moodDeclining) {
    narrative += 'Your mood dipped toward the end of the week — rest and small wins may help. '
  } else if (avgMood >= 4) {
    narrative += 'Your mood stayed positive throughout the week — keep it up! '
  } else {
    narrative += `Your overall mood was ${moodLabel.toLowerCase()}. `
  }
  if (avgEnergy < 2.5) {
    narrative += 'Energy was low this week, so prioritizing sleep and breaks would be beneficial.'
  } else if (avgStress > 3.5) {
    narrative += 'Stress levels were high — consider breaking your study sessions into shorter focused blocks.'
  } else {
    narrative += 'Keep tracking your emotions to build stronger self-awareness over time.'
  }
  return narrative.trim()
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysFromMonday
  ))
  const weekStartISO = weekStart.toISOString()
  const weekStartDate = weekStart.toISOString().split('T')[0]
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  const isClosed = now >= weekEnd

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', weekStartISO)
    .order('created_at', { ascending: true })

  if (!checkIns || checkIns.length === 0) {
    return NextResponse.json({ empty: true })
  }

  const [{ data: triggers }, { data: reflections }] = await Promise.all([
    supabase
      .from('triggers')
      .select('trigger_name')
      .in('check_in_id', checkIns.map((c: { id: string }) => c.id)),
    supabase
      .from('reflections')
      .select('content, check_in_id')
      .in('check_in_id', checkIns.map((c: { id: string }) => c.id))
      .order('check_in_id', { ascending: false })
      .limit(3),
  ])

  const avgMood = checkIns.reduce((s: number, c: { mood: number }) => s + c.mood, 0) / checkIns.length
  const avgStress = checkIns.reduce((s: number, c: { stress_level: number }) => s + c.stress_level, 0) / checkIns.length
  const avgEnergy = checkIns.reduce((s: number, c: { energy_level: number }) => s + c.energy_level, 0) / checkIns.length

  const moodValues = checkIns.map((c: { mood: number }) => c.mood)
  const stressValues = checkIns.map((c: { stress_level: number }) => c.stress_level)

  const triggerCounts = countFrequency((triggers || []).map((t: { trigger_name: string }) => t.trigger_name))
  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])
  const topTrigger = sortedTriggers[0]?.[0] || 'None'
  const topTriggers = sortedTriggers.slice(0, 3).map(([name]) => name)

  const moodByDay = checkIns.reduce((acc: Record<string, number>, c: { created_at: string; mood: number }) => {
    const day = c.created_at.split('T')[0]
    if (!acc[day] || c.mood < acc[day]) acc[day] = c.mood
    return acc
  }, {} as Record<string, number>)
  const moodEntries = Object.entries(moodByDay) as [string, number][]
  const lowestMoodDay = moodEntries.length ? moodEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0] : null
  const highestMoodDay = moodEntries.length ? moodEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0] : null

  const fallback = ruleBased(checkIns.length, topTrigger, avgMood, avgStress, avgEnergy, moodValues)

  // Check cache for closed weeks
  if (isClosed) {
    const { data: cached } = await supabase
      .from('weekly_summaries')
      .select('narrative, source')
      .eq('user_id', user.id)
      .eq('week_start', weekStartDate)
      .maybeSingle()

    if (cached) {
      return NextResponse.json({
        avgMood: Math.round(avgMood * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        topTrigger,
        checkInCount: checkIns.length,
        narrative: cached.narrative,
        narrativeSource: cached.source,
      })
    }
  }

  const rawName = user.user_metadata?.name
  const studentName = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : 'Student'
  const firstName = studentName.split(' ')[0]

  const narrativeInput: WeeklyNarrativeInput = {
    studentName: firstName,
    weekStartDate,
    checkInCount: checkIns.length,
    averageMood: Math.round(avgMood * 10) / 10,
    averageStress: Math.round(avgStress * 10) / 10,
    averageEnergy: Math.round(avgEnergy * 10) / 10,
    moodTrend: trend(moodValues),
    stressTrend: trend(stressValues),
    topTriggers: topTriggers.length ? topTriggers : ['None'],
    triggerFrequency: triggerCounts,
    reflectionSnippets: (reflections || []).map((r: { content: string }) => r.content),
    lowestMoodDay,
    highestMoodDay,
  }

  let narrative = fallback
  let narrativeSource: 'ai' | 'rule-based' = 'rule-based'

  try {
    narrative = await generateWeeklyNarrative(narrativeInput)
    narrativeSource = 'ai'

    if (isClosed) {
      await supabase.from('weekly_summaries').upsert({
        user_id: user.id,
        week_start: weekStartDate,
        narrative,
        source: narrativeSource,
      })
    }
  } catch (err) {
    console.error('[weekly-summary] LLM error, using fallback:', err)
  }

  return NextResponse.json({
    avgMood: Math.round(avgMood * 10) / 10,
    avgStress: Math.round(avgStress * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    topTrigger,
    checkInCount: checkIns.length,
    narrative,
    narrativeSource,
  })
}
