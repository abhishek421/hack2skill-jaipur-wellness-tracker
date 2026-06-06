import type { CheckIn } from '@/lib/types'

interface InsightInput {
  current: { mood: number; stress: number; energy: number; triggers: string[] }
  history: { checkIns: CheckIn[]; triggers: { check_in_id: string; trigger_name: string }[] }
}

export function generateInsight(input: InsightInput): string {
  const { current, history } = input
  const allTriggers = history.triggers.map((t) => t.trigger_name)

  const triggerCounts: Record<string, number> = {}
  allTriggers.forEach((t) => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1
  })

  // Include current triggers in frequency
  current.triggers.forEach((t) => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1
  })

  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])
  const topTrigger = sortedTriggers[0]

  if (topTrigger && topTrigger[1] >= 3) {
    return `You've reported ${topTrigger[0].toLowerCase()} as a recurring source of stress ${topTrigger[1]} times recently.`
  }

  const recentCheckIns = history.checkIns.slice(-4)
  if (recentCheckIns.length >= 3) {
    const avgStress = recentCheckIns.reduce((s, c) => s + c.stress_level, 0) / recentCheckIns.length
    const avgEnergy = recentCheckIns.reduce((s, c) => s + c.energy_level, 0) / recentCheckIns.length

    if (avgStress > 3.5) {
      return 'Your stress levels have been elevated over the last few days. Small breaks can make a big difference.'
    }
    if (avgEnergy < 2.5) {
      return 'Your energy levels have been consistently low recently. Rest and recovery may be needed.'
    }

    const moodTrend = recentCheckIns.map((c) => c.mood)
    const isDecreasing = moodTrend.every((m, i) => i === 0 || m <= moodTrend[i - 1])
    if (isDecreasing && moodTrend[0] > moodTrend[moodTrend.length - 1]) {
      return 'Your mood has been gradually declining. Consider taking a short break to recharge.'
    }
  }

  if (current.triggers.includes('Exam Anxiety')) {
    return 'Exam anxiety is weighing on you today. Remember that preparation matters more than perfection.'
  }

  if (current.stress > 3 && current.energy < 3) {
    return 'High stress combined with low energy can make studying feel overwhelming. Small, focused sessions work better now.'
  }

  if (current.mood >= 4) {
    return "You're in a good emotional space today. Use this energy to tackle your most important tasks."
  }

  return "You've taken a positive step by checking in. Self-awareness is the foundation of emotional well-being."
}
