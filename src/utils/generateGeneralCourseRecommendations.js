/**
 * Generate general course recommendations (all fields) based on RIASEC type.
 * Focus: Courses are PRIMARY, job roles are SECONDARY (examples only).
 * 
 * @param {'R'|'I'|'A'|'S'|'E'|'C'} topType
 * @returns {Array<{
 *   courseName: string,
 *   focusDescription: string,
 *   whatYouLearn: string[],
 *   toolsAndSkills: string[],
 *   exampleJobRoles: Array<{ title: string, description: string }>
 * }>}
 */
export function generateGeneralCourseRecommendations(topType) {
  const courses = {
    R: [
      {
        courseName: 'Engineering & Technical Skills',
        focusDescription: 'This course focuses on practical problem-solving through hands-on application of technical principles. Students learn to build, maintain, and troubleshoot physical systems and equipment.',
        whatYouLearn: [
          'Technical drawing and blueprint reading',
          'Equipment operation and maintenance procedures',
          'Safety protocols and quality control standards',
          'Basic mechanical and electrical principles',
          'Project planning and resource management',
        ],
        toolsAndSkills: [
          'CAD software (AutoCAD, SolidWorks)',
          'Measurement tools (calipers, multimeters)',
          'Hand tools and power equipment',
          'Technical documentation',
          'Problem-solving methodologies',
        ],
        exampleJobRoles: [
          {
            title: 'Engineering Technician',
            description: 'Assist engineers in designing, testing, and maintaining technical systems and equipment.',
          },
          {
            title: 'Maintenance Specialist',
            description: 'Perform routine maintenance and repairs on machinery, equipment, or facilities.',
          },
          {
            title: 'Quality Control Inspector',
            description: 'Examine products and processes to ensure they meet technical standards and specifications.',
          },
        ],
      },
      {
        courseName: 'Construction & Building Technology',
        focusDescription: 'This course covers the fundamentals of construction methods, materials, and project management. Students gain practical experience in building techniques and site operations.',
        whatYouLearn: [
          'Construction materials and their properties',
          'Building codes and regulations',
          'Construction methods and techniques',
          'Site safety and risk management',
          'Project coordination and scheduling',
        ],
        toolsAndSkills: [
          'Construction tools and equipment',
          'Building Information Modeling (BIM)',
          'Surveying instruments',
          'Project management software',
          'Blueprint interpretation',
        ],
        exampleJobRoles: [
          {
            title: 'Construction Supervisor',
            description: 'Oversee construction projects, coordinate workers, and ensure projects meet quality and safety standards.',
          },
          {
            title: 'Building Inspector',
            description: 'Examine construction sites and completed structures to verify compliance with building codes.',
          },
        ],
      },
      {
        courseName: 'Automotive Technology',
        focusDescription: 'This course provides comprehensive training in vehicle systems, diagnostics, and repair. Students learn to service and maintain various types of vehicles using modern diagnostic tools.',
        whatYouLearn: [
          'Engine systems and components',
          'Electrical and electronic systems',
          'Diagnostic procedures and troubleshooting',
          'Preventive maintenance schedules',
          'Customer service and communication',
        ],
        toolsAndSkills: [
          'Diagnostic scanners and equipment',
          'Hand tools and specialized equipment',
          'Service manuals and technical resources',
          'Computer-based diagnostic software',
          'Safety equipment and procedures',
        ],
        exampleJobRoles: [
          {
            title: 'Automotive Technician',
            description: 'Diagnose, repair, and maintain vehicles using technical knowledge and diagnostic equipment.',
          },
          {
            title: 'Service Advisor',
            description: 'Communicate with customers about vehicle issues and coordinate service work with technicians.',
          },
        ],
      },
    ],
    I: [
      {
        courseName: 'Data Science & Analytics',
        focusDescription: 'This course focuses on analyzing data to discover patterns and insights. Students learn statistical methods, programming, and visualization techniques to solve complex problems.',
        whatYouLearn: [
          'Statistical analysis and hypothesis testing',
          'Data collection and cleaning methods',
          'Programming for data analysis (Python, R)',
          'Data visualization and reporting',
          'Machine learning fundamentals',
        ],
        toolsAndSkills: [
          'Python, R, SQL',
          'Data visualization tools (Tableau, Power BI)',
          'Statistical software (SPSS, SAS)',
          'Jupyter Notebooks',
          'Database management systems',
        ],
        exampleJobRoles: [
          {
            title: 'Data Analyst',
            description: 'Collect, process, and analyze data to help organizations make informed decisions.',
          },
          {
            title: 'Research Assistant',
            description: 'Support research projects by collecting data, conducting analyses, and preparing reports.',
          },
          {
            title: 'Business Intelligence Analyst',
            description: 'Transform data into actionable insights for business strategy and decision-making.',
          },
        ],
      },
      {
        courseName: 'Computer Science & Programming',
        focusDescription: 'This course covers fundamental programming concepts, algorithms, and software development practices. Students learn to design and build software solutions through logical problem-solving.',
        whatYouLearn: [
          'Programming fundamentals and best practices',
          'Data structures and algorithms',
          'Software development lifecycle',
          'Debugging and testing methodologies',
          'Version control and collaboration tools',
        ],
        toolsAndSkills: [
          'Programming languages (Python, Java, JavaScript)',
          'Integrated Development Environments (IDEs)',
          'Git and version control',
          'Database systems',
          'Software testing frameworks',
        ],
        exampleJobRoles: [
          {
            title: 'Software Developer',
            description: 'Design, develop, and maintain software applications to solve specific problems or meet user needs.',
          },
          {
            title: 'Systems Analyst',
            description: 'Analyze business requirements and design technical solutions to improve organizational efficiency.',
          },
        ],
      },
      {
        courseName: 'Research Methods & Scientific Inquiry',
        focusDescription: 'This course teaches systematic approaches to investigating questions and solving problems. Students learn research design, data collection, and critical analysis techniques.',
        whatYouLearn: [
          'Research design and methodology',
          'Literature review and information gathering',
          'Experimental design and controls',
          'Data collection and analysis techniques',
          'Scientific writing and presentation',
        ],
        toolsAndSkills: [
          'Research databases and academic resources',
          'Statistical analysis software',
          'Survey and data collection tools',
          'Citation management software',
          'Critical thinking frameworks',
        ],
        exampleJobRoles: [
          {
            title: 'Research Coordinator',
            description: 'Plan and coordinate research projects, manage data collection, and assist with analysis and reporting.',
          },
          {
            title: 'Laboratory Technician',
            description: 'Conduct experiments, collect data, and maintain laboratory equipment following scientific protocols.',
          },
        ],
      },
    ],
    A: [
      {
        courseName: 'Graphic Design & Visual Communication',
        focusDescription: 'This course explores visual design principles, typography, and digital media creation. Students learn to communicate ideas effectively through visual elements and design thinking.',
        whatYouLearn: [
          'Design principles and composition',
          'Typography and layout design',
          'Digital imaging and photo editing',
          'Brand identity and visual systems',
          'Design software proficiency',
        ],
        toolsAndSkills: [
          'Adobe Creative Suite (Photoshop, Illustrator, InDesign)',
          'Figma or Sketch',
          'Digital drawing tablets',
          'Color theory and palette tools',
          'Prototyping software',
        ],
        exampleJobRoles: [
          {
            title: 'Graphic Designer',
            description: 'Create visual concepts and designs for print, digital media, and branding projects.',
          },
          {
            title: 'UI/UX Designer',
            description: 'Design user interfaces and experiences for digital products, focusing on usability and aesthetics.',
          },
          {
            title: 'Creative Director',
            description: 'Lead creative projects and guide the visual direction of campaigns or brand initiatives.',
          },
        ],
      },
      {
        courseName: 'Media Production & Digital Arts',
        focusDescription: 'This course covers video production, audio editing, and multimedia content creation. Students learn to produce engaging content using various media formats and storytelling techniques.',
        whatYouLearn: [
          'Video production and editing',
          'Audio recording and mixing',
          'Storytelling and narrative structure',
          'Post-production techniques',
          'Content planning and project management',
        ],
        toolsAndSkills: [
          'Video editing software (Premiere Pro, Final Cut Pro)',
          'Audio editing tools (Audacity, Pro Tools)',
          'Camera and lighting equipment',
          'Motion graphics software (After Effects)',
          'Content management systems',
        ],
        exampleJobRoles: [
          {
            title: 'Video Producer',
            description: 'Plan, shoot, and edit video content for various platforms and purposes.',
          },
          {
            title: 'Multimedia Specialist',
            description: 'Create and manage digital content combining text, graphics, audio, and video elements.',
          },
        ],
      },
      {
        courseName: 'Creative Writing & Communication',
        focusDescription: 'This course develops writing skills across various genres and formats. Students learn to craft compelling narratives, develop their voice, and communicate ideas creatively.',
        whatYouLearn: [
          'Creative writing techniques and styles',
          'Story structure and character development',
          'Editing and revision processes',
          'Writing for different audiences and purposes',
          'Publishing and self-promotion basics',
        ],
        toolsAndSkills: [
          'Writing software and word processors',
          'Research and fact-checking tools',
          'Editing and proofreading techniques',
          'Social media and content platforms',
          'Portfolio development',
        ],
        exampleJobRoles: [
          {
            title: 'Content Writer',
            description: 'Create written content for websites, blogs, marketing materials, and social media.',
          },
          {
            title: 'Copywriter',
            description: 'Write persuasive and engaging copy for advertising, marketing campaigns, and promotional materials.',
          },
        ],
      },
    ],
    S: [
      {
        courseName: 'Education & Teaching Methods',
        focusDescription: 'This course prepares students to teach and support learning in various settings. Students learn instructional design, classroom management, and methods for engaging diverse learners.',
        whatYouLearn: [
          'Learning theories and pedagogical approaches',
          'Curriculum design and lesson planning',
          'Classroom management strategies',
          'Assessment and evaluation methods',
          'Differentiated instruction techniques',
        ],
        toolsAndSkills: [
          'Learning management systems',
          'Educational technology tools',
          'Assessment and grading software',
          'Presentation and multimedia tools',
          'Communication platforms',
        ],
        exampleJobRoles: [
          {
            title: 'Teacher',
            description: 'Plan and deliver instruction, assess student progress, and support learning in educational settings.',
          },
          {
            title: 'Educational Coordinator',
            description: 'Develop educational programs, coordinate activities, and support teachers and students.',
          },
          {
            title: 'Training Specialist',
            description: 'Design and deliver training programs for employees or adult learners in various organizations.',
          },
        ],
      },
      {
        courseName: 'Counseling & Human Services',
        focusDescription: 'This course covers principles of helping others through counseling, support services, and intervention strategies. Students learn communication skills, ethical practices, and client assessment techniques.',
        whatYouLearn: [
          'Counseling theories and approaches',
          'Active listening and communication skills',
          'Crisis intervention and support strategies',
          'Ethical guidelines and professional boundaries',
          'Case management and documentation',
        ],
        toolsAndSkills: [
          'Counseling techniques and frameworks',
          'Case management software',
          'Assessment tools and questionnaires',
          'Documentation and record-keeping systems',
          'Referral and resource networks',
        ],
        exampleJobRoles: [
          {
            title: 'Counselor',
            description: 'Provide guidance and support to individuals or groups facing personal, social, or career challenges.',
          },
          {
            title: 'Social Services Coordinator',
            description: 'Connect individuals and families with community resources and support services.',
          },
        ],
      },
      {
        courseName: 'Healthcare Support & Patient Care',
        focusDescription: 'This course provides training in patient care, medical procedures, and healthcare communication. Students learn to assist healthcare professionals while providing compassionate support to patients.',
        whatYouLearn: [
          'Basic patient care procedures',
          'Medical terminology and documentation',
          'Infection control and safety protocols',
          'Patient communication and empathy',
          'Healthcare systems and procedures',
        ],
        toolsAndSkills: [
          'Medical equipment and instruments',
          'Electronic health records systems',
          'Vital signs monitoring equipment',
          'Medical terminology resources',
          'Communication and documentation tools',
        ],
        exampleJobRoles: [
          {
            title: 'Healthcare Assistant',
            description: 'Support healthcare professionals by assisting with patient care, procedures, and administrative tasks.',
          },
          {
            title: 'Patient Care Coordinator',
            description: 'Help patients navigate healthcare systems, schedule appointments, and coordinate care services.',
          },
        ],
      },
    ],
    E: [
      {
        courseName: 'Business Management & Leadership',
        focusDescription: 'This course covers fundamental business principles, leadership strategies, and organizational management. Students learn to plan, organize, and lead teams toward achieving business objectives.',
        whatYouLearn: [
          'Business planning and strategy development',
          'Leadership and team management',
          'Financial management basics',
          'Marketing and sales principles',
          'Operations and process improvement',
        ],
        toolsAndSkills: [
          'Project management software',
          'Financial analysis tools',
          'CRM systems',
          'Presentation and communication tools',
          'Business analytics platforms',
        ],
        exampleJobRoles: [
          {
            title: 'Business Manager',
            description: 'Oversee daily operations, manage teams, and ensure organizational goals are met efficiently.',
          },
          {
            title: 'Sales Manager',
            description: 'Lead sales teams, develop strategies, and build relationships with clients to drive revenue.',
          },
          {
            title: 'Operations Coordinator',
            description: 'Coordinate business processes, manage resources, and improve operational efficiency.',
          },
        ],
      },
      {
        courseName: 'Entrepreneurship & Innovation',
        focusDescription: 'This course teaches how to identify opportunities, develop business ideas, and launch new ventures. Students learn entrepreneurial thinking, business model development, and startup fundamentals.',
        whatYouLearn: [
          'Opportunity identification and evaluation',
          'Business model design and validation',
          'Market research and competitive analysis',
          'Funding and financial planning',
          'Pitching and presentation skills',
        ],
        toolsAndSkills: [
          'Business planning tools',
          'Market research platforms',
          'Financial modeling software',
          'Presentation and pitch tools',
          'Networking and collaboration platforms',
        ],
        exampleJobRoles: [
          {
            title: 'Entrepreneur',
            description: 'Start and manage new business ventures, taking on financial risks in pursuit of innovation.',
          },
          {
            title: 'Business Development Specialist',
            description: 'Identify growth opportunities, build partnerships, and develop strategies to expand business.',
          },
        ],
      },
      {
        courseName: 'Marketing & Communications',
        focusDescription: 'This course covers marketing strategies, brand management, and communication techniques. Students learn to reach and engage target audiences through various marketing channels and campaigns.',
        whatYouLearn: [
          'Marketing principles and strategies',
          'Brand development and positioning',
          'Digital marketing and social media',
          'Consumer behavior and market research',
          'Campaign planning and execution',
        ],
        toolsAndSkills: [
          'Marketing analytics tools',
          'Social media management platforms',
          'Content creation tools',
          'Email marketing software',
          'SEO and web analytics',
        ],
        exampleJobRoles: [
          {
            title: 'Marketing Coordinator',
            description: 'Plan and execute marketing campaigns, manage social media, and analyze campaign performance.',
          },
          {
            title: 'Brand Manager',
            description: 'Develop and maintain brand identity, manage brand communications, and ensure consistent messaging.',
          },
        ],
      },
    ],
    C: [
      {
        courseName: 'Accounting & Financial Management',
        focusDescription: 'This course covers accounting principles, financial reporting, and bookkeeping practices. Students learn to maintain accurate financial records and analyze financial data systematically.',
        whatYouLearn: [
          'Accounting principles and standards',
          'Financial statement preparation',
          'Bookkeeping and record-keeping',
          'Tax preparation basics',
          'Financial analysis and reporting',
        ],
        toolsAndSkills: [
          'Accounting software (QuickBooks, Excel)',
          'Financial reporting tools',
          'Tax preparation software',
          'Spreadsheet applications',
          'Document management systems',
        ],
        exampleJobRoles: [
          {
            title: 'Accounting Assistant',
            description: 'Maintain financial records, process transactions, and assist with financial reporting and analysis.',
          },
          {
            title: 'Bookkeeper',
            description: 'Record financial transactions, maintain ledgers, and prepare basic financial reports.',
          },
          {
            title: 'Financial Analyst',
            description: 'Analyze financial data, prepare reports, and support decision-making through financial insights.',
          },
        ],
      },
      {
        courseName: 'Administrative Management & Office Operations',
        focusDescription: 'This course covers office administration, document management, and organizational systems. Students learn to maintain efficient operations and support organizational processes.',
        whatYouLearn: [
          'Office procedures and protocols',
          'Document management and filing systems',
          'Scheduling and calendar management',
          'Communication and correspondence',
          'Process improvement and efficiency',
        ],
        toolsAndSkills: [
          'Office productivity software (Microsoft Office, Google Workspace)',
          'Document management systems',
          'Scheduling and calendar tools',
          'Database and record-keeping systems',
          'Communication platforms',
        ],
        exampleJobRoles: [
          {
            title: 'Administrative Assistant',
            description: 'Support office operations through scheduling, document management, and administrative tasks.',
          },
          {
            title: 'Office Manager',
            description: 'Oversee daily office operations, manage administrative staff, and ensure efficient workflows.',
          },
        ],
      },
      {
        courseName: 'Data Management & Information Systems',
        focusDescription: 'This course covers database management, information organization, and data processing. Students learn to structure, maintain, and analyze information systems effectively.',
        whatYouLearn: [
          'Database design and management',
          'Data entry and quality control',
          'Information organization and classification',
          'Data analysis and reporting',
          'System documentation and procedures',
        ],
        toolsAndSkills: [
          'Database software (Access, SQL)',
          'Spreadsheet applications',
          'Data analysis tools',
          'Documentation software',
          'Quality control procedures',
        ],
        exampleJobRoles: [
          {
            title: 'Data Entry Specialist',
            description: 'Input, verify, and maintain data in information systems with accuracy and attention to detail.',
          },
          {
            title: 'Information Systems Coordinator',
            description: 'Manage information systems, ensure data quality, and support users with system-related tasks.',
          },
        ],
      },
    ],
  }

  return courses[topType] || courses.I
}
