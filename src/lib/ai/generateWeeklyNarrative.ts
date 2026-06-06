import OpenAI from 'openai'

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'volatile'

export type WeeklyNarrativeInput = {
  studentName: string
  weekStartDate: string
  checkInCount: number
  averageMood: number
  averageStress: number
  averageEnergy: number
  moodTrend: TrendDirection
  stressTrend: TrendDirection
  topTriggers: string[]
  triggerFrequency: Record<string, number>
  reflectionSnippets: string[]
  lowestMoodDay: string | null
  highestMoodDay: string | null
}

const SYSTEM_PROMPT = `You are a warm, supportive peer writing a short weekly reflection for a student.
Write 3 to 5 sentences in plain English. Do not use bullet points, headers, or markdown.
Do not diagnose. Do not prescribe. Do not use clinical language.
Do not give advice — a separate recommendation engine already handles that.
Reference the student's actual data: their name, triggers, mood pattern, and journal themes if provided.
Use the student's first name once, naturally.
End with one forward-looking sentence that is encouraging without being dismissive of difficulty.
Keep the total response under 120 words.`

export function sanitiseSnippets(snippets: string[]): string[] {
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const phoneRe = /(\+?\d[\d\s\-().]{7,}\d)/g
  return snippets
    .slice(0, 3)
    .map((s) => {
      let clean = s.replace(emailRe, '[contact]').replace(phoneRe, '[contact]')
      clean = clean.replace(/[{}]/g, '')
      return clean.length > 100 ? clean.slice(0, 100) + '…' : clean
    })
}

export async function generateWeeklyNarrative(input: WeeklyNarrativeInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const model = process.env.NARRATIVE_MODEL || 'gpt-4o-mini'
  const client = new OpenAI({ apiKey })

  const snippets = sanitiseSnippets(input.reflectionSnippets)
  const userMessage = [
    `Student name: ${input.studentName}`,
    `Week: ${input.weekStartDate} (7 days)`,
    `Check-ins completed: ${input.checkInCount}/7`,
    `Average mood: ${input.averageMood}/5`,
    `Average stress: ${input.averageStress}/5`,
    `Average energy: ${input.averageEnergy}/5`,
    `Mood trend this week: ${input.moodTrend}`,
    `Stress trend this week: ${input.stressTrend}`,
    `Top stress triggers: ${input.topTriggers.join(', ')}`,
    `Trigger frequency: ${JSON.stringify(input.triggerFrequency)}`,
    `Journal themes (excerpts): ${snippets.length ? snippets.join(' | ') : 'None provided'}`,
    `Lowest mood day: ${input.lowestMoodDay ?? 'N/A'}`,
    `Best mood day: ${input.highestMoodDay ?? 'N/A'}`,
  ].join('\n')

  const response = await Promise.race([
    client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM timeout')), 5000)
    ),
  ])

  const text = response.choices[0]?.message?.content?.trim() ?? ''
  if (!text) throw new Error('Empty response from LLM')

  // Hard cap at 120 words per PRD
  const words = text.split(/\s+/)
  return words.length > 120 ? words.slice(0, 120).join(' ') + '…' : text
}
