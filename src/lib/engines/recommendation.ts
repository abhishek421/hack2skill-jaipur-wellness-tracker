interface RecommendationInput {
  mood: number
  stress: number
  energy: number
  triggers: string[]
  recentRecommendations: string[]
}

const RECOMMENDATIONS: Record<string, string[]> = {
  'Exam Anxiety': [
    'Spend 10 minutes reviewing topics you already know well to rebuild confidence.',
    'Write down your three strongest subjects and focus on one today.',
    'Take 5 slow deep breaths before your next study session.',
  ],
  'Study Backlog': [
    'Break tomorrow\'s study target into three smaller tasks instead of one large goal.',
    'Choose just one chapter to complete today — progress beats perfection.',
    'Set a 25-minute focused study timer and take a 5-minute break after.',
  ],
  'Poor Sleep': [
    'Aim for a consistent sleep schedule tonight and avoid screens 30 minutes before bed.',
    'Try a 10-minute body scan meditation before sleeping tonight.',
    'Prepare tomorrow\'s study plan tonight so mornings feel less rushed.',
  ],
  'Peer Comparison': [
    'Focus on one personal improvement goal for tomorrow rather than comparing scores.',
    'Write down one thing you did well today — no comparison allowed.',
    'Set one specific target based on your own past performance.',
  ],
  'Burnout': [
    'Give yourself permission to rest for 30 minutes without guilt today.',
    'Do one thing purely for enjoyment — unrelated to studying.',
    'Take a short outdoor walk to reset your mental state.',
  ],
  'Self-Doubt': [
    'Write down three things you have successfully completed this week.',
    'Review your notes from a topic you already mastered.',
    'Talk to a friend or family member about something other than exams.',
  ],
  'Poor Performance': [
    'Identify one specific topic to revise rather than reviewing everything.',
    'Practice one set of questions from your weakest subject today.',
    'Treat mistakes as feedback — note what went wrong and plan the fix.',
  ],
  'Family Expectations': [
    'Have a brief honest conversation with a family member about how you\'re feeling.',
    'Focus on your own definition of success for tomorrow.',
    'Write down your personal academic goal — independent of others\' expectations.',
  ],
  'Relationship Issues': [
    'Set aside 20 minutes to reconnect with someone who supports you.',
    'Journal about your feelings for 10 minutes to process them.',
    'Focus your study energy in short, productive bursts today.',
  ],
}

const DEFAULT_RECOMMENDATIONS = [
  'Complete one task under 20 minutes to build momentum.',
  'Take a 15-minute outdoor walk to clear your mind.',
  'Drink a glass of water and stretch for 5 minutes before studying.',
  'Write down your top priority for tomorrow before going to sleep.',
  'Spend 10 minutes organizing your study space.',
  'Review your goals and remind yourself why you started.',
  'Practice gratitude — write down three things you\'re thankful for today.',
]

export function generateRecommendation(input: RecommendationInput): string {
  const { mood, stress, energy, triggers, recentRecommendations } = input

  const candidates: string[] = []

  // Collect trigger-specific recommendations
  for (const trigger of triggers) {
    const recs = RECOMMENDATIONS[trigger]
    if (recs) candidates.push(...recs)
  }

  // Add default recs if low motivation (mood <= 3 and energy <= 2)
  if (mood <= 3 && energy <= 2) {
    candidates.push(...DEFAULT_RECOMMENDATIONS)
  }

  if (candidates.length === 0) {
    candidates.push(...DEFAULT_RECOMMENDATIONS)
  }

  // Filter out recently used recommendations (within last 3)
  const fresh = candidates.filter((r) => !recentRecommendations.slice(-3).includes(r))
  const pool = fresh.length > 0 ? fresh : candidates

  // Pick based on priority: high stress → calming; low energy → energizing
  if (stress >= 4 && pool.some((r) => r.includes('breath') || r.includes('walk') || r.includes('rest'))) {
    const calming = pool.filter((r) => r.includes('breath') || r.includes('walk') || r.includes('rest') || r.includes('break'))
    if (calming.length > 0) return calming[0]
  }

  return pool[Math.floor(Math.random() * pool.length)]
}
