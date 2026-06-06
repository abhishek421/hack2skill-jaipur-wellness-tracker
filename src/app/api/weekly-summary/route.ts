import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MOOD_LABELS } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: true })

  if (!checkIns || checkIns.length === 0) {
    return NextResponse.json({ empty: true })
  }

  const { data: triggers } = await supabase
    .from('triggers')
    .select('trigger_name')
    .in('check_in_id', checkIns.map((c: { id: string }) => c.id))

  const avgMood = checkIns.reduce((s: number, c: { mood: number }) => s + c.mood, 0) / checkIns.length
  const avgStress = checkIns.reduce((s: number, c: { stress_level: number }) => s + c.stress_level, 0) / checkIns.length
  const avgEnergy = checkIns.reduce((s: number, c: { energy_level: number }) => s + c.energy_level, 0) / checkIns.length

  const triggerCounts: Record<string, number> = {}
  ;(triggers || []).forEach((t: { trigger_name: string }) => {
    triggerCounts[t.trigger_name] = (triggerCounts[t.trigger_name] || 0) + 1
  })
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

  const moodLabel = MOOD_LABELS[Math.round(avgMood) as 1 | 2 | 3 | 4 | 5]

  const moodTrend = checkIns.slice(-3).map((c: { mood: number }) => c.mood)
  const moodDeclining = moodTrend.length >= 2 && moodTrend[moodTrend.length - 1] < moodTrend[0]
  const energyLow = avgEnergy < 2.5

  let narrative = `This week, you completed ${checkIns.length} check-in${checkIns.length !== 1 ? 's' : ''}. `

  if (topTrigger !== 'None') {
    narrative += `${topTrigger} was your most common source of stress. `
  }

  if (moodDeclining) {
    narrative += 'Your mood dipped toward the end of the week — rest and small wins may help. '
  } else if (avgMood >= 4) {
    narrative += 'Your mood stayed positive throughout the week — keep it up! '
  } else {
    narrative += `Your overall mood was ${moodLabel.toLowerCase()}. `
  }

  if (energyLow) {
    narrative += 'Energy was low this week, so prioritizing sleep and breaks would be beneficial.'
  } else if (avgStress > 3.5) {
    narrative += 'Stress levels were high — consider breaking your study sessions into shorter focused blocks.'
  } else {
    narrative += 'Keep tracking your emotions to build stronger self-awareness over time.'
  }

  return NextResponse.json({
    avgMood: Math.round(avgMood * 10) / 10,
    avgStress: Math.round(avgStress * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    topTrigger,
    checkInCount: checkIns.length,
    narrative: narrative.trim(),
  })
}
