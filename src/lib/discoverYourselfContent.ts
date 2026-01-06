export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type DiscoverEntry = {
  title: string // short title e.g. Who you are
  short: string // brief description
  howYouThink: string
  howYouLearn: string
  futureLearning: string
  image?: string // optional image path or asset key
}

export type DiscoverContent = Record<'en' | 'my', Record<RiasecKey, DiscoverEntry>>

export const discoverYourselfContent: DiscoverContent = {
  en: {
    R: {
      title: 'Realistic (R) — Practical Doer',
      short: 'Hands-on and action-oriented; prefers concrete tasks and tools.',
      howYouThink: 'You focus on practical solutions and like solving problems through doing rather than abstract discussion.',
      howYouLearn: 'You learn best by building, experimenting and practicing with real tools and projects.',
      futureLearning: 'Aim for project-based learning and applied exercises that let you show results and build tangible skills.',
      image: '/assets/riasec/R.png',
    },
    I: {
      title: 'Investigative (I) — Analytical Thinker',
      short: 'Curious and analytical; enjoys researching and solving complex problems.',
      howYouThink: 'You approach problems by questioning, analyzing data, and testing hypotheses.',
      howYouLearn: 'You learn well through exploration, reading, experiments, and step-by-step reasoning.',
      futureLearning: 'Focus on learning that emphasizes concepts, experiments, and problem-solving challenges.',
      image: '/assets/riasec/I.png',
    },
    A: {
      title: 'Artistic (A) — Creative Explorer',
      short: 'Imaginative and expressive; prefers open-ended, design-focused work.',
      howYouThink: 'You value originality and express ideas through creative solutions and visual or written media.',
      howYouLearn: 'You learn best with creative projects, prototyping, and opportunities to iterate on designs.',
      futureLearning: 'Seek courses that allow creative freedom and portfolio-building through projects.',
      image: '/assets/riasec/A.png',
    },
    S: {
      title: 'Social (S) — People Helper',
      short: 'Empathetic and collaborative; enjoys helping, teaching, and working with others.',
      howYouThink: 'You consider people and relationships when solving problems and enjoy teamwork.',
      howYouLearn: 'You learn best by teaching, group activities, mentoring, and discussion-based work.',
      futureLearning: 'Choose learning paths with collaboration, communication, and real-world impact.',
      image: '/assets/riasec/S.png',
    },
    E: {
      title: 'Enterprising (E) — Leader & Organizer',
      short: 'Persuasive and goal-oriented; enjoys leading, planning and influencing outcomes.',
      howYouThink: 'You think strategically and focus on opportunities, goals and practical results.',
      howYouLearn: 'You learn through challenges that involve leadership, projects with goals, and real responsibilities.',
      futureLearning: 'Pursue learning that builds leadership, project planning, and communication skills.',
      image: '/assets/riasec/E.png',
    },
    C: {
      title: 'Conventional (C) — Structured Organizer',
      short: 'Detail-focused and systematic; enjoys organization, rules and data.',
      howYouThink: 'You prefer clear procedures, structure and accurate work.',
      howYouLearn: 'You learn well with structured lessons, checklists, and practice that reinforces accuracy.',
      futureLearning: 'Look for systematic, well-organized learning with clear milestones and assessments.',
      image: '/assets/riasec/C.png',
    },
  },

  my: {
    R: {
      title: 'Realistik (R) — Pelaksana Praktikal',
      short: 'Suka kerja tangan dan berorientasikan tindakan; memilih tugas konkrit dan alat.',
      howYouThink: 'Anda memberi tumpuan kepada penyelesaian praktikal dan menyelesaikan masalah melalui tindakan.',
      howYouLearn: 'Belajar paling baik dengan membina, mencuba dan mengamalkan projek sebenar.',
      futureLearning: 'Fokus pada pembelajaran berasaskan projek dan latihan terapan untuk membina kemahiran nyata.',
      image: '/assets/riasec/R.png',
    },
    I: {
      title: 'Investigatif (I) — Pemikir Analitik',
      short: 'Ingin tahu dan analitik; suka menyelidik dan menyelesaikan masalah kompleks.',
      howYouThink: 'Anda menyelesaikan masalah dengan mempersoalkan, menganalisis data, dan menguji hipotesis.',
      howYouLearn: 'Belajar melalui penerokaan, pembacaan, eksperimen dan pemikiran langkah demi langkah.',
      futureLearning: 'Fokus pada pembelajaran yang menekankan konsep, eksperimen dan cabaran penyelesaian masalah.',
      image: '/assets/riasec/I.png',
    },
    A: {
      title: 'Artistik (A) — Penjelajah Kreatif',
      short: 'Imajinatif dan ekspresif; memilih kerja yang terbuka dan berfokus reka bentuk.',
      howYouThink: 'Anda menghargai keaslian dan menyatakan idea melalui solusi kreatif dan media visual atau tulisan.',
      howYouLearn: 'Belajar terbaik melalui projek kreatif, prototaip, dan peluang untuk mengulang reka bentuk.',
      futureLearning: 'Cari kursus yang membenarkan kebebasan kreatif dan membina portfolio melalui projek.',
      image: '/assets/riasec/A.png',
    },
    S: {
      title: 'Sosial (S) — Pembantu & Penyokong',
      short: 'Empati dan kolaboratif; suka membantu, mengajar dan bekerja dengan orang lain.',
      howYouThink: 'Anda memikirkan orang dan hubungan ketika menyelesaikan masalah dan suka kerja berkumpulan.',
      howYouLearn: 'Belajar dengan mengajar, aktiviti berkumpulan, bimbingan dan perbincangan.',
      futureLearning: 'Pilih laluan pembelajaran dengan kolaborasi, komunikasi dan impak dunia sebenar.',
      image: '/assets/riasec/S.png',
    },
    E: {
      title: 'Enterprising (E) — Pemimpin & Pengurus',
      short: 'Berorientasikan matlamat dan meyakinkan; suka memimpin, merancang dan mempengaruhi keputusan.',
      howYouThink: 'Anda berfikir secara strategik dan menumpukan pada peluang, matlamat dan hasil praktikal.',
      howYouLearn: 'Belajar melalui cabaran yang melibatkan kepimpinan, projek berorientasikan matlamat dan tanggungjawab.',
      futureLearning: 'Kejar pembelajaran yang membina kemahiran kepimpinan, perancangan projek dan komunikasi.',
      image: '/assets/riasec/E.png',
    },
    C: {
      title: 'Konvensional (C) — Pengatur Teratur',
      short: 'Memfokus pada perincian dan sistematik; suka organisasi, peraturan dan data.',
      howYouThink: 'Anda lebih suka prosedur jelas, struktur dan kerja yang tepat.',
      howYouLearn: 'Belajar dengan pelajaran berstruktur, senarai semak dan latihan yang menguatkan ketepatan.',
      futureLearning: 'Cari pembelajaran yang tersusun dengan pencapaian dan penilaian yang jelas.',
      image: '/assets/riasec/C.png',
    },
  },
}

