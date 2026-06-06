export type Mood = 1 | 2 | 3 | 4 | 5

export const MOOD_LABELS: Record<Mood, string> = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy',
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export const TRIGGERS = {
  Academic: [
    'Exam Anxiety',
    'Study Backlog',
    'Poor Performance',
    'Lack of Preparation',
    'Burnout',
    'Self-Doubt',
  ],
  Lifestyle: ['Poor Sleep', 'Health Issues', 'Social Media'],
  Social: ['Family Expectations', 'Peer Comparison', 'Relationship Issues'],
  Other: ['Other'],
} as const

export interface CheckIn {
  id: string
  user_id: string
  mood: Mood
  stress_level: number
  energy_level: number
  created_at: string
}

export interface Trigger {
  id: string
  check_in_id: string
  trigger_name: string
}

export interface Reflection {
  id: string
  check_in_id: string
  content: string
}

export interface WellnessAction {
  id: string
  user_id: string
  insight: string
  recommendation: string
  generated_at: string
}

export interface CheckInWithDetails extends CheckIn {
  triggers: Trigger[]
  reflection: Reflection | null
  wellness_action: WellnessAction | null
}

export interface DashboardData {
  moodTrend: { date: string; mood: number; stress: number; energy: number }[]
  triggerFrequency: { name: string; count: number }[]
  recentActions: WellnessAction[]
  streakDays: number
}

export interface WeeklySummary {
  avgMood: number
  avgStress: number
  avgEnergy: number
  topTrigger: string
  checkInCount: number
  narrative: string
  narrativeSource: 'ai' | 'rule-based'
}
