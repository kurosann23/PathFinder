const DESCRIPTIONS = {
  R: {
    title: 'Realistic (R)',
    text: 'You prefer practical, hands-on work and enjoy learning through real-world tasks. You often value technical skills, tools, and building or fixing systems. In a technology pathway, you may thrive in domains that involve hardware, networking, and implementation-focused problem solving.',
  },
  I: {
    title: 'Investigative (I)',
    text: 'You are curious, analytical, and motivated by understanding how things work. You tend to enjoy complex problems, data, and experimentation. In a technology pathway, you may thrive in software engineering, data science, and research-oriented computing tasks.',
  },
  A: {
    title: 'Artistic (A)',
    text: 'You prefer creative expression and open-ended tasks where design and originality matter. You often enjoy exploring different possibilities and producing polished outcomes. In a technology pathway, you may thrive in UI/UX, game development, and creative digital production.',
  },
  S: {
    title: 'Social (S)',
    text: 'You are people-oriented and gain satisfaction from helping, teaching, and collaborating. You often value communication and empathy in problem solving. In a technology pathway, you may thrive in user support, EdTech, and roles that connect technology with human needs.',
  },
  E: {
    title: 'Enterprising (E)',
    text: 'You prefer leading, initiating, and influencing outcomes. You often enjoy planning, persuading, and taking responsibility for decisions. In a technology pathway, you may thrive in product management, tech entrepreneurship, and leadership-focused roles.',
  },
  C: {
    title: 'Conventional (C)',
    text: 'You prefer structure, organization, and working with details and systems. You often value accuracy, consistency, and clear procedures. In a technology pathway, you may thrive in information systems, database management, and documentation-driven work.',
  },
}

/**
 * Return a short academic-style personality description for the top RIASEC type.
 * @param {'R'|'I'|'A'|'S'|'E'|'C'} topType
 * @returns {{ title: string, text: string }}
 */
export function getRiasecDescription(topType) {
  return DESCRIPTIONS[topType] ?? DESCRIPTIONS.I
}