export const discoverYourselfLabels: Record<'en' | 'my', { howYouThink: string; howYouLearn: string; futureLearning: string }> = {
  en: {
    howYouThink: 'How you think',
    howYouLearn: 'How you learn',
    futureLearning: 'What this means for your learning',
  },
  my: {
    howYouThink: 'Cara anda berfikir',
    howYouLearn: 'Cara anda belajar',
    futureLearning: 'Apa maksudnya untuk pembelajaran anda',
  },
}

export const discoverYourselfMeta: Record<'en' | 'my', { sectionTitle: string; bullets: string[] }> = {
  en: {
    sectionTitle: 'Discover Yourself',
    bullets: ['Learn what makes you unique', 'Understand your strengths'],
  },
  my: {
    sectionTitle: 'Kenali Diri Anda',
    bullets: ['Ketahui apa yang membezakan anda', 'Fahami kekuatan anda'],
  },
}

export type PersonalInsights = {
  howYouThink: { title: string; bullets: string[] }
  howYouLearnBest: { title: string; bullets: string[] }
  whatYoureGoodAt: { title: string; bullets: string[] }
  whyThisMatters: { title: string; bullets: string[] }
}

export const identityHeadings: Record<'en' | 'my', Record<RiasecKey, string>> = {
  en: {
    R: 'Practical, Hands-On Problem Solver',
    I: 'Curious, Analytical Thinker',
    A: 'Creative, Design-Oriented Innovator',
    S: 'People-Centered, Empathetic Collaborator',
    E: 'Leadership-Focused, Initiative-Taking Influencer',
    C: 'Structured, Detail-Oriented Organizer',
  },
  my: {
    R: 'Pemecah Masalah Praktikal yang Aktif',
    I: 'Pemikir Analitik yang Ingin Tahu',
    A: 'Inovator Kreatif yang Berfokus pada Reka Bentuk',
    S: 'Kolaborator Empatik yang Berpusat pada Orang',
    E: 'Pengaruh yang Mengambil Inisiatif Berfokus Kepemimpinan',
    C: 'Pengurus Tersusun dan Peka Perhatian Terhadap Detail',
  },
}

