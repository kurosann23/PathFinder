import { riasecQuestions } from '../data/riasecQuestions.js'

const TYPES = ['R', 'I', 'A', 'S', 'E', 'C']

/**
 * Calculate RIASEC totals + percentages from Yes/No answers.
 * @param {Record<string, number>} answers - Map of questionId -> 0 (No) or 1 (Yes)
 * @param {Array<{id: number|string, type: string}>} questions - Array of questions (optional, defaults to static questions)
 * @returns {{
 *  totals: Record<string, number>,
 *  percentages: Record<string, number>,
 *  topType: string,
 *  code: string
 * }}
 */
export function calculateRiasecScore(answers, questions = null) {
  const totals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  // Use provided questions or fallback to static questions
  const questionsToUse = questions || riasecQuestions

  for (const q of questionsToUse) {
    const value = answers[String(q.id)]
    if (typeof value !== 'number') continue
    // Yes = 1, No = 0, so we just add the value directly
    totals[q.type] += value
    counts[q.type] += 1
  }

  const percentages = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const t of TYPES) {
    // Binary answers: Yes = 1, No = 0
    // Max per type = number of questions of that type (usually 4)
    const max = counts[t] || 4
    percentages[t] = max > 0 ? Math.round((totals[t] / max) * 100) : 0
  }

  const sorted = [...TYPES].sort((a, b) => percentages[b] - percentages[a])
  const topType = sorted[0]
  const code = sorted.slice(0, 3).join('')

  return { totals, percentages, topType, code }
}


