/**
 * Student-friendly explanation text for why a RIASEC type fits a technology path.
 * This is designed to be:
 * - simple and explainable (FYP documentation friendly)
 * - guidance-oriented (not a syllabus)
 */

/**
 * @param {'R'|'I'|'A'|'S'|'E'|'C'} riasecType
 * @returns {string}
 */
export function getCareerPathExplanation(riasecType) {
  const t = String(riasecType || '').toUpperCase()

  switch (t) {
    case 'R':
      return (
        'You tend to learn best by doing practical tasks. In technology, this often matches pathways where you set up, fix, and improve real systems (devices, networks, and technical environments).'
      )
    case 'I':
      return (
        'You enjoy investigating problems and understanding how things work. In technology, this matches pathways focused on programming, data, and building solutions through analysis and logical reasoning.'
      )
    case 'A':
      return (
        'You enjoy creativity and exploring new ideas. In technology, this matches pathways where you design experiences, build interfaces, and create digital products that look good and feel good to use.'
      )
    case 'S':
      return (
        'You are people-oriented and like helping others. In technology, this matches pathways that focus on understanding users, supporting them, and turning human needs into useful tech solutions.'
      )
    case 'E':
      return (
        'You like leading, influencing, and taking initiative. In technology, this matches pathways where you guide direction, coordinate delivery, and connect business goals with technical execution.'
      )
    case 'C':
      return (
        'You prefer structure and organized systems. In technology, this matches pathways involving data, documentation, quality checks, and process-driven work where accuracy and consistency matter.'
      )
    default:
      return (
        'Your profile suggests a mix of interests. Technology pathways can be flexible—start with a direction that feels most natural, then refine it as you explore projects and roles.'
      )
  }
}


