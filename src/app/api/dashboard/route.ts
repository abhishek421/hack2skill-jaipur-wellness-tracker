import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const rawDays = parseInt(searchParams.get('days') || '7')
  const days = Number.isFinite(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 7
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: windowCheckInIds } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', since)

  const ids = (windowCheckInIds || []).map((c: { id: string }) => c.id)

  const [checkInsResult, triggersResult, actionsResult, allCheckInsResult] = await Promise.all([
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', since)
      .order('created_at', { ascending: true }),
    supabase
      .from('triggers')
      .select('trigger_name, check_in_id')
      .in('check_in_id', ids),
    supabase
      .from('wellness_actions')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(10),
    supabase
      .from('check_ins')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const checkIns = checkInsResult.data || []
  const triggers = triggersResult.data || []

  const moodTrend = checkIns.map((c: { created_at: string; mood: number; stress_level: number; energy_level: number }) => ({
    date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: c.mood,
    stress: c.stress_level,
    energy: c.energy_level,
  }))

  const triggerCounts: Record<string, number> = {}
  triggers.forEach((t: { trigger_name: string }) => {
    triggerCounts[t.trigger_name] = (triggerCounts[t.trigger_name] || 0) + 1
  })
  const triggerFrequency = Object.entries(triggerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Calculate streak
  const allDates = (allCheckInsResult.data || []).map((c: { created_at: string }) =>
    new Date(c.created_at).toDateString()
  )
  const uniqueDates = [...new Set(allDates)]
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (uniqueDates.includes(d.toDateString())) {
      streak++
    } else {
      break
    }
  }

  return NextResponse.json({
    moodTrend,
    triggerFrequency,
    recentActions: actionsResult.data || [],
    streakDays: streak,
    totalCheckIns: allCheckInsResult.data?.length || 0,
  })
}