export const personalInsights: Record<'en' | 'my', Record<RiasecKey, PersonalInsights>> = {
  en: {
    R: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How can I fix this?" or "What tools do I need?"',
          'You prefer seeing concrete results and real-world understanding',
          'When something breaks, your first instinct is to roll up your sleeves and figure it out hands-on',
          'You think in terms of practical solutions and tangible outcomes',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by doing, not just reading or watching',
          'Building, taking apart, and reassembling helps you understand deeply',
          'You thrive when experimenting with real systems, tools, and devices',
          'Step-by-step tutorials work well, but you really get it when you try it yourself',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Practical problem-solving and working with your hands',
          'Understanding how systems connect and work together',
          'Troubleshooting—spotting what\'s wrong by observing behavior',
          'Following technical procedures and maintaining organized systems',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology needs people who can actually make things work',
          'Your hands-on approach is great for setting up systems and fixing bugs',
          'You understand how hardware and software connect in real systems',
          'Your ability to see the whole system helps build reliable, working solutions',
        ],
      },
    },
    I: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "Why does this work?" and "What if I try this?"',
          'You enjoy breaking down complex challenges into smaller pieces',
          'You\'re naturally curious about how things work under the hood',
          'You love the puzzle-solving aspect of technology',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by exploring, experimenting, and understanding principles',
          'Reading documentation and studying algorithms builds deep understanding',
          'You prefer structured learning that builds on concepts',
          'You enjoy challenging yourself with increasingly complex problems',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Logical reasoning, pattern recognition, and systematic problem-solving',
          'Seeing connections between different concepts',
          'Analyzing data and understanding algorithms',
          'Thinking through the implications of different solutions',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology is built on logic, data, and systematic thinking',
          'Your analytical mind helps write better code and design efficient systems',
          'You solve problems that others find overwhelming',
          'Your curiosity drives you to understand not just what works, but why it works',
        ],
      },
    },
    A: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How can I make this beautiful?" or "What would feel right to use?"',
          'You think in terms of experiences, aesthetics, and user feelings',
          'You enjoy exploring different creative possibilities',
          'You aren\'t satisfied until something looks and feels polished',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by experimenting creatively and seeing visual results',
          'Working on projects that express your ideas helps you understand deeply',
          'You prefer open-ended learning where you can explore different approaches',
          'Seeing your work come to life motivates you',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Visual thinking and creative problem-solving',
          'Understanding what makes experiences enjoyable',
          'Natural eye for design, color, and layout',
          'Imagining how users will interact and creating intuitive interfaces',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology needs to be usable and enjoyable, not just functional',
          'Your creative thinking makes technology accessible and appealing',
          'You bridge the gap between technical capability and human experience',
          'Your ability to think about look and feel creates technology people want to use',
        ],
      },
    },
    S: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How will this help people?" and "What do users actually need?"',
          'You think about the human side of technology',
          'You naturally consider how others will experience and use what you create',
          'You focus on making technology more helpful for real people',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by connecting knowledge to real-world applications',
          'Working on projects that solve actual problems keeps you motivated',
          'You learn well through collaboration and teaching others',
          'Understanding the "why" behind technology helps you learn the "how"',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Understanding people\'s needs and communicating clearly',
          'Translating between technical and non-technical language',
          'Explaining complex concepts in simple terms',
          'Effective collaboration and support through your people skills',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology exists to serve people, and you understand that connection',
          'Your ability to understand user needs creates technology that solves real problems',
          'You bridge the gap between technical teams and end users',
          'Your communication skills help teams work together effectively',
        ],
      },
    },
    E: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "What should we build?" and "How can we make this successful?"',
          'You think strategically about goals, priorities, and outcomes',
          'You consider the bigger picture—not just how something works, but its value',
          'You naturally think about how things fit into larger plans',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by seeing how knowledge connects to real-world goals',
          'Projects with clear objectives and measurable results keep you motivated',
          'You prefer learning that helps you make decisions and take action',
          'Understanding the "why" and "what\'s next" helps you learn technical details',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Seeing the big picture and making strategic decisions',
          'Organizing people and resources toward goals',
          'Planning, prioritizing, and communicating what needs to happen',
          'Translating between business needs and technical possibilities',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology projects need direction and someone who connects work to goals',
          'Your strategic thinking helps teams focus on what matters most',
          'You understand what users and businesses need and translate to technical requirements',
          'Your ability to lead and coordinate makes technology projects successful',
        ],
      },
    },
    C: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "What\'s the right process?" and "How can we make this consistent?"',
          'You think systematically about organization and accuracy',
          'You naturally notice details and patterns others might miss',
          'You value doing things correctly and consistently',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn when information is well-organized and structured',
          'Step-by-step processes and clear documentation help you build understanding',
          'You prefer learning that follows logical sequences',
          'Practice and repetition help you master skills',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Organizing information and maintaining accuracy',
          'Following systematic processes and spotting inconsistencies',
          'Creating and maintaining clear documentation',
          'Ensuring quality through your systematic approach',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology relies on precision, organization, and systematic thinking',
          'Your attention to detail helps catch bugs and maintain data quality',
          'Your ability to organize information is valuable in testing and documentation',
          'Technology needs people who ensure everything works correctly and consistently',
        ],
      },
    },
  },
  my: {
    R: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Bagaimana saya boleh memperbaiki ini?" atau "Alat apa yang saya perlukan?"',
          'Anda lebih suka melihat hasil konkrit dan pemahaman dunia sebenar',
          'Apabila sesuatu rosak, naluri pertama anda adalah melonggarkan lengan baju dan menyelamatnya secara langsung',
          'Anda berfikir dari segi penyelesaian praktikal dan hasil nyata',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar dengan melakukan, bukan hanya membaca atau menonton',
          'Membina, membongkar dan memasang semula membantu anda memahami dengan mendalam',
          'Anda berkembang pesat apabila bereksperimen dengan sistem sebenar, alatan dan peranti',
          'Tutorial langkah demi langkah berfungsi dengan baik, tetapi anda benar-benar mendapatkannya apabila anda mencubanya sendiri',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Penyelesaian masalah praktikal dan bekerja dengan tangan anda',
          'Memahami bagaimana sistem bersambung dan bekerja bersama',
          'Penyelesaian masalah—mengesan apa yang salah dengan memerhatikan tingkah laku',
          'Mengikut prosedur teknikal dan mengekalkan sistem yang teratur',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Teknologi memerlukan orang yang benar-benar dapat membuat perkara berfungsi',
          'Pendekatan hands-on anda bagus untuk menyediakan sistem dan membetulkan pepijat',
          'Anda memahami bagaimana perkakasan dan perisian bersambung dalam sistem sebenar',
          'Keupayaan anda untuk melihat seluruh sistem membantu membina penyelesaian yang boleh dipercayai dan berfungsi',
        ],
      },
    },
    I: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Mengapa ini berfungsi?" dan "Apa jika saya mencuba ini?"',
          'Anda menikmati memecahkan cabaran kompleks menjadi bahagian yang lebih kecil',
          'Anda secara semula jadi ingin tahu bagaimana perkara berfungsi di bawah tudung',
          'Anda menyukai aspek penyelesaian teka-teki teknologi',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar dengan meneroka, bereksperimen dan memahami prinsip',
          'Membaca dokumentasi dan mengkaji algoritma membina pemahaman yang mendalam',
          'Anda lebih suka pembelajaran berstruktur yang dibina berdasarkan konsep',
          'Anda menikmati mencabar diri anda dengan masalah yang semakin kompleks',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Penaakulan logik, pengecaman corak dan penyelesaian masalah sistemik',
          'Melihat sambungan antara konsep yang berbeza',
          'Menganalisis data dan memahami algoritma',
          'Berfikir melalui implikasi penyelesaian yang berbeza',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Teknologi dibina berdasarkan logik, data dan pemikiran sistemik',
          'Fikiran analitik anda membantu menulis kod yang lebih baik dan merancang sistem yang cekap',
          'Anda menyelesaikan masalah yang orang lain anggap sangat menakutkan',
          'Keingintahuan anda mendorong anda memahami bukan hanya apa yang berfungsi, tetapi mengapa ia berfungsi',
        ],
      },
    },
    A: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Bagaimana saya boleh membuat ini indah?" atau "Apa yang akan terasa tepat untuk digunakan?"',
          'Anda berfikir dari segi pengalaman, estetika dan perasaan pengguna',
          'Anda menikmati meneroka kemungkinan kreatif yang berbeza',
          'Anda tidak puas sehingga sesuatu kelihatan dan berasa sempurna',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar dengan bereksperimen secara kreatif dan melihat hasil visual',
          'Bekerja pada projek yang mengekspresikan idea anda membantu anda memahami dengan mendalam',
          'Anda lebih suka pembelajaran terbuka di mana anda boleh meneroka pendekatan berbeza',
          'Melihat karya anda menjadi kenyataan memotivasi anda',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Pemikiran visual dan penyelesaian masalah kreatif',
          'Memahami apa yang membuat pengalaman menyenangkan',
          'Mata semula jadi untuk reka bentuk, warna dan susun atur',
          'Membayangkan bagaimana pengguna akan berinteraksi dan mencipta antara muka yang intuitif',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Teknologi perlu boleh digunakan dan menyenangkan, bukan hanya berfungsi',
          'Pemikiran kreatif anda membuat teknologi dapat diakses dan menarik',
          'Anda menjembatani jurang antara keupayaan teknikal dan pengalaman manusia',
          'Keupayaan anda untuk berfikir tentang penampilan dan rasa mencipta teknologi yang orang ingin gunakan',
        ],
      },
    },
    S: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Bagaimana ini akan membantu orang?" dan "Apa yang pengguna benar-benar perlukan?"',
          'Anda berfikir tentang sisi manusia teknologi',
          'Anda secara semula jadi mempertimbangkan bagaimana orang lain akan mengalami dan menggunakan apa yang anda ciptakan',
          'Anda memberi tumpuan kepada menjadikan teknologi lebih membantu bagi orang sebenar',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar dengan menyambungkan pengetahuan kepada aplikasi dunia sebenar',
          'Bekerja pada projek yang menyelesaikan masalah sebenar membuat anda termotivasi',
          'Anda belajar dengan baik melalui kerjasama dan mengajar orang lain',
          'Memahami "mengapa" di sebalik teknologi membantu anda belajar "bagaimana"',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Memahami keperluan orang dan berkomunikasi dengan jelas',
          'Menterjemah antara bahasa teknikal dan bukan teknikal',
          'Menjelaskan konsep kompleks dalam istilah mudah',
          'Kerjasama yang berkesan dan sokongan melalui kemahiran orang anda',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Teknologi wujud untuk melayani orang, dan anda memahami sambungan itu',
          'Keupayaan anda memahami keperluan pengguna mencipta teknologi yang menyelesaikan masalah sebenar',
          'Anda menjembatani jurang antara pasukan teknikal dan pengguna akhir',
          'Kemahiran komunikasi anda membantu pasukan bekerja bersama dengan berkesan',
        ],
      },
    },
    E: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Apa yang patut kami bina?" dan "Bagaimana kami boleh membuat ini berjaya?"',
          'Anda berfikir secara strategis tentang matlamat, keutamaan dan hasil',
          'Anda mempertimbangkan gambaran yang lebih besar—bukan hanya bagaimana sesuatu berfungsi, tetapi nilainya',
          'Anda secara semula jadi berfikir tentang bagaimana perkara itu sesuai dengan rancangan yang lebih besar',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar dengan melihat bagaimana pengetahuan bersambung dengan matlamat dunia sebenar',
          'Projek dengan objektif yang jelas dan hasil yang boleh diukur membuat anda termotivasi',
          'Anda lebih suka pembelajaran yang membantu anda membuat keputusan dan mengambil tindakan',
          'Memahami "mengapa" dan "apa seterusnya" membantu anda belajar butiran teknikal',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Melihat gambaran yang lebih besar dan membuat keputusan strategis',
          'Mengatur orang dan sumber daya ke arah matlamat',
          'Merancang, memberi keutamaan dan berkomunikasi apa yang perlu berlaku',
          'Menterjemah antara keperluan perniagaan dan kemungkinan teknikal',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Projek teknologi memerlukan arah dan orang yang menghubungkan kerja dengan matlamat',
          'Pemikiran strategis anda membantu pasukan memberi tumpuan kepada apa yang paling penting',
          'Anda memahami apa yang diperlukan oleh pengguna dan perniagaan serta menterjemah kepada keperluan teknikal',
          'Keupayaan anda memimpin dan menyelaras membuat projek teknologi berjaya',
        ],
      },
    },
    C: {
      howYouThink: {
        title: 'Cara Anda Berfikir',
        bullets: [
          'Anda bertanya "Apa proses yang betul?" dan "Bagaimana kami boleh membuat ini konsisten?"',
          'Anda berfikir secara sistemik tentang organisasi dan ketepatan',
          'Anda secara semula jadi melihat perincian dan corak yang mungkin disalahkan oleh orang lain',
          'Anda menghargai melakukan perkara dengan betul dan konsisten',
        ],
      },
      howYouLearnBest: {
        title: 'Cara Anda Belajar Terbaik',
        bullets: [
          'Anda belajar apabila maklumat tersusun dengan baik dan berstruktur',
          'Proses langkah demi langkah dan dokumentasi yang jelas membantu anda membina pemahaman',
          'Anda lebih suka pembelajaran yang mengikut jujukan logik',
          'Amalan dan pengulangan membantu anda menguasai kemahiran',
        ],
      },
      whatYoureGoodAt: {
        title: 'Apa Yang Anda Mahir',
        bullets: [
          'Mengorganisir maklumat dan mengekalkan ketepatan',
          'Mengikut proses sistemik dan mengesan ketidakkonsistenan',
          'Mencipta dan mengekalkan dokumentasi yang jelas',
          'Memastikan kualiti melalui pendekatan sistemik anda',
        ],
      },
      whyThisMatters: {
        title: 'Mengapa Ini Penting dalam Teknologi',
        bullets: [
          'Teknologi bergantung pada ketepatan, organisasi dan pemikiran sistemik',
          'Perhatian anda terhadap perincian membantu menangkap pepijat dan mengekalkan kualiti data',
          'Keupayaan anda untuk mengatur maklumat bernilai dalam pengujian dan dokumentasi',
          'Teknologi memerlukan orang yang memastikan semuanya berfungsi dengan betul dan konsisten',
        ],
      },
    },
  },
}

