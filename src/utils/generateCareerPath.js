import { careerPaths } from '../data/careerPaths.js'
import { getCareerPathExplanation } from './getCareerPathExplanation.js'

const VALID = /** @type {const} */ (['R', 'I', 'A', 'S', 'E', 'C'])

/**
 * Normalize and validate an array of top RIASEC types.
 * @param {unknown} topRiasecTypes
 * @returns {Array<'R'|'I'|'A'|'S'|'E'|'C'>}
 */
function normalizeTopTypes(topRiasecTypes) {
  if (!Array.isArray(topRiasecTypes)) return []
  /** @type {Array<'R'|'I'|'A'|'S'|'E'|'C'>} */
  const out = []

  for (const raw of topRiasecTypes) {
    const t = String(raw || '').toUpperCase()
    if (!VALID.includes(/** @type {any} */ (t))) continue
    if (out.includes(/** @type {any} */ (t))) continue
    out.push(/** @type {any} */ (t))
  }
  return out
}

/**
 * Pure function: generate a technology career/learning path from top RIASEC types.
 *
 * Input example: ["I", "C", "R"]
 * Output:
 * - primaryPath: the best-match path (top type)
 * - supportingPaths: 0–2 complementary paths (next types)
 * - rationale: student-friendly "why" explanation
 *
 * @param {Array<'R'|'I'|'A'|'S'|'E'|'C'>} topRiasecTypes
 * @returns {{
 *   topTypes: Array<'R'|'I'|'A'|'S'|'E'|'C'>,
 *   primaryPath: import('../data/careerPaths.js').careerPaths['R'],
 *   supportingPaths: Array<import('../data/careerPaths.js').careerPaths['R']>,
 *   rationale: {
 *     summary: string,
 *     primaryWhy: string,
 *     supportingWhy: string[]
 *   }
 * }}
 */
export function generateCareerPath(topRiasecTypes) {
  const topTypes = normalizeTopTypes(topRiasecTypes)

  const primaryType = topTypes[0] ?? 'I'
  const supportTypes = topTypes.slice(1, 3)

  const primaryPath = careerPaths[primaryType] ?? careerPaths.I
  const supportingPaths = supportTypes
    .map((t) => careerPaths[t])
    .filter(Boolean)

  const primaryWhy = getCareerPathExplanation(primaryPath.riasec)
  const supportingWhy = supportingPaths.map((p) => getCareerPathExplanation(p.riasec))

  const summaryParts = [
    `Your primary direction is the ${primaryPath.title} because your strongest interest is "${primaryPath.riasec}".`,
  ]

  if (supportingPaths.length > 0) {
    summaryParts.push(
      `Your supporting interests (${supportingPaths.map((p) => p.riasec).join(', ')}) can shape how you learn and what roles you may prefer within technology.`,
    )
  } else {
    summaryParts.push(
      'You can refine your direction further by exploring small projects and noticing what you enjoy most.',
    )
  }

  return {
    topTypes,
    primaryPath,
    supportingPaths,
    rationale: {
      summary: summaryParts.join(' '),
      primaryWhy,
      supportingWhy,
    },
  }
}


