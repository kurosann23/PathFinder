import { riasecQuestions } from '../data/riasecQuestions.js'

const TYPES = ['R', 'I', 'A', 'S', 'E', 'C']

/**
 * Calculate RIASEC totals + percentages from Likert answers.
 * @param {Record<string, number>} answers - Map of questionId -> 1..5
 * @returns {{
 *  totals: Record<string, number>,
 *  percentages: Record<string, number>,
 *  topType: string,
 *  code: string
 * }}
 */
export function calculateRiasecScore(answers) {
  const totals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const q of riasecQuestions) {
    const value = answers[q.id]
    if (typeof value !== 'number') continue
    totals[q.type] += value
    counts[q.type] += 1
  }

  const percentages = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const t of TYPES) {
    // 4 questions per type, Likert 1..5 => max 20 per type.
    const max = (counts[t] || 4) * 5
    percentages[t] = Math.round((totals[t] / max) * 100)
  }

  const sorted = [...TYPES].sort((a, b) => percentages[b] - percentages[a])
  const topType = sorted[0]
  const code = sorted.slice(0, 3).join('')

  return { totals, percentages, topType, code }
}


