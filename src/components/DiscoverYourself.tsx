import type { FC } from 'react'
import { useTranslation } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { discoverYourselfContent, identityHeadings, personalInsights, type RiasecKey } from '../lib/discoverYourselfContent'
import { cn } from '../lib/cn'
import { IconArrowRight } from './icons'
// Static image imports
import mainIllustration from '../assets/pic1.png'
import howYouThinkIcon from '../assets/how-you-think.png'
import howYouLearnIcon from '../assets/how-you-learn.png'
import futureIcon from '../assets/future.png'

type Props = {
  riasecCode: string // e.g. 'RIA' or 'R' - we will use first char as primary
}

export const DiscoverYourself: FC<Props> = ({ riasecCode }) => {
  const { language } = useTranslation()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const primary = (riasecCode || 'I').toUpperCase().charAt(0) as RiasecKey
  const entry = discoverYourselfContent[language][primary]
  const identityHeading = identityHeadings[language][primary]
  const insights = personalInsights[language][primary]

  return (
    <section className={cn(
      'rounded-3xl border p-6 md:p-8',
      isLight
        ? 'bg-white border-slate-200 shadow-md'
        : 'bg-slate-950/40 border-slate-700/60'
    )}>
      {/* Main illustration at the top */}
      <div className="mb-6 flex justify-center">
        <div className={cn(
          'relative overflow-hidden rounded-3xl max-w-md w-full',
          // Light mode: clean card with subtle border
          isLight 
            ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-100/50 shadow-sm'
            // Dark mode: frosted glass effect with gradient and glow
            : 'bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-slate-700/20'
        )}>
          {/* Dark mode overlay to blend image edges */}
          {!isLight && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/40 pointer-events-none z-10 rounded-3xl" />
          )}
          <img
            src={mainIllustration}
            alt="Discover Yourself illustration"
            className={cn(
              'h-auto w-full object-contain relative z-0',
              isLight ? 'p-4' : 'p-6'
            )}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="space-y-6">
        {/* Header: Title */}
        <div className="text-center space-y-3">
          <h2 className={cn(
            'text-3xl md:text-4xl font-bold tracking-tight',
            isLight ? 'text-slate-900' : 'text-slate-50'
          )}>
            Discover Yourself
          </h2>
          <h3 className={cn(
            'text-xl md:text-2xl font-bold',
            isLight ? 'text-slate-800' : 'text-slate-100'
          )}>
            You are a {identityHeading}
          </h3>
          <p className={cn(
            'text-base md:text-lg max-w-2xl mx-auto leading-relaxed',
            isLight ? 'text-slate-600' : 'text-slate-300'
          )}>
            {entry.short}
          </p>
        </div>

        {/* Three sections with icons and bullet points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: How You Think */}
          <div className={cn(
            'rounded-2xl border p-6 space-y-4',
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/50 border-slate-700/60'
          )}>
            <div className="flex items-center gap-3">
              {/* Icon container - circular with background */}
              <div className={cn(
                'flex items-center justify-center flex-shrink-0 rounded-full',
                'h-12 w-12 md:h-14 md:w-14',
                // Light mode: subtle yellow background
                isLight 
                  ? 'bg-yellow-100/80 border border-yellow-200/50'
                  // Dark mode: warm yellow glow
                  : 'bg-yellow-500/20 border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.15)]'
              )}>
                <img
                  src={howYouThinkIcon}
                  alt="How You Think icon"
                  className="h-7 w-7 md:h-8 md:w-8 object-contain"
                />
              </div>
              <h4 className={cn(
                'text-lg font-semibold',
                isLight ? 'text-slate-900' : 'text-slate-100'
              )}>
                How You Think
              </h4>
            </div>
            <ul className="space-y-2">
              {insights.howYouThink.bullets.slice(0, 2).map((bullet, idx) => (
                <li key={idx} className={cn(
                  'flex items-start gap-2 text-sm leading-relaxed',
                  isLight ? 'text-slate-700' : 'text-slate-300'
                )}>
                  <span className={cn(
                    'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                    isLight ? 'bg-slate-600' : 'bg-slate-400'
                  )} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: How You Learn Best */}
          <div className={cn(
            'rounded-2xl border p-6 space-y-4',
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/50 border-slate-700/60'
          )}>
            <div className="flex items-center gap-3">
              {/* Icon container - circular with background */}
              <div className={cn(
                'flex items-center justify-center flex-shrink-0 rounded-full',
                'h-12 w-12 md:h-14 md:w-14',
                // Light mode: subtle blue background
                isLight 
                  ? 'bg-blue-100/80 border border-blue-200/50'
                  // Dark mode: cool blue glow
                  : 'bg-blue-500/20 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              )}>
                <img
                  src={howYouLearnIcon}
                  alt="How You Learn Best icon"
                  className="h-7 w-7 md:h-8 md:w-8 object-contain"
                />
              </div>
              <h4 className={cn(
                'text-lg font-semibold',
                isLight ? 'text-slate-900' : 'text-slate-100'
              )}>
                How You Learn Best
              </h4>
            </div>
            <ul className="space-y-2">
              {insights.howYouLearnBest.bullets.slice(0, 2).map((bullet, idx) => (
                <li key={idx} className={cn(
                  'flex items-start gap-2 text-sm leading-relaxed',
                  isLight ? 'text-slate-700' : 'text-slate-300'
                )}>
                  <span className={cn(
                    'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                    isLight ? 'bg-slate-600' : 'bg-slate-400'
                  )} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: What This Means for Your Future */}
          <div className={cn(
            'rounded-2xl border p-6 space-y-4',
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/50 border-slate-700/60'
          )}>
            <div className="flex items-center gap-3">
              {/* Icon container - circular with background */}
              <div className={cn(
                'flex items-center justify-center flex-shrink-0 rounded-full',
                'h-12 w-12 md:h-14 md:w-14',
                // Light mode: subtle orange/amber background
                isLight 
                  ? 'bg-orange-100/80 border border-orange-200/50'
                  // Dark mode: warm orange glow
                  : 'bg-orange-500/20 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
              )}>
                <img
                  src={futureIcon}
                  alt="What This Means for Your Future icon"
                  className="h-7 w-7 md:h-8 md:w-8 object-contain"
                />
              </div>
              <h4 className={cn(
                'text-lg font-semibold',
                isLight ? 'text-slate-900' : 'text-slate-100'
              )}>
                What This Means for Your Future
              </h4>
            </div>
            <ul className="space-y-2">
              {insights.whyThisMatters.bullets.slice(0, 2).map((bullet, idx) => (
                <li key={idx} className={cn(
                  'flex items-start gap-2 text-sm leading-relaxed',
                  isLight ? 'text-slate-700' : 'text-slate-300'
                )}>
                  <span className={cn(
                    'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                    isLight ? 'bg-slate-600' : 'bg-slate-400'
                  )} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Insights Section */}
        <div className="pt-6 border-t space-y-6">
          <h3 className={cn(
            'text-xl md:text-2xl font-bold text-center',
            isLight ? 'text-slate-900' : 'text-slate-100'
          )}>
            Based on Your Result
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className={cn(
              'rounded-2xl border p-5 space-y-3',
              isLight
                ? 'bg-emerald-50/50 border-emerald-200/50'
                : 'bg-emerald-950/20 border-emerald-800/30'
            )}>
              <h4 className={cn(
                'text-base font-bold flex items-center gap-2',
                isLight ? 'text-emerald-900' : 'text-emerald-200'
              )}>
                <span className={cn(
                  'size-2 rounded-full',
                  isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                )} />
                Your Strengths
              </h4>
              <ul className="space-y-2">
                {insights.whatYoureGoodAt.bullets.slice(0, 3).map((strength, idx) => (
                  <li key={idx} className={cn(
                    'flex items-start gap-2 text-sm leading-relaxed',
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  )}>
                    <span className={cn(
                      'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                      isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                    )} />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suitable Learning Areas */}
            <div className={cn(
              'rounded-2xl border p-5 space-y-3',
              isLight
                ? 'bg-blue-50/50 border-blue-200/50'
                : 'bg-blue-950/20 border-blue-800/30'
            )}>
              <h4 className={cn(
                'text-base font-bold flex items-center gap-2',
                isLight ? 'text-blue-900' : 'text-blue-200'
              )}>
                <span className={cn(
                  'size-2 rounded-full',
                  isLight ? 'bg-blue-600' : 'bg-blue-400'
                )} />
                Suitable Learning Areas
              </h4>
              <ul className="space-y-2">
                {getLearningAreas(primary, language).map((area, idx) => (
                  <li key={idx} className={cn(
                    'flex items-start gap-2 text-sm leading-relaxed',
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  )}>
                    <span className={cn(
                      'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                      isLight ? 'bg-blue-600' : 'bg-blue-400'
                    )} />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Suggestions */}
            <div className={cn(
              'rounded-2xl border p-5 space-y-3',
              isLight
                ? 'bg-purple-50/50 border-purple-200/50'
                : 'bg-purple-950/20 border-purple-800/30'
            )}>
              <h4 className={cn(
                'text-base font-bold flex items-center gap-2',
                isLight ? 'text-purple-900' : 'text-purple-200'
              )}>
                <span className={cn(
                  'size-2 rounded-full',
                  isLight ? 'bg-purple-600' : 'bg-purple-400'
                )} />
                How to Grow
              </h4>
              <ul className="space-y-2">
                {getGrowthSuggestions(primary, language).map((suggestion, idx) => (
                  <li key={idx} className={cn(
                    'flex items-start gap-2 text-sm leading-relaxed',
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  )}>
                    <span className={cn(
                      'mt-1.5 size-1.5 rounded-full flex-shrink-0',
                      isLight ? 'bg-purple-600' : 'bg-purple-400'
                    )} />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <button className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition',
            isLight
              ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
              : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
          )}>
            See What This Means for Learning
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

// Helper function to get learning areas based on RIASEC type
function getLearningAreas(type: RiasecKey, language: 'en' | 'my'): string[] {
  const areas: Record<RiasecKey, Record<'en' | 'my', string[]>> = {
    R: {
      en: [
        'Applied technology and systems',
        'Hands-on problem-solving',
        'Technical implementation'
      ],
      my: [
        'Teknologi terapan dan sistem',
        'Penyelesaian masalah praktikal',
        'Pelaksanaan teknikal'
      ]
    },
    I: {
      en: [
        'Analytical thinking and research',
        'Data and algorithms',
        'Systematic problem-solving'
      ],
      my: [
        'Pemikiran analitik dan penyelidikan',
        'Data dan algoritma',
        'Penyelesaian masalah sistematik'
      ]
    },
    A: {
      en: [
        'Creative design and expression',
        'User experience and interface',
        'Visual communication'
      ],
      my: [
        'Reka bentuk kreatif dan ekspresi',
        'Pengalaman dan antara muka pengguna',
        'Komunikasi visual'
      ]
    },
    S: {
      en: [
        'Collaborative learning',
        'Communication and support',
        'User-centered design'
      ],
      my: [
        'Pembelajaran kolaboratif',
        'Komunikasi dan sokongan',
        'Reka bentuk berpusatkan pengguna'
      ]
    },
    E: {
      en: [
        'Project management and planning',
        'Strategic thinking',
        'Leadership and coordination'
      ],
      my: [
        'Pengurusan dan perancangan projek',
        'Pemikiran strategik',
        'Kepimpinan dan penyelarasan'
      ]
    },
    C: {
      en: [
        'Structured systems and processes',
        'Data organization',
        'Quality assurance'
      ],
      my: [
        'Sistem dan proses berstruktur',
        'Organisasi data',
        'Jaminan kualiti'
      ]
    }
  }
  return areas[type][language]
}

// Helper function to get growth suggestions based on RIASEC type
function getGrowthSuggestions(type: RiasecKey, language: 'en' | 'my'): string[] {
  const suggestions: Record<RiasecKey, Record<'en' | 'my', string[]>> = {
    R: {
      en: [
        'Build projects that solve real problems',
        'Practice with actual tools and systems',
        'Join hands-on workshops and labs'
      ],
      my: [
        'Bina projek yang menyelesaikan masalah sebenar',
        'Berlatih dengan alatan dan sistem sebenar',
        'Sertai bengkel dan makmal praktikal'
      ]
    },
    I: {
      en: [
        'Explore complex problems step by step',
        'Read technical documentation deeply',
        'Challenge yourself with advanced concepts'
      ],
      my: [
        'Terokai masalah kompleks langkah demi langkah',
        'Baca dokumentasi teknikal dengan mendalam',
        'Cabarkan diri dengan konsep lanjutan'
      ]
    },
    A: {
      en: [
        'Create portfolio projects regularly',
        'Experiment with different design styles',
        'Seek feedback on visual work'
      ],
      my: [
        'Cipta projek portfolio secara berkala',
        'Eksperimen dengan gaya reka bentuk berbeza',
        'Dapatkan maklum balas tentang kerja visual'
      ]
    },
    S: {
      en: [
        'Join study groups and discussions',
        'Teach concepts to others',
        'Work on team projects'
      ],
      my: [
        'Sertai kumpulan belajar dan perbincangan',
        'Ajarkan konsep kepada orang lain',
        'Bekerja pada projek berkumpulan'
      ]
    },
    E: {
      en: [
        'Take on leadership roles in projects',
        'Practice planning and organizing',
        'Develop communication skills'
      ],
      my: [
        'Ambil peranan kepimpinan dalam projek',
        'Berlatih merancang dan mengatur',
        'Kembangkan kemahiran komunikasi'
      ]
    },
    C: {
      en: [
        'Follow structured learning paths',
        'Practice systematic approaches',
        'Focus on accuracy and detail'
      ],
      my: [
        'Ikuti laluan pembelajaran berstruktur',
        'Berlatih pendekatan sistematik',
        'Fokus pada ketepatan dan perincian'
      ]
    }
  }
  return suggestions[type][language]
}
