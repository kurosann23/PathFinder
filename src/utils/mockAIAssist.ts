export const ENABLE_AI_ASSIST = true;

export const mockAITemplates = {
  R: {
    focusDescription: (courseName: string) =>
      `This course focuses on developing practical and hands-on skills related to ${courseName}.
Students will engage in real-world applications, technical activities, and task-based learning.
The course emphasizes physical involvement, tool usage, and operational understanding commonly required in this field.`,

    learningOutcomes: [
      "Apply practical skills in real-world tasks",
      "Understand basic technical and operational concepts",
      "Use tools and equipment safely",
      "Demonstrate problem-solving through hands-on activities"
    ],

    toolsAndSkills: [
      "Technical tools",
      "Hands-on skills",
      "Equipment handling",
      "Safety awareness"
    ],

    exampleJobRoles: [
      "Technical Assistant",
      "Maintenance Support Staff",
      "Skilled Worker"
    ]
  },

  I: {
    focusDescription: (courseName: string) =>
      `This course emphasizes analytical thinking and problem-solving skills related to ${courseName}.
Students will explore concepts through investigation, analysis, and logical reasoning.
The course supports learning through research-oriented and knowledge-based activities.`,

    learningOutcomes: [
      "Analyze information and data logically",
      "Apply critical thinking to solve problems",
      "Understand foundational theoretical concepts",
      "Interpret findings and conclusions"
    ],

    toolsAndSkills: [
      "Analytical thinking",
      "Research skills",
      "Data interpretation",
      "Logical reasoning"
    ],

    exampleJobRoles: [
      "Research Assistant",
      "Data Analyst (Junior)",
      "Technical Analyst"
    ]
  },

  A: {
    focusDescription: (courseName: string) =>
      `This course focuses on creative expression and idea development related to ${courseName}.
Students will explore design concepts, creative processes, and expressive techniques.
The course encourages originality, imagination, and visual or artistic communication.`,

    learningOutcomes: [
      "Apply creative thinking in project development",
      "Understand basic design or artistic principles",
      "Produce creative or expressive work",
      "Communicate ideas visually or creatively"
    ],

    toolsAndSkills: [
      "Creative software",
      "Design thinking",
      "Visual communication",
      "Creative problem-solving"
    ],

    exampleJobRoles: [
      "Junior Creative Executive",
      "Assistant Designer",
      "Creative Support Role"
    ]
  },

  S: {
    focusDescription: (courseName: string) =>
      `This course emphasizes interpersonal skills and human-centered learning related to ${courseName}.
Students will develop communication abilities, empathy, and teamwork skills.
The course prepares learners for roles involving guidance, support, and collaboration.`,

    learningOutcomes: [
      "Demonstrate effective communication skills",
      "Apply interpersonal and teamwork skills",
      "Understand basic human behavior concepts",
      "Provide support in social or educational contexts"
    ],

    toolsAndSkills: [
      "Communication skills",
      "Empathy",
      "Teamwork",
      "Interpersonal interaction"
    ],

    exampleJobRoles: [
      "Support Officer",
      "Teaching Assistant",
      "Community Support Staff"
    ]
  },

  E: {
    focusDescription: (courseName: string) =>
      `This course focuses on leadership, initiative, and decision-making related to ${courseName}.
Students will explore basic business concepts, organizational skills, and persuasive communication.
The course supports the development of confidence and entrepreneurial thinking.`,

    learningOutcomes: [
      "Apply leadership and decision-making skills",
      "Understand basic business or organizational concepts",
      "Communicate ideas persuasively",
      "Demonstrate initiative in task management"
    ],

    toolsAndSkills: [
      "Leadership skills",
      "Communication skills",
      "Basic business knowledge",
      "Decision-making"
    ],

    exampleJobRoles: [
      "Business Executive (Junior)",
      "Sales Executive",
      "Management Trainee"
    ]
  },

  C: {
    focusDescription: (courseName: string) =>
      `This course emphasizes organization, accuracy, and structured work related to ${courseName}.
Students will develop skills in data handling, documentation, and systematic processes.
The course supports detail-oriented and administrative competencies.`,

    learningOutcomes: [
      "Organize information systematically",
      "Apply accuracy in data handling",
      "Follow structured procedures",
      "Use administrative tools effectively"
    ],

    toolsAndSkills: [
      "Documentation skills",
      "Data organization",
      "Administrative tools",
      "Attention to detail"
    ],

    exampleJobRoles: [
      "Administrative Assistant",
      "Data Entry Executive",
      "Office Support Staff"
    ]
  }
};

export function generateMockAIContent(
  courseName: string,
  riasec: "R" | "I" | "A" | "S" | "E" | "C"
) {
  const template = mockAITemplates[riasec];

  return {
    focusDescription: template.focusDescription(courseName),
    learningOutcomes: template.learningOutcomes,
    toolsAndSkills: template.toolsAndSkills,
    exampleJobRoles: template.exampleJobRoles
  };
}
