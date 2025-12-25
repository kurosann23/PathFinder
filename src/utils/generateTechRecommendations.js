/**
 * Generate technology-focused recommendations (prototype-level) based on top RIASEC type.
 * Output shape matches the app's Course Recommendation UI.
 *
 * @param {'R'|'I'|'A'|'S'|'E'|'C'} topType
 * @returns {Array<{ subDomain: string, matchPercent: number, explanation: string, suggestedCourses: Array<{ title: string, level: 'Beginner'|'Intermediate'|'Advanced', duration: string, why: string, outcomes: string[] }>, starterProjects: string[], tools: string[] }>}
 */
export function generateTechRecommendations(topType) {
  const base = {
    R: [
      {
        subDomain: 'Networking & Hardware',
        matchPercent: 90,
        explanation:
          'A hands-on profile often benefits from practical infrastructure skills. This track strengthens device setup, network fundamentals, and applied troubleshooting.',
        suggestedCourses: [
          {
            title: 'Computer Networking Fundamentals (OSI, TCP/IP, Subnetting)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Build confidence with the building blocks behind every internet-connected system.',
            outcomes: ['OSI model', 'IP addressing & subnetting', 'Common protocols (HTTP, DNS, DHCP)'],
          },
          {
            title: 'PC Hardware & Operating System Troubleshooting',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Strengthen practical diagnostics for devices and lab setups.',
            outcomes: ['Component identification', 'Basic BIOS/UEFI checks', 'Common failure patterns & fixes'],
          },
          {
            title: 'Network Setup Lab (Routers, Switches, Wi‑Fi, VLAN basics)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Translate theory into hands-on configuration and testing.',
            outcomes: ['Basic router/switch config concepts', 'Wi‑Fi planning', 'Simple segmentation/VLAN idea'],
          },
        ],
        starterProjects: [
          'Build a home-lab network diagram and document your setup (devices, IP plan, Wi‑Fi channels).',
          'Create a troubleshooting checklist for common connectivity issues and test it on 3 scenarios.',
        ],
        tools: ['Packet Tracer (or similar simulator)', 'Wi‑Fi analyzer app', 'Basic networking commands (ping, traceroute)'],
      },
      {
        subDomain: 'IoT & Embedded Systems',
        matchPercent: 84,
        explanation:
          'Realistic interests align with physical computing and implementation. You will practice sensors, microcontrollers, and real-world system integration.',
        suggestedCourses: [
          {
            title: 'Arduino / Microcontroller Basics (Sensors, GPIO, Serial)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Learn how software controls real-world components.',
            outcomes: ['GPIO input/output', 'Reading sensors', 'Serial debugging'],
          },
          {
            title: 'IoT Foundations (MQTT, Device-to-Cloud concepts)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Understand how devices communicate and send data.',
            outcomes: ['MQTT publish/subscribe', 'Data collection patterns', 'Basic security considerations'],
          },
          {
            title: 'Embedded C / Firmware Patterns',
            level: 'Intermediate',
            duration: '3–5 weeks',
            why: 'Strengthen low-level thinking and performance awareness.',
            outcomes: ['Memory basics', 'Interrupt concepts', 'Timing and state machines'],
          },
        ],
        starterProjects: [
          'Build a sensor dashboard: read temperature/humidity and display/log it.',
          'Create a simple “smart alert” device (LED/buzzer) triggered by sensor thresholds.',
        ],
        tools: ['Arduino IDE (or PlatformIO)', 'Breadboard + sensors', 'MQTT broker (local or public)'],
      },
      {
        subDomain: 'Cybersecurity (Operations)',
        matchPercent: 78,
        explanation:
          'Practical learners often adapt well to operational security routines. This area focuses on system hardening, monitoring, and incident response basics.',
        suggestedCourses: [
          {
            title: 'Cybersecurity Basics (Threats, CIA Triad, Common Attacks)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Build the vocabulary and mental model of security work.',
            outcomes: ['CIA triad', 'Common threats', 'Security best practices'],
          },
          {
            title: 'Linux & Windows Hardening Essentials',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Learn practical settings and checks that reduce risk.',
            outcomes: ['User/permission basics', 'Patch hygiene', 'Service minimization'],
          },
          {
            title: 'Log Monitoring & Incident Response Fundamentals',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Turn “security awareness” into repeatable operational workflows.',
            outcomes: ['What to log', 'Basic triage steps', 'Documenting incidents'],
          },
        ],
        starterProjects: [
          'Harden a demo VM and write a “before vs after” checklist of changes.',
          'Create a simple incident playbook for suspicious login attempts.',
        ],
        tools: ['VirtualBox/VMware', 'Basic log viewer', 'Firewall settings'],
      },
    ],
    I: [
      {
        subDomain: 'Software Engineering',
        matchPercent: 90,
        explanation:
          'Investigative profiles align with structured problem-solving and reasoning. This track emphasizes algorithms, system design, and building reliable software.',
        suggestedCourses: [
          {
            title: 'Programming Foundations (Variables → Functions → Data Structures)',
            level: 'Beginner',
            duration: '3–5 weeks',
            why: 'Build a reliable coding base before specializing.',
            outcomes: ['Core syntax fluency', 'Functions and modular code', 'Arrays/objects and control flow'],
          },
          {
            title: 'Data Structures & Algorithms (Big‑O, Lists, Trees, Searching)',
            level: 'Intermediate',
            duration: '4–6 weeks',
            why: 'Strengthen your problem-solving speed and accuracy.',
            outcomes: ['Complexity intuition', 'Common DS/Algo patterns', 'Practice interview-style questions'],
          },
          {
            title: 'System Design Basics (APIs, Databases, Scalability concepts)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Learn how software components fit together in real products.',
            outcomes: ['API design', 'Database choices', 'Caching and scalability basics'],
          },
        ],
        starterProjects: [
          'Build a CRUD app (notes/tasks) with validation and pagination.',
          'Refactor a small project into clean modules with tests for 3 core functions.',
        ],
        tools: ['Git & GitHub', 'VS Code', 'Postman/Insomnia'],
      },
      {
        subDomain: 'Data Science',
        matchPercent: 85,
        explanation:
          'Analytical tendencies support data-driven inquiry. You will develop skills in data preparation, modeling, and evidence-based interpretation.',
        suggestedCourses: [
          {
            title: 'Data Analysis with Python (Pandas + Visualization)',
            level: 'Beginner',
            duration: '3–4 weeks',
            why: 'Learn to clean, transform, and explore real datasets.',
            outcomes: ['Data cleaning', 'Exploratory analysis', 'Charts and storytelling'],
          },
          {
            title: 'Statistics for Data Science (Probability → Inference)',
            level: 'Intermediate',
            duration: '3–5 weeks',
            why: 'Improve decision-making with statistical reasoning.',
            outcomes: ['Distributions', 'Hypothesis testing', 'Confidence intervals'],
          },
          {
            title: 'SQL for Analytics (Joins, Window Functions, KPIs)',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'SQL is the daily tool for analytics and reporting.',
            outcomes: ['Joins & grouping', 'Window functions', 'KPI-style queries'],
          },
        ],
        starterProjects: [
          'Analyze a public dataset and produce a 1‑page insights report with charts.',
          'Create a small KPI dashboard query set (e.g., retention, conversion) in SQL.',
        ],
        tools: ['Jupyter Notebook', 'Pandas', 'SQL editor'],
      },
      {
        subDomain: 'AI / Machine Learning',
        matchPercent: 79,
        explanation:
          'Curiosity and experimentation map well to machine learning. This area focuses on model training, evaluation, and responsible AI foundations.',
        suggestedCourses: [
          {
            title: 'Machine Learning Foundations (Supervised Learning + Metrics)',
            level: 'Intermediate',
            duration: '4–6 weeks',
            why: 'Learn the core workflow of training and evaluating models.',
            outcomes: ['Train/test split', 'Classification vs regression', 'Precision/recall and evaluation'],
          },
          {
            title: 'Practical Model Building with scikit‑learn',
            level: 'Intermediate',
            duration: '3–4 weeks',
            why: 'Turn theory into reproducible pipelines.',
            outcomes: ['Feature preprocessing', 'Pipelines', 'Cross-validation'],
          },
          {
            title: 'Responsible AI (Bias, Data Ethics, Model Limitations)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Avoid common pitfalls and make trustworthy decisions.',
            outcomes: ['Bias awareness', 'Data ethics basics', 'Communicating limitations'],
          },
        ],
        starterProjects: [
          'Build a classifier on a small dataset and explain the evaluation metrics in plain language.',
          'Create a model card: data, assumptions, limitations, and intended use.',
        ],
        tools: ['scikit‑learn', 'Python', 'Notebook environment'],
      },
    ],
    A: [
      {
        subDomain: 'UI/UX Design',
        matchPercent: 90,
        explanation:
          'Artistic profiles often thrive in human-centered creative work. This track develops research, prototyping, and interface design principles.',
        suggestedCourses: [
          {
            title: 'UI Design Fundamentals (Layout, Typography, Color)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Build strong visual foundations for digital products.',
            outcomes: ['Visual hierarchy', 'Spacing systems', 'Accessible color choices'],
          },
          {
            title: 'UX Research & Prototyping (Personas → Wireframes → Testing)',
            level: 'Intermediate',
            duration: '3–5 weeks',
            why: 'Learn to design based on user needs, not guesswork.',
            outcomes: ['User interviews basics', 'Wireframes', 'Usability testing'],
          },
          {
            title: 'Design Systems & Component Thinking',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Create consistent, scalable UI patterns.',
            outcomes: ['Reusable components', 'Design tokens', 'Consistency rules'],
          },
        ],
        starterProjects: [
          'Redesign an existing app screen and justify changes with UX principles.',
          'Create a mini design system (buttons, inputs, spacing, colors) for a project.',
        ],
        tools: ['Figma (or similar)', 'Accessibility checklist', 'Design inspiration board'],
      },
      {
        subDomain: 'Game Development',
        matchPercent: 84,
        explanation:
          'Creative problem solving aligns with interactive experiences. You will explore game engines, gameplay design, and iterative development cycles.',
        suggestedCourses: [
          {
            title: 'Game Dev Basics (Loops, Physics, Input, Collision)',
            level: 'Beginner',
            duration: '3–4 weeks',
            why: 'Learn the core mechanics behind interactive systems.',
            outcomes: ['Game loop', 'Input handling', 'Collision basics'],
          },
          {
            title: '2D Game Project (Scenes, UI, State Management)',
            level: 'Intermediate',
            duration: '4–6 weeks',
            why: 'Ship a playable game to learn production workflow.',
            outcomes: ['Scenes & transitions', 'Menus/UI', 'Saving basic progress'],
          },
          {
            title: 'Game Feel & Iteration (Polish, Feedback, Tuning)',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Make gameplay satisfying through small improvements.',
            outcomes: ['Animation/feedback', 'Difficulty tuning', 'Playtesting basics'],
          },
        ],
        starterProjects: [
          'Build a simple platformer prototype with 3 levels.',
          'Implement a scoring + leaderboard mock (local storage) for a small game.',
        ],
        tools: ['Unity or Godot', 'Sprite editor', 'Audio assets (free libraries)'],
      },
      {
        subDomain: 'Frontend Development',
        matchPercent: 78,
        explanation:
          'Design-oriented interests fit well with UI engineering. This area focuses on responsive layout, components, accessibility, and polished interfaces.',
        suggestedCourses: [
          {
            title: 'HTML/CSS Responsive Foundations',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Build solid layout skills for any frontend stack.',
            outcomes: ['Flexbox/grid', 'Responsive patterns', 'Basic accessibility'],
          },
          {
            title: 'React Fundamentals (Components, State, Effects)',
            level: 'Beginner',
            duration: '3–5 weeks',
            why: 'Learn modern UI development with reusable components.',
            outcomes: ['Component composition', 'State management basics', 'API fetching patterns'],
          },
          {
            title: 'UI Quality (Performance, Accessibility, Design Consistency)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Turn working UIs into professional UIs.',
            outcomes: ['A11y checks', 'Performance basics', 'Design system usage'],
          },
        ],
        starterProjects: [
          'Build a portfolio site with 3 sections and responsive navigation.',
          'Create a component library page (buttons, cards, modals) with consistent styles.',
        ],
        tools: ['React', 'Tailwind CSS', 'Lighthouse (for audits)'],
      },
    ],
    S: [
      {
        subDomain: 'IT Support & Service Management',
        matchPercent: 88,
        explanation:
          'Social profiles often enjoy helping and guiding others. This track builds diagnostic skills, user communication, and service delivery practices.',
        suggestedCourses: [
          {
            title: 'IT Support Basics (Tickets, Troubleshooting, Customer Communication)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Learn how real support teams solve issues efficiently.',
            outcomes: ['Ticket workflow', 'Troubleshooting steps', 'Clear communication'],
          },
          {
            title: 'Service Management Fundamentals (ITIL-style concepts)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Understand how IT services are delivered and improved.',
            outcomes: ['Incidents vs problems', 'SLAs basics', 'Continual improvement'],
          },
          {
            title: 'Knowledge Base Writing (Docs that actually help users)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Strong documentation reduces repeated issues and improves UX.',
            outcomes: ['How-to structure', 'Screenshots and clarity', 'Common pitfalls'],
          },
        ],
        starterProjects: [
          'Write 5 help articles for common issues (Wi‑Fi, password reset, printer, etc.).',
          'Create a troubleshooting decision tree for a frequent problem.',
        ],
        tools: ['Helpdesk-style ticket template', 'Screen capture tool', 'Docs editor'],
      },
      {
        subDomain: 'EdTech & Learning Systems',
        matchPercent: 82,
        explanation:
          'People-oriented motivation aligns with learning-focused technology. You will explore tools and platforms that support teaching and learning outcomes.',
        suggestedCourses: [
          {
            title: 'Learning Design Basics (Objectives, Activities, Assessment)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Understand what makes learning effective before building systems.',
            outcomes: ['Learning objectives', 'Assessment basics', 'Activity design'],
          },
          {
            title: 'Building Simple Learning Apps (Quizzes, Progress Tracking)',
            level: 'Intermediate',
            duration: '3–5 weeks',
            why: 'Create user-friendly learning experiences with feedback loops.',
            outcomes: ['Quiz patterns', 'Progress tracking', 'Feedback design'],
          },
          {
            title: 'Accessibility for Learning Content',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Inclusive learning improves outcomes for more users.',
            outcomes: ['Readable content', 'Captions/alt text', 'Interaction accessibility'],
          },
        ],
        starterProjects: [
          'Build a mini quiz app with explanations for answers and progress stats.',
          'Design a learning module page with clear objectives and practice tasks.',
        ],
        tools: ['React (or similar)', 'Basic analytics thinking', 'Accessibility checklist'],
      },
      {
        subDomain: 'Human-Computer Interaction (HCI)',
        matchPercent: 76,
        explanation:
          'Empathy and communication support user-centered evaluation. This area focuses on usability testing, user research, and interaction design thinking.',
        suggestedCourses: [
          {
            title: 'HCI Fundamentals (Interaction, Cognition, Usability)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Build a framework for understanding user behavior.',
            outcomes: ['Usability heuristics', 'Cognitive load basics', 'Interaction patterns'],
          },
          {
            title: 'Usability Testing (Planning → Running → Reporting)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Learn the most practical user-research method.',
            outcomes: ['Task design', 'Moderation basics', 'Actionable reporting'],
          },
          {
            title: 'UX Metrics & Experiment Basics',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Connect design changes to measurable outcomes.',
            outcomes: ['Success metrics', 'A/B test basics', 'Interpreting results'],
          },
        ],
        starterProjects: [
          'Run a usability test with 3 users on an existing screen and summarize findings.',
          'Create a heuristic evaluation checklist for a chosen app.',
        ],
        tools: ['Survey form', 'Screen recording (with consent)', 'Report template'],
      },
    ],
    E: [
      {
        subDomain: 'Product Management (Tech)',
        matchPercent: 89,
        explanation:
          'Enterprising profiles align with leadership and decision-making. This track develops product thinking, prioritization, and stakeholder management.',
        suggestedCourses: [
          {
            title: 'Product Fundamentals (Problem → Solution → Value)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Learn how to frame problems and define product value.',
            outcomes: ['Problem discovery', 'User needs', 'Value proposition'],
          },
          {
            title: 'Product Strategy & Roadmapping',
            level: 'Intermediate',
            duration: '3–4 weeks',
            why: 'Turn big goals into prioritized plans.',
            outcomes: ['Roadmap basics', 'Prioritization frameworks', 'Stakeholder alignment'],
          },
          {
            title: 'Product Analytics Basics (Funnels, Retention, KPIs)',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Make decisions based on evidence, not guesswork.',
            outcomes: ['KPI definitions', 'Funnels', 'Retention thinking'],
          },
        ],
        starterProjects: [
          'Write a one-page PRD for a small app feature including success metrics.',
          'Create a simple product roadmap for 3 months with priorities.',
        ],
        tools: ['PRD template', 'Roadmap board (Trello/Notion)', 'Basic analytics spreadsheet'],
      },
      {
        subDomain: 'Tech Entrepreneurship',
        matchPercent: 83,
        explanation:
          'Initiative-driven students often enjoy building and pitching solutions. You will explore validation, business models, and go-to-market planning.',
        suggestedCourses: [
          {
            title: 'Startup Basics (Validation, MVP, Business Model)',
            level: 'Beginner',
            duration: '2–4 weeks',
            why: 'Learn how to test ideas before building too much.',
            outcomes: ['Customer interviews', 'MVP thinking', 'Business model basics'],
          },
          {
            title: 'Pitching & Storytelling for Products',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Communicate ideas clearly to get buy-in.',
            outcomes: ['Pitch structure', 'Demo storytelling', 'Handling questions'],
          },
          {
            title: 'Go-to-Market Basics (Channels, Pricing, Growth)',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Understand how products reach and retain users.',
            outcomes: ['Acquisition channels', 'Pricing basics', 'Growth loops'],
          },
        ],
        starterProjects: [
          'Validate an idea with 5 short interviews and summarize insights.',
          'Create a one-slide pitch + 60-second spoken script.',
        ],
        tools: ['Interview script', 'Lean canvas template', 'Pitch deck template'],
      },
      {
        subDomain: 'IT Project Management',
        matchPercent: 77,
        explanation:
          'Leadership tendencies support coordinating delivery. This area focuses on agile planning, risk management, and execution across teams.',
        suggestedCourses: [
          {
            title: 'Project Management Basics (Scope, Timeline, Risk)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Learn how to plan and communicate delivery clearly.',
            outcomes: ['Work breakdown', 'Risk thinking', 'Milestone planning'],
          },
          {
            title: 'Agile & Scrum Foundations',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Understand modern team delivery processes.',
            outcomes: ['Scrum roles', 'Sprints', 'Backlog refinement'],
          },
          {
            title: 'Delivery Execution (Estimation, Reporting, Stakeholders)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Operate confidently in real project environments.',
            outcomes: ['Estimating work', 'Status reporting', 'Managing expectations'],
          },
        ],
        starterProjects: [
          'Create a sprint plan for a small app (tasks, estimates, definition of done).',
          'Write a weekly project status report template and fill it for 2 weeks.',
        ],
        tools: ['Kanban board', 'Gantt-style planner (optional)', 'Meeting notes template'],
      },
    ],
    C: [
      {
        subDomain: 'Information Systems',
        matchPercent: 88,
        explanation:
          'Conventional profiles align with structured systems and organization. This track emphasizes requirements, documentation, and business process alignment.',
        suggestedCourses: [
          {
            title: 'Information Systems Basics (Processes, Requirements, Users)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Learn how technology supports organizational workflows.',
            outcomes: ['Requirements basics', 'Process mapping', 'User vs system needs'],
          },
          {
            title: 'Business Analysis Techniques (User Stories, Use Cases)',
            level: 'Intermediate',
            duration: '2–4 weeks',
            why: 'Turn messy needs into structured deliverables.',
            outcomes: ['User stories', 'Use cases', 'Acceptance criteria'],
          },
          {
            title: 'Documentation & Standards (Specs, SOPs, Traceability)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Detail-oriented documentation improves quality and alignment.',
            outcomes: ['Clear specs', 'SOP writing', 'Traceability thinking'],
          },
        ],
        starterProjects: [
          'Write user stories + acceptance criteria for a small student portal feature.',
          'Create a simple business process flowchart for “course registration”.',
        ],
        tools: ['Diagram tool', 'Requirements template', 'Spreadsheet for traceability'],
      },
      {
        subDomain: 'Database Management',
        matchPercent: 83,
        explanation:
          'Detail-oriented learners often excel with structured data. You will practice data modeling, SQL querying, and integrity-focused design.',
        suggestedCourses: [
          {
            title: 'Relational Database Fundamentals (Tables, Keys, Normalization)',
            level: 'Beginner',
            duration: '2–3 weeks',
            why: 'Understand the structure behind reliable data storage.',
            outcomes: ['Primary/foreign keys', 'Normalization basics', 'Entity relationships'],
          },
          {
            title: 'SQL Mastery (Joins, Aggregations, Index basics)',
            level: 'Intermediate',
            duration: '3–4 weeks',
            why: 'SQL is the core skill for most database roles.',
            outcomes: ['Joins', 'Aggregations', 'Query performance intuition'],
          },
          {
            title: 'Data Integrity & Quality (Constraints, Transactions, Backups)',
            level: 'Intermediate',
            duration: '2–3 weeks',
            why: 'Build trustworthy systems that don’t corrupt data.',
            outcomes: ['Constraints', 'Transactions concept', 'Backup/restore thinking'],
          },
        ],
        starterProjects: [
          'Design a database schema for an app and justify normalization choices.',
          'Write 10 SQL queries that answer typical business questions.',
        ],
        tools: ['PostgreSQL/MySQL (local)', 'DB diagram tool', 'SQL editor'],
      },
      {
        subDomain: 'Quality Assurance (Software Testing)',
        matchPercent: 77,
        explanation:
          'A structured approach supports careful validation and consistency. This area focuses on testing methods, defect tracking, and reliability practices.',
        suggestedCourses: [
          {
            title: 'Testing Fundamentals (Unit vs Integration vs E2E)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Understand where each test type fits and why it matters.',
            outcomes: ['Test pyramid', 'Writing good assertions', 'Test case thinking'],
          },
          {
            title: 'Practical QA Workflow (Bug Reports, Repro Steps, Triage)',
            level: 'Beginner',
            duration: '1–2 weeks',
            why: 'Communicate issues clearly so teams can fix faster.',
            outcomes: ['Bug report quality', 'Reproduction steps', 'Severity vs priority'],
          },
          {
            title: 'Automation Basics (UI + API testing concepts)',
            level: 'Intermediate',
            duration: '3–5 weeks',
            why: 'Scale testing with repeatable checks.',
            outcomes: ['API test patterns', 'UI automation idea', 'CI testing mindset'],
          },
        ],
        starterProjects: [
          'Write a QA test plan for a login + profile update flow.',
          'Create 15 test cases (happy path + edge cases) for a small feature.',
        ],
        tools: ['Issue tracker template', 'Test case spreadsheet', 'Postman/Insomnia'],
      },
    ],
  }

  return base[topType] ?? base.I
}


