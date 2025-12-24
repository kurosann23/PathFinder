/**
 * Generate technology-focused recommendations (prototype-level) based on top RIASEC type.
 * Output shape matches the app's Course Recommendation UI.
 *
 * @param {'R'|'I'|'A'|'S'|'E'|'C'} topType
 * @returns {Array<{ subDomain: string, matchPercent: number, explanation: string }>}
 */
export function generateTechRecommendations(topType) {
  const base = {
    R: [
      {
        subDomain: 'Networking & Hardware',
        matchPercent: 90,
        explanation:
          'A hands-on profile often benefits from practical infrastructure skills. This track strengthens device setup, network fundamentals, and applied troubleshooting.',
      },
      {
        subDomain: 'IoT & Embedded Systems',
        matchPercent: 84,
        explanation:
          'Realistic interests align with physical computing and implementation. You will practice sensors, microcontrollers, and real-world system integration.',
      },
      {
        subDomain: 'Cybersecurity (Operations)',
        matchPercent: 78,
        explanation:
          'Practical learners often adapt well to operational security routines. This area focuses on system hardening, monitoring, and incident response basics.',
      },
    ],
    I: [
      {
        subDomain: 'Software Engineering',
        matchPercent: 90,
        explanation:
          'Investigative profiles align with structured problem-solving and reasoning. This track emphasizes algorithms, system design, and building reliable software.',
      },
      {
        subDomain: 'Data Science',
        matchPercent: 85,
        explanation:
          'Analytical tendencies support data-driven inquiry. You will develop skills in data preparation, modeling, and evidence-based interpretation.',
      },
      {
        subDomain: 'AI / Machine Learning',
        matchPercent: 79,
        explanation:
          'Curiosity and experimentation map well to machine learning. This area focuses on model training, evaluation, and responsible AI foundations.',
      },
    ],
    A: [
      {
        subDomain: 'UI/UX Design',
        matchPercent: 90,
        explanation:
          'Artistic profiles often thrive in human-centered creative work. This track develops research, prototyping, and interface design principles.',
      },
      {
        subDomain: 'Game Development',
        matchPercent: 84,
        explanation:
          'Creative problem solving aligns with interactive experiences. You will explore game engines, gameplay design, and iterative development cycles.',
      },
      {
        subDomain: 'Frontend Development',
        matchPercent: 78,
        explanation:
          'Design-oriented interests fit well with UI engineering. This area focuses on responsive layout, components, accessibility, and polished interfaces.',
      },
    ],
    S: [
      {
        subDomain: 'IT Support & Service Management',
        matchPercent: 88,
        explanation:
          'Social profiles often enjoy helping and guiding others. This track builds diagnostic skills, user communication, and service delivery practices.',
      },
      {
        subDomain: 'EdTech & Learning Systems',
        matchPercent: 82,
        explanation:
          'People-oriented motivation aligns with learning-focused technology. You will explore tools and platforms that support teaching and learning outcomes.',
      },
      {
        subDomain: 'Human-Computer Interaction (HCI)',
        matchPercent: 76,
        explanation:
          'Empathy and communication support user-centered evaluation. This area focuses on usability testing, user research, and interaction design thinking.',
      },
    ],
    E: [
      {
        subDomain: 'Product Management (Tech)',
        matchPercent: 89,
        explanation:
          'Enterprising profiles align with leadership and decision-making. This track develops product thinking, prioritization, and stakeholder management.',
      },
      {
        subDomain: 'Tech Entrepreneurship',
        matchPercent: 83,
        explanation:
          'Initiative-driven students often enjoy building and pitching solutions. You will explore validation, business models, and go-to-market planning.',
      },
      {
        subDomain: 'IT Project Management',
        matchPercent: 77,
        explanation:
          'Leadership tendencies support coordinating delivery. This area focuses on agile planning, risk management, and execution across teams.',
      },
    ],
    C: [
      {
        subDomain: 'Information Systems',
        matchPercent: 88,
        explanation:
          'Conventional profiles align with structured systems and organization. This track emphasizes requirements, documentation, and business process alignment.',
      },
      {
        subDomain: 'Database Management',
        matchPercent: 83,
        explanation:
          'Detail-oriented learners often excel with structured data. You will practice data modeling, SQL querying, and integrity-focused design.',
      },
      {
        subDomain: 'Quality Assurance (Software Testing)',
        matchPercent: 77,
        explanation:
          'A structured approach supports careful validation and consistency. This area focuses on testing methods, defect tracking, and reliability practices.',
      },
    ],
  }

  return base[topType] ?? base.I
}


