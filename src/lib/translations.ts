export type Language = 'en' | 'my'

export type TranslationKey = 
  // Common
  | 'common.close'
  | 'common.cancel'
  | 'common.save'
  | 'common.edit'
  | 'common.delete'
  | 'common.add'
  | 'common.update'
  | 'common.submit'
  | 'common.loading'
  | 'common.signOut'
  | 'common.menu'
  | 'common.error'
  | 'common.success'
  | 'common.confirm'
  | 'common.yes'
  | 'common.no'
  | 'common.back'
  | 'common.next'
  | 'common.completed'
  | 'common.inProgress'
  | 'common.locked'
  | 'common.nextStep'
  | 'common.recommended'
  
  // Navigation
  | 'nav.dashboard'
  | 'nav.profile'
  | 'nav.psychometricTest'
  | 'nav.courseRecommendation'
  | 'nav.learningRoadmap'
  | 'nav.appointments'
  | 'nav.teacherDashboard'
  | 'nav.studentOverview'
  | 'nav.manageQuestions'
  | 'nav.manageCourses'
  | 'nav.teacherAppointments'
  
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.progress'
  | 'dashboard.todayFocus'
  | 'dashboard.careerSnapshot'
  | 'dashboard.riasecProfile'
  
  // Profile
  | 'profile.title'
  | 'profile.edit'
  | 'profile.save'
  | 'profile.cancel'
  | 'profile.studentInfo'
  | 'profile.teacherInfo'
  | 'profile.fullName'
  | 'profile.email'
  | 'profile.class'
  | 'profile.aboutMe'
  | 'profile.skills'
  | 'profile.interests'
  | 'profile.hobbies'
  
  // Psychometric Test
  | 'psychometric.title'
  | 'psychometric.startTest'
  | 'psychometric.continueTest'
  | 'psychometric.submitTest'
  | 'psychometric.retakeTest'
  | 'psychometric.question'
  | 'psychometric.of'
  | 'psychometric.completed'
  | 'psychometric.yourHollandCode'
  
  // Course Recommendation
  | 'course.title'
  | 'course.recommendations'
  | 'course.viewDetails'
  | 'course.whatYouLearn'
  | 'course.whatYouWorkOn'
  | 'course.toolsAndSkills'
  | 'course.exampleJobRoles'
  | 'course.informational'
  | 'course.noRecommendations'
  | 'course.loading'
  
  // Learning Roadmap
  | 'roadmap.title'
  | 'roadmap.subtitle'
  | 'roadmap.progress'
  | 'roadmap.stepsCompleted'
  | 'roadmap.recommendedNext'
  | 'roadmap.tip'
  | 'roadmap.profile'
  | 'roadmap.test'
  | 'roadmap.career'
  | 'roadmap.futureRoles'
  | 'roadmap.profileTitle'
  | 'roadmap.profileDesc'
  | 'roadmap.profileCta'
  | 'roadmap.testTitle'
  | 'roadmap.testDesc'
  | 'roadmap.testCta'
  | 'roadmap.careerTitle'
  | 'roadmap.careerDesc'
  | 'roadmap.careerCta'
  | 'roadmap.futureRolesTitle'
  | 'roadmap.futureRolesDesc'
  | 'roadmap.futureRolesCta'
  
  // Appointments
  | 'appointment.title'
  | 'appointment.request'
  | 'appointment.cancel'
  | 'appointment.upcoming'
  | 'appointment.past'
  | 'appointment.cancelled'
  | 'appointment.approved'
  | 'appointment.pending'
  
  // Teacher Pages
  | 'teacher.dashboard'
  | 'teacher.welcome'
  | 'teacher.students'
  | 'teacher.questions'
  | 'teacher.courses'
  | 'teacher.appointments'
  
  // Login/Register Page
  | 'auth.welcomeBack'
  | 'auth.helloStudent'
  | 'auth.alreadyHaveAccount'
  | 'auth.newToPathfinder'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.email'
  | 'auth.password'
  | 'auth.fullName'
  | 'auth.class'
  | 'auth.loginTitle'
  | 'auth.signupTitle'
  
  // Dashboard Page
  | 'dashboard.careerJourneyProgress'
  | 'dashboard.keepGoing'
  | 'dashboard.journeyComplete'
  | 'dashboard.topCareerType'
  | 'dashboard.gamifiedCareerJourney'
  
  // Sidebar
  | 'sidebar.closeMenu'
  | 'sidebar.expandSidebar'
  | 'sidebar.collapseSidebar'

