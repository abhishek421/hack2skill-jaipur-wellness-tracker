import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInsight } from '@/lib/engines/insight'
import { generateRecommendation } from '@/lib/engines/recommendation'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { mood, stressLevel, energyLevel, triggers, reflection } = body

  if (!mood || !stressLevel || !energyLevel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
    return NextResponse.json({ error: 'mood must be an integer between 1 and 5' }, { status: 400 })
  }
  if (!Number.isInteger(stressLevel) || stressLevel < 1 || stressLevel > 5) {
    return NextResponse.json({ error: 'stressLevel must be an integer between 1 and 5' }, { status: 400 })
  }
  if (!Number.isInteger(energyLevel) || energyLevel < 1 || energyLevel > 5) {
    return NextResponse.json({ error: 'energyLevel must be an integer between 1 and 5' }, { status: 400 })
  }
  if (triggers !== undefined && (!Array.isArray(triggers) || triggers.length > 20 || triggers.some((t: unknown) => typeof t !== 'string' || t.length > 100))) {
    return NextResponse.json({ error: 'Invalid triggers' }, { status: 400 })
  }
  if (reflection !== undefined && typeof reflection !== 'string') {
    return NextResponse.json({ error: 'reflection must be a string' }, { status: 400 })
  }
  if (typeof reflection === 'string' && reflection.length > 1000) {
    return NextResponse.json({ error: 'reflection must be 1000 characters or fewer' }, { status: 400 })
  }

  // Create check-in
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({ user_id: user.id, mood, stress_level: stressLevel, energy_level: energyLevel })
    .select()
    .single()

  if (checkInError) return NextResponse.json({ error: checkInError.message }, { status: 500 })

  // Save triggers
  if (triggers?.length > 0) {
    const { error: triggersError } = await supabase.from('triggers').insert(
      triggers.map((t: string) => ({ check_in_id: checkIn.id, trigger_name: t }))
    )
    if (triggersError) return NextResponse.json({ error: triggersError.message }, { status: 500 })
  }

  // Save reflection
  if (reflection?.trim()) {
    const { error: reflectionError } = await supabase
      .from('reflections')
      .insert({ check_in_id: checkIn.id, content: reflection.trim() })
    if (reflectionError) return NextResponse.json({ error: reflectionError.message }, { status: 500 })
  }

  // Fetch history for engine inputs
  const { data: historyCheckIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(14)

  const { data: historyTriggers } = await supabase
    .from('triggers')
    .select('*')
    .in('check_in_id', (historyCheckIns || []).map((c: { id: string }) => c.id))

  const { data: recentActions } = await supabase
    .from('wellness_actions')
    .select('recommendation')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(3)

  const insight = generateInsight({
    current: { mood, stress: stressLevel, energy: energyLevel, triggers: triggers || [] },
    history: {
      checkIns: historyCheckIns || [],
      triggers: historyTriggers || [],
    },
  })

  const recommendation = generateRecommendation({
    mood,
    stress: stressLevel,
    energy: energyLevel,
    triggers: triggers || [],
    recentRecommendations: (recentActions || []).map((a: { recommendation: string }) => a.recommendation),
  })

  // Save wellness action
  const { data: action, error: actionError } = await supabase
    .from('wellness_actions')
    .insert({ user_id: user.id, insight, recommendation })
    .select()
    .single()

  if (actionError) console.error('[checkin] wellness_actions insert failed:', actionError.message)

  return NextResponse.json({ checkInId: checkIn.id, insight, recommendation, actionId: action?.id })
}