export type RiasecTypeInfo = {
  name: string
  description: string
}

export type RiasecTypeInfoContent = Record<'en' | 'my', Record<RiasecKey, RiasecTypeInfo>>

export const riasecTypeInfo: RiasecTypeInfoContent = {
  en: {
    R: {
      name: 'Realistic',
      description: 'You prefer practical, hands-on work and enjoy learning through real-world tasks.',
    },
    I: {
      name: 'Investigative',
      description: 'You are curious, analytical, and motivated by understanding how things work.',
    },
    A: {
      name: 'Artistic',
      description: 'You prefer creative expression and open-ended tasks where design and originality matter.',
    },
    S: {
      name: 'Social',
      description: 'You are people-oriented and gain satisfaction from helping, teaching, and collaborating.',
    },
    E: {
      name: 'Enterprising',
      description: 'You prefer leading, initiating, and influencing outcomes.',
    },
    C: {
      name: 'Conventional',
      description: 'You prefer structure, organization, and working with details and systems.',
    },
  },
  my: {
    R: {
      name: 'Realistik',
      description: 'Anda lebih suka bekerja secara praktikal dan belajar melalui tugas dunia sebenar.',
    },
    I: {
      name: 'Penyiasat',
      description: 'Anda ingin tahu, analitik, dan didorong oleh keinginan memahami cara sesuatu berfungsi.',
    },
    A: {
      name: 'Seni',
      description: 'Anda lebih suka ekspresi kreatif dan tugas terbuka di mana reka bentuk dan keaslian penting.',
    },
    S: {
      name: 'Sosial',
      description: 'Anda berorientasikan pada orang dan mendapat kepuasan daripada membantu, mengajar dan berkolaborasi.',
    },
    E: {
      name: 'Perusahaan',
      description: 'Anda lebih suka memimpin, memulai, dan mempengaruhi hasil.',
    },
    C: {
      name: 'Konvensional',
      description: 'Anda lebih suka struktur, organisasi, dan bekerja dengan perincian dan sistem.',
    },
  },
}
