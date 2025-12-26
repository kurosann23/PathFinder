/**
 * Technology-only career paths (conceptual guidance).
 * This is NOT an LMS: no syllabus, modules, assessments, or weekly plans.
 *
 * Expandable design:
 * - Later you can add a `field` dimension (e.g., Technology, Business, Health)
 * - Or add more detailed `subPaths` per path without changing the generator API
 */

/**
 * @typedef {'R'|'I'|'A'|'S'|'E'|'C'} RiasecType
 *
 * @typedef {Object} CareerPath
 * @property {RiasecType} riasec
 * @property {string} title
 * @property {string} description
 * @property {string[]} learningFocus
 * @property {string[]} possibleRoles
 */

/** @type {Record<RiasecType, CareerPath>} */
export const careerPaths = {
  R: {
    riasec: 'R',
    title: 'Hands‑On Technology Path',
    description:
      'You prefer practical work and learning by doing. You may enjoy building, configuring, fixing, and improving real systems.',
    learningFocus: [
      'Hardware and device fundamentals',
      'Networking basics and troubleshooting',
      'System setup, configuration, and maintenance',
      'Practical cybersecurity habits (hardening and monitoring)',
    ],
    possibleRoles: [
      'IT Support Specialist',
      'Network Technician',
      'Systems Technician',
      'Cybersecurity Operations Assistant',
      'IoT / Hardware Support Technician',
    ],
  },

  I: {
    riasec: 'I',
    title: 'Analytical Technology Path',
    description:
      'You like investigating how things work and solving complex problems. You may enjoy programming, data, and structured reasoning.',
    learningFocus: [
      'Programming fundamentals and problem solving',
      'Algorithms and logical thinking',
      'Data handling and analysis mindset',
      'Building and evaluating technical solutions',
    ],
    possibleRoles: [
      'Software Developer (Junior)',
      'Data Analyst (Junior)',
      'Backend / API Developer',
      'AI / ML Assistant (Entry)',
      'QA Automation (Junior)',
    ],
  },

  A: {
    riasec: 'A',
    title: 'Creative Technology Path',
    description:
      'You enjoy creativity and exploring different ideas. You may like designing user experiences and creating digital products people interact with.',
    learningFocus: [
      'UI/UX thinking and visual design basics',
      'Frontend interface building',
      'Prototyping and iteration',
      'Creative problem solving for user needs',
    ],
    possibleRoles: [
      'UI/UX Designer (Junior)',
      'Frontend Developer (Junior)',
      'Web Designer',
      'Game / Interactive Media Developer (Entry)',
      'Product Design Assistant',
    ],
  },

  S: {
    riasec: 'S',
    title: 'People‑Centred Technology Path',
    description:
      'You enjoy helping others and communicating clearly. You may thrive in roles that connect technology with real user needs and support.',
    learningFocus: [
      'User support and communication skills',
      'Understanding user problems and translating them into solutions',
      'Basic system usage and troubleshooting workflows',
      'Documentation and knowledge sharing',
    ],
    possibleRoles: [
      'IT Support / Helpdesk',
      'Customer Success (Tech)',
      'Technical Support Engineer (Entry)',
      'EdTech Support / Coordinator',
      'UX Research Assistant',
    ],
  },

  E: {
    riasec: 'E',
    title: 'Leadership & Product Technology Path',
    description:
      'You enjoy leading, initiating, and influencing outcomes. You may prefer roles that plan, coordinate, and shape technology direction.',
    learningFocus: [
      'Product thinking (problem → solution → value)',
      'Communication and stakeholder alignment',
      'Project planning and prioritization',
      'Basic tech literacy to work with developers effectively',
    ],
    possibleRoles: [
      'Product Management Associate',
      'Project Coordinator (Tech)',
      'Business Analyst (Entry)',
      'Tech Startup / Entrepreneurship Track',
      'Scrum / Agile Coordinator (Entry)',
    ],
  },

  C: {
    riasec: 'C',
    title: 'Structured Systems Technology Path',
    description:
      'You prefer structure, organization, and clear processes. You may enjoy working with systems, data, and quality-focused workflows.',
    learningFocus: [
      'Data organization and information systems thinking',
      'Database fundamentals and careful documentation',
      'Process improvement and consistency',
      'Software testing mindset (finding issues systematically)',
    ],
    possibleRoles: [
      'Database Assistant / Junior DBA (Entry)',
      'QA Tester / QA Analyst (Entry)',
      'Systems / Operations Coordinator (Tech)',
      'Information Systems Assistant',
      'Technical Documentation Assistant',
    ],
  },
}