type Translations = {
  [K in TranslationKey]: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.update': 'Update',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    'common.signOut': 'Sign Out',
    'common.menu': 'Menu',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.completed': 'Completed',
    'common.inProgress': 'In Progress',
    'common.locked': 'Locked',
    'common.nextStep': 'Next Step',
    'common.recommended': 'Recommended',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.psychometricTest': 'Psychometric Test',
    'nav.courseRecommendation': 'Course Recommendations',
    'nav.learningRoadmap': 'Learning Roadmap',
    'nav.appointments': 'Appointments',
    'nav.teacherDashboard': 'Teacher Dashboard',
    'nav.studentOverview': 'Student Overview',
    'nav.manageQuestions': 'Manage Questions',
    'nav.manageCourses': 'Manage Courses',
    'nav.teacherAppointments': 'Appointments',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.progress': 'Progress',
    'dashboard.todayFocus': "Today's Focus",
    'dashboard.careerSnapshot': 'Career Snapshot',
    'dashboard.riasecProfile': 'RIASEC Profile',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.studentInfo': 'Student Information',
    'profile.teacherInfo': 'Teacher Information',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.class': 'Class',
    'profile.aboutMe': 'About Me',
    'profile.skills': 'Skills',
    'profile.interests': 'Interests',
    'profile.hobbies': 'Hobbies',
    
    // Psychometric Test
    'psychometric.title': 'Psychometric Test',
    'psychometric.startTest': 'Start Test',
    'psychometric.continueTest': 'Continue Test',
    'psychometric.submitTest': 'Submit Test',
    'psychometric.retakeTest': 'Retake Test',
    'psychometric.question': 'Question',
    'psychometric.of': 'of',
    'psychometric.completed': 'Completed',
    'psychometric.yourHollandCode': 'Your Holland Code:',
    
    // Course Recommendation
    'course.title': 'Course Recommendations',
    'course.recommendations': 'Recommended Courses for You',
    'course.viewDetails': 'View Details',
    'course.whatYouLearn': "What you'll learn",
    'course.whatYouWorkOn': "What you'll work on",
    'course.toolsAndSkills': 'Tools & skills',
    'course.exampleJobRoles': 'Example Job Roles',
    'course.informational': 'Informational',
    'course.noRecommendations': 'No course recommendations available at this time. Please check back later.',
    'course.loading': 'Loading course recommendations...',
    
    // Learning Roadmap
    'roadmap.title': 'Roadmap To Learn Technology',
    'roadmap.subtitle': 'Visual guidance only (not an LMS). Click each node to see what it means and what to do next.',
    'roadmap.progress': 'Roadmap Progress',
    'roadmap.stepsCompleted': 'steps completed',
    'roadmap.recommendedNext': 'Recommended next step:',
    'roadmap.tip': 'Tip: This roadmap is guidance-oriented. Focus on small, repeatable goals and improve week by week.',
    'roadmap.profile': 'Profile',
    'roadmap.test': 'Test',
    'roadmap.career': 'Career',
    'roadmap.futureRoles': 'Future Roles',
    'roadmap.profileTitle': 'Complete Profile',
    'roadmap.profileDesc': 'This step gives basic context so the system can explain guidance in a way that fits you.',
    'roadmap.profileCta': 'Go to Profile',
    'roadmap.testTitle': 'Take Psychometric Test',
    'roadmap.testDesc': 'Answer one question at a time. The system uses your responses to calculate RIASEC and generate guidance.',
    'roadmap.testCta': 'Go to Psychometric Test',
    'roadmap.careerTitle': 'Explore Course Recommendations',
    'roadmap.careerDesc': 'Discover courses and learning paths tailored to your RIASEC profile and career interests.',
    'roadmap.careerCta': 'Go to Course Recommendations',
    'roadmap.futureRolesTitle': 'Your Direction',
    'roadmap.futureRolesDesc': 'This is your long-term direction. You can retake the test or switch tracks as your interests grow.',
    'roadmap.futureRolesCta': 'Review Career Path',
    
    // Appointments
    'appointment.title': 'Appointments',
    'appointment.request': 'Request Appointment',
    'appointment.cancel': 'Cancel',
    'appointment.upcoming': 'Upcoming',
    'appointment.past': 'Past',
    'appointment.cancelled': 'Cancelled',
    'appointment.approved': 'Approved',
    'appointment.pending': 'Pending',
    
    // Teacher Pages
    'teacher.dashboard': 'Teacher Dashboard',
    'teacher.welcome': 'Welcome Back',
    'teacher.students': 'Student Overview',
    'teacher.questions': 'Manage Questions',
    'teacher.courses': 'Manage Courses',
    'teacher.appointments': 'Appointments',
    
    // Login/Register Page
    'auth.welcomeBack': 'Welcome Back!',
    'auth.helloStudent': 'Hello, Student!',
    'auth.alreadyHaveAccount': 'Already have an account? Sign in to continue.',
    'auth.newToPathfinder': 'New to PathFinder? Create an account to get started.',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.class': 'Class',
    'auth.loginTitle': 'Login to Your Account',
    'auth.signupTitle': 'Create Your Account',
    
    // Dashboard Page
    'dashboard.careerJourneyProgress': 'Career Journey Progress',
    'dashboard.keepGoing': 'Keep going! You\'re making great progress.',
    'dashboard.journeyComplete': 'Journey Complete',
    'dashboard.topCareerType': 'Top career type:',
    'dashboard.gamifiedCareerJourney': 'Gamified Career Journey',
    
    // Sidebar
    'sidebar.closeMenu': 'Close menu',
    'sidebar.expandSidebar': 'Expand sidebar',
    'sidebar.collapseSidebar': 'Collapse sidebar',
  },
  my: {
    // Common
    'common.close': 'Tutup',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.edit': 'Edit',
    'common.delete': 'Padam',
    'common.add': 'Tambah',
    'common.update': 'Kemaskini',
    'common.submit': 'Hantar',
    'common.loading': 'Memuatkan...',
    'common.signOut': 'Log Keluar',
    'common.menu': 'Menu',
    'common.error': 'Ralat',
    'common.success': 'Berjaya',
    'common.confirm': 'Sahkan',
    'common.yes': 'Ya',
    'common.no': 'Tidak',
    'common.back': 'Kembali',
    'common.next': 'Seterusnya',
    'common.completed': 'Selesai',
    'common.inProgress': 'Sedang Berlangsung',
    'common.locked': 'Terkunci',
    'common.nextStep': 'Langkah Seterusnya',
    'common.recommended': 'Disyorkan',
    
    // Navigation
    'nav.dashboard': 'Papan Pemuka',
    'nav.profile': 'Profil',
    'nav.psychometricTest': 'Ujian Psikometrik',
    'nav.courseRecommendation': 'Cadangan Kursus',
    'nav.learningRoadmap': 'Peta Jalan Pembelajaran',
    'nav.appointments': 'Temu Janji',
    'nav.teacherDashboard': 'Papan Pemuka Guru',
    'nav.studentOverview': 'Gambaran Keseluruhan Pelajar',
    'nav.manageQuestions': 'Urus Soalan',
    'nav.manageCourses': 'Urus Kursus',
    'nav.teacherAppointments': 'Temu Janji',
    
    // Dashboard
    'dashboard.title': 'Papan Pemuka',
    'dashboard.welcome': 'Selamat Datang',
    'dashboard.progress': 'Kemajuan',
    'dashboard.todayFocus': 'Fokus Hari Ini',
    'dashboard.careerSnapshot': 'Gambaran Kerjaya',
    'dashboard.riasecProfile': 'Profil RIASEC',
    
    // Profile
    'profile.title': 'Profil',
    'profile.edit': 'Edit Profil',
    'profile.save': 'Simpan Perubahan',
    'profile.cancel': 'Batal',
    'profile.studentInfo': 'Maklumat Pelajar',
    'profile.teacherInfo': 'Maklumat Guru',
    'profile.fullName': 'Nama Penuh',
    'profile.email': 'E-mel',
    'profile.class': 'Kelas',
    'profile.aboutMe': 'Tentang Saya',
    'profile.skills': 'Kemahiran',
    'profile.interests': 'Minat',
    'profile.hobbies': 'Hobi',
    
    // Psychometric Test
    'psychometric.title': 'Ujian Psikometrik',
    'psychometric.startTest': 'Mula Ujian',
    'psychometric.continueTest': 'Teruskan Ujian',
    'psychometric.submitTest': 'Hantar Ujian',
    'psychometric.retakeTest': 'Ambil Ujian Semula',
    'psychometric.question': 'Soalan',
    'psychometric.of': 'daripada',
    'psychometric.completed': 'Selesai',
    'psychometric.yourHollandCode': 'Kod Holland Anda:',
    
    // Course Recommendation
    'course.title': 'Cadangan Kursus',
    'course.recommendations': 'Kursus yang Disyorkan untuk Anda',
    'course.viewDetails': 'Lihat Butiran',
    'course.whatYouLearn': 'Apa yang akan anda pelajari',
    'course.whatYouWorkOn': 'Apa yang akan anda kerjakan',
    'course.toolsAndSkills': 'Alat & kemahiran',
    'course.exampleJobRoles': 'Contoh Peranan Pekerjaan',
    'course.informational': 'Maklumat',
    'course.noRecommendations': 'Tiada cadangan kursus tersedia pada masa ini. Sila semak semula kemudian.',
    'course.loading': 'Memuatkan cadangan kursus...',
    
    // Learning Roadmap
    'roadmap.title': 'Peta Jalan untuk Mempelajari Teknologi',
    'roadmap.subtitle': 'Panduan visual sahaja (bukan LMS). Klik setiap nod untuk melihat maksudnya dan apa yang perlu dilakukan seterusnya.',
    'roadmap.progress': 'Kemajuan Peta Jalan',
    'roadmap.stepsCompleted': 'langkah selesai',
    'roadmap.recommendedNext': 'Langkah seterusnya yang disyorkan:',
    'roadmap.tip': 'Petua: Peta jalan ini berorientasikan panduan. Fokus pada matlamat kecil yang boleh diulang dan tingkatkan dari minggu ke minggu.',
    'roadmap.profile': 'Profil',
    'roadmap.test': 'Ujian',
    'roadmap.career': 'Kerjaya',
    'roadmap.futureRoles': 'Peranan Masa Depan',
    'roadmap.profileTitle': 'Lengkapkan Profil',
    'roadmap.profileDesc': 'Langkah ini memberikan konteks asas supaya sistem dapat menjelaskan panduan dengan cara yang sesuai dengan anda.',
    'roadmap.profileCta': 'Pergi ke Profil',
    'roadmap.testTitle': 'Ambil Ujian Psikometrik',
    'roadmap.testDesc': 'Jawab satu soalan pada satu masa. Sistem menggunakan respons anda untuk mengira RIASEC dan menjana panduan.',
    'roadmap.testCta': 'Pergi ke Ujian Psikometrik',
    'roadmap.careerTitle': 'Terokai Cadangan Kursus',
    'roadmap.careerDesc': 'Temui kursus dan laluan pembelajaran yang disesuaikan dengan profil RIASEC dan minat kerjaya anda.',
    'roadmap.careerCta': 'Pergi ke Cadangan Kursus',
    'roadmap.futureRolesTitle': 'Arah Anda',
    'roadmap.futureRolesDesc': 'Ini adalah arah jangka panjang anda. Anda boleh mengambil ujian semula atau menukar laluan apabila minat anda berkembang.',
    'roadmap.futureRolesCta': 'Semak Laluan Kerjaya',
    
    // Appointments
    'appointment.title': 'Temu Janji',
    'appointment.request': 'Minta Temu Janji',
    'appointment.cancel': 'Batal',
    'appointment.upcoming': 'Akan Datang',
    'appointment.past': 'Lalu',
    'appointment.cancelled': 'Dibatalkan',
    'appointment.approved': 'Diluluskan',
    'appointment.pending': 'Menunggu',
    
    // Teacher Pages
    'teacher.dashboard': 'Papan Pemuka Guru',
    'teacher.welcome': 'SELAMAT KEMBALI',
    'teacher.students': 'Gambaran Keseluruhan Pelajar',
    'teacher.questions': 'Urus Soalan',
    'teacher.courses': 'Urus Kursus',
    'teacher.appointments': 'Temu Janji',
    
    // Login/Register Page
    'auth.welcomeBack': 'Selamat Kembali!',
    'auth.helloStudent': 'Hai, Pelajar!',
    'auth.alreadyHaveAccount': 'Sudah ada akaun? Log masuk untuk teruskan.',
    'auth.newToPathfinder': 'Baru di PathFinder? Buat akaun untuk bermula.',
    'auth.signIn': 'Log Masuk',
    'auth.signUp': 'Daftar',
    'auth.email': 'E-mel',
    'auth.password': 'Kata Laluan',
    'auth.fullName': 'Nama Penuh',
    'auth.class': 'Kelas',
    'auth.loginTitle': 'Log Masuk ke Akaun Anda',
    'auth.signupTitle': 'Buat Akaun Anda',
    
    // Dashboard Page
    'dashboard.careerJourneyProgress': 'Kemajuan Perjalanan Kerjaya',
    'dashboard.keepGoing': 'Teruskan! Anda membuat kemajuan yang hebat.',
    'dashboard.journeyComplete': 'Perjalanan Selesai',
    'dashboard.topCareerType': 'Jenis kerjaya teratas:',
    'dashboard.gamifiedCareerJourney': 'Perjalanan Kerjaya Bermain',
    
    // Sidebar
    'sidebar.closeMenu': 'Tutup menu',
    'sidebar.expandSidebar': 'Kembangkan bar sisi',
    'sidebar.collapseSidebar': 'Runtuhkan bar sisi',
  },
}

// Note: useTranslation hook should be imported from context/LanguageContext
// This file only exports the translations dictionary
