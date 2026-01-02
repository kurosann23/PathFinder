 import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { cn } from '../lib/cn'
import { IconPin, IconTarget, IconX, IconChevronDown, IconMap, IconArrowRight, IconShield, IconWrench, IconBrowser, IconMegaphone, IconGamepad, IconRocket, IconBook, IconFolder, IconFolderDashed, IconSettings } from '../components/icons'

// Helper function to get path icon based on subDomain
function PathIcon({ subDomain, className }: { subDomain: string; className?: string }) {
  const isSoftware = subDomain.toLowerCase().includes('software') || subDomain.toLowerCase().includes('engineering')
  const isData = subDomain.toLowerCase().includes('data') || subDomain.toLowerCase().includes('analytics')
  const isAI = subDomain.toLowerCase().includes('ai') || subDomain.toLowerCase().includes('machine learning') || subDomain.toLowerCase().includes('ml')
  const isDesign = subDomain.toLowerCase().includes('design') || subDomain.toLowerCase().includes('frontend') || subDomain.toLowerCase().includes('ui')

  if (isSoftware) {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-blue-400">
          {/* Laptop base */}
          <rect x="10" y="25" width="60" height="40" rx="2.5" fill="currentColor" opacity="0.15" />
          <rect x="12" y="27" width="56" height="36" rx="1.5" fill="currentColor" opacity="0.08" />
          {/* Code lines - horizontal lines */}
          <line x1="20" y1="35" x2="30" y2="35" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
          <line x1="20" y1="42" x2="40" y2="42" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
          <line x1="20" y1="49" x2="35" y2="49" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
          <line x1="20" y1="56" x2="45" y2="56" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
        </svg>
      </div>
    )
  }
  if (isData) {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-purple-400">
          {/* Laptop base */}
          <rect x="10" y="25" width="60" height="40" rx="2.5" fill="currentColor" opacity="0.15" />
          <rect x="12" y="27" width="56" height="36" rx="1.5" fill="currentColor" opacity="0.08" />
          {/* Chart bars */}
          <rect x="22" y="48" width="8" height="12" fill="currentColor" opacity="0.9" />
          <rect x="35" y="40" width="8" height="20" fill="currentColor" opacity="0.9" />
          <rect x="48" y="35" width="8" height="25" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    )
  }
  if (isAI) {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-teal-400">
          {/* Laptop base */}
          <rect x="10" y="25" width="60" height="40" rx="2.5" fill="currentColor" opacity="0.15" />
          <rect x="12" y="27" width="56" height="36" rx="1.5" fill="currentColor" opacity="0.08" />
          {/* Diamond shapes for AI/ML */}
          <path d="M 32 35 L 40 30 L 48 35 L 40 40 Z" fill="currentColor" opacity="0.9" />
          <path d="M 32 50 L 40 45 L 48 50 L 40 55 Z" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    )
  }
  // Default to design/frontend icon
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-teal-400">
        {/* Laptop base */}
        <rect x="10" y="25" width="60" height="40" rx="2.5" fill="currentColor" opacity="0.15" />
        <rect x="12" y="27" width="56" height="36" rx="1.5" fill="currentColor" opacity="0.08" />
        {/* Pencil/stylus */}
        <path d="M 48 30 L 60 42 L 52 50 L 40 38 Z" fill="currentColor" opacity="0.9" />
        <line x1="48" y1="30" x2="40" y2="38" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
      </svg>
    </div>
  )
}

// Get short description for path cards
function getPathDescription(subDomain: string): string {
  const lower = subDomain.toLowerCase()
  const isSoftware = lower.includes('software') || lower.includes('engineering')
  const isData = lower.includes('data') || lower.includes('analytics')
  const isDesign = lower.includes('design') || lower.includes('frontend') || lower.includes('ui')
  const isCybersecurity = lower.includes('cybersecurity') || lower.includes('security')
  const isITSupport = lower.includes('it support') || lower.includes('support')
  const isMarketing = lower.includes('marketing')
  const isGame = lower.includes('game')
  const isEntrepreneurship = lower.includes('entrepreneurship') || lower.includes('startup')

  if (isSoftware) {
    return 'Build applications and systems using structured logic.'
  }
  if (isData) {
    return 'Analyze data to uncover patterns and insights.'
  }
  if (isDesign) {
    return 'Design user-friendly interfaces and interactive websites.'
  }
  if (isCybersecurity) {
    return 'Learn to protect networks and secure systems.'
  }
  if (isITSupport) {
    return 'Help maintain and support computer systems.'
  }
  if (isMarketing) {
    return 'Use technology to reach and engage audiences.'
  }
  if (isGame) {
    return 'Create interactive video games and simulations.'
  }
  if (isEntrepreneurship) {
    return 'Start your own tech business by solving problems.'
  }
  return 'Explore technology skills and build real-world projects.'
}

export function CourseRecommendationPage() {
  const { progress } = useUserProgress()

  const isReady = progress.psychometricCompleted
  const recommendations = progress.courseRecommendations
  const top3 = useMemo(() => recommendations.slice(0, 3), [recommendations])

  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{
    focuses: boolean
    workOn: boolean
    tools: boolean
    projects: boolean
  }>({
    focuses: true,
    workOn: false,
    tools: false,
    projects: false,
  })

  // Mock data for additional paths
  const additionalPathsData: Record<string, { subDomain: string; explanation: string; tools: string[]; starterProjects: string[] }> = {
    'Cybersecurity': {
      subDomain: 'Cybersecurity',
      explanation: 'Learn to protect networks and secure systems from threats. This path focuses on security fundamentals, network protection, and ethical hacking practices.',
      tools: ['Wireshark', 'Metasploit', 'Nmap', 'Burp Suite', 'Kali Linux'],
      starterProjects: [
        'Set up a basic firewall configuration',
        'Perform a security audit on a test network',
      ],
    },
    'IT Support': {
      subDomain: 'IT Support',
      explanation: 'Help maintain and support computer systems for organizations. This path covers troubleshooting, system administration, and user support.',
      tools: ['Windows Server', 'Active Directory', 'Remote Desktop', 'Ticketing Systems'],
      starterProjects: [
        'Create a troubleshooting guide for common issues',
        'Set up a help desk ticketing system',
      ],
    },
    'UX/UI Design': {
      subDomain: 'UX/UI Design',
      explanation: 'Design engaging and user-friendly interfaces that users love. This path focuses on user research, wireframing, prototyping, and visual design principles.',
      tools: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle'],
      starterProjects: [
        'Design a mobile app interface from scratch',
        'Create a design system for a web application',
      ],
    },
    'Digital Marketing': {
      subDomain: 'Digital Marketing',
      explanation: 'Use technology to reach and engage audiences effectively. This path covers SEO, social media marketing, content strategy, and analytics.',
      tools: ['Google Analytics', 'SEMrush', 'Hootsuite', 'Mailchimp', 'Canva'],
      starterProjects: [
        'Run a social media campaign for a small business',
        'Create and analyze a content marketing strategy',
      ],
    },
    'Game Development': {
      subDomain: 'Game Development',
      explanation: 'Create interactive video games and simulations. This path covers game design, programming, graphics, and game engines.',
      tools: ['Unity', 'Unreal Engine', 'Godot', 'Blender', 'C#'],
      starterProjects: [
        'Build a simple 2D platformer game',
        'Create a basic 3D game environment',
      ],
    },
    'IT Entrepreneurship': {
      subDomain: 'IT Entrepreneurship',
      explanation: 'Start your own tech business by solving problems with technology. This path combines technical skills with business acumen and startup fundamentals.',
      tools: ['Business Model Canvas', 'Lean Startup', 'Agile', 'Project Management Tools'],
      starterProjects: [
        'Develop a minimum viable product (MVP)',
        'Create a business plan for a tech startup',
      ],
    },
  }

  const selected = useMemo(() => {
    if (!selectedPath) return null
    // First check top3 recommendations
    const fromRecommendations = top3.find((r) => r.subDomain === selectedPath)
    if (fromRecommendations) return fromRecommendations
    // Then check additional paths
    const additionalData = additionalPathsData[selectedPath]
    if (additionalData) {
      return {
        subDomain: additionalData.subDomain,
        matchPercent: 75,
        explanation: additionalData.explanation,
        suggestedCourses: [],
        starterProjects: additionalData.starterProjects,
        tools: additionalData.tools,
      }
    }
    return null
  }, [top3, selectedPath])

  useEffect(() => {
    if (selectedPath) {
      setExpandedSections({
        focuses: true,
        workOn: false,
        tools: false,
        projects: false,
      })
    }
  }, [selectedPath])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Choose a Technology Learning Path"
        subtitle="Click a path to see what you'll actually learn and work on."
      />

      {!isReady ? (
        <Card title="Complete the Psychometric Test first">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Complete the <span className="font-semibold text-slate-100">Psychometric Test</span>{' '}
              to generate your personalized recommendations.
            </p>
            <p className="text-xs text-slate-400">
              This is frontend-only (dummy data). No database or authentication is used.
            </p>
            <div className="pt-2">
              <Link
                to="/psychometric-test"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
              >
                Go to Psychometric Test
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* RIASEC Tags */}
          {progress.psychometricResult && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                RIASEC: {progress.psychometricResult}
                </span>
                {progress.careerPathReport?.primaryPath && (
                  <span className="rounded-xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
                    Career Path: {progress.careerPathReport.primaryPath.title}
                  </span>
                )}
              </div>
          )}

          {/* Path Cards */}
          {top3.length === 0 ? (
            <Card title="No recommendations found">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                  Please submit the Psychometric Test to generate your course recommendations.
                </div>
                <Link
                  to="/psychometric-test"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  Go to Psychometric Test
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="relative">
                {/* Main Path Cards - Bigger and Highlighted */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {top3.map((rec) => (
                      <button
                        key={rec.subDomain}
                        type="button"
                      onClick={() => setSelectedPath(rec.subDomain)}
                        className={cn(
                        'group relative overflow-hidden rounded-3xl border-2 border-slate-800/70 bg-slate-950/30 p-8 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/40 hover:shadow-xl hover:shadow-blue-500/10',
                        'before:pointer-events-none before:absolute before:inset-0 before:opacity-80',
                        'before:bg-[radial-gradient(500px_circle_at_50%_50%,rgba(59,130,246,0.12),transparent_70%)]',
                        'ring-1 ring-blue-500/20',
                        )}
                      >
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6 flex items-center justify-center">
                          <PathIcon subDomain={rec.subDomain} />
                            </div>
                        <h3 className="mb-3 text-xl font-semibold text-slate-100">{rec.subDomain}</h3>
                        <p className="mb-6 text-base text-slate-400">{getPathDescription(rec.subDomain)}</p>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600/20 px-5 py-2.5 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                          View Details <IconArrowRight size={16} />
                            </div>
                          </div>
                    </button>
                  ))}
                          </div>
                        </div>

              {/* Popup Modal - Centered with Focus Mode */}
              {selected && (
                <>
                  {/* Backdrop - Focus Mode */}
                  <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                    onClick={() => setSelectedPath(null)}
                  />
                  {/* Modal - Centered - Bigger */}
                  <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-800/70 bg-slate-950/95 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-2xl font-semibold text-slate-100">{selected.subDomain}</h2>
                          <p className="mt-1 text-base text-slate-400">{getPathDescription(selected.subDomain)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPath(null)}
                          className="shrink-0 rounded-full bg-slate-900/60 p-2 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                        >
                          <IconX size={18} />
                        </button>
                      </div>

                      {/* Expandable Sections */}
                      <div className="space-y-3">
                        {/* What this path focuses on */}
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30">
                          <button
                            type="button"
                            onClick={() => toggleSection('focuses')}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <IconBook size={18} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-200">What this path focuses on</span>
                            </div>
                            <IconChevronDown
                              size={16}
                              className={cn(
                                'text-slate-400 transition-transform',
                                expandedSections.focuses && 'rotate-180',
                              )}
                            />
                          </button>
                          {expandedSections.focuses && (
                            <div className="border-t border-slate-800/70 px-4 py-3 text-sm text-slate-300/90">
                      {selected.explanation}
                            </div>
                          )}
                    </div>

                        {/* What you'll work on */}
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30">
                          <button
                            type="button"
                            onClick={() => toggleSection('workOn')}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <IconWrench size={18} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-200">What you'll work on</span>
                            </div>
                            <IconChevronDown
                              size={16}
                              className={cn(
                                'text-slate-400 transition-transform',
                                expandedSections.workOn && 'rotate-180',
                              )}
                            />
                          </button>
                          {expandedSections.workOn && (
                            <div className="border-t border-slate-800/70 px-4 py-3 text-sm text-slate-300/90">
                              {selected.explanation}
                              {selected.starterProjects && selected.starterProjects.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {selected.starterProjects.slice(0, 2).map((project, idx) => (
                                    <div key={idx} className="text-xs text-slate-400">• {project}</div>
                                  ))}
                    </div>
                              )}
                          </div>
                          )}
                        </div>

                        {/* Tools you'll use */}
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30">
                          <button
                            type="button"
                            onClick={() => toggleSection('tools')}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <IconSettings size={18} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-200">Tools you'll use</span>
                            </div>
                            <IconChevronDown
                              size={16}
                              className={cn(
                                'text-slate-400 transition-transform',
                                expandedSections.tools && 'rotate-180',
                              )}
                            />
                          </button>
                          {expandedSections.tools && (
                            <div className="border-t border-slate-800/70 px-4 py-3">
                              <div className="mb-4 flex flex-wrap gap-2">
                                {(selected.tools ?? []).map((tool) => (
                                  <span
                                    key={tool}
                                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-1.5 text-sm font-semibold text-slate-200"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                              {/* Real tool examples with visual representations */}
                              <div className="grid grid-cols-2 gap-4">
                                {(selected.tools ?? []).slice(0, 2).map((tool, idx) => {
                                  const toolLower = tool.toLowerCase()
                                  const isGit = toolLower.includes('git')
                                  const isVSCode = toolLower.includes('vs code') || toolLower.includes('code')
                                  const isPostman = toolLower.includes('postman') || toolLower.includes('insomnia')
                                  
                                  return (
                                    <div key={idx} className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
                                      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-slate-800/50 p-4">
                                        {isGit ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
                                              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z"/>
                                            </svg>
                                            <div className="text-xs font-semibold text-slate-300">Git & GitHub</div>
                                          </div>
                                        ) : isVSCode ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                                              <path d="M17.5 2l4.5 4.5v11l-4.5 4.5h-11L2 17.5v-11L6.5 2h11zm-1.06 3.94L12 10.88 7.56 5.94 6.5 7l4.44 4.44L6.5 15.88l1.06 1.06L12 13l4.44 3.94 1.06-1.06L13 11.44 17.44 7l-1.06-1.06z"/>
                                            </svg>
                                            <div className="text-xs font-semibold text-slate-300">VS Code</div>
                                          </div>
                                        ) : isPostman ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
                                              <path d="M7.5 2.5c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-15c0-1.1-.9-2-2-2h-9zm0 2h9v15h-9v-15zm1 2v2h7v-2h-7zm0 3v2h7v-2h-7zm0 3v2h5v-2h-5z"/>
                                            </svg>
                                            <div className="text-xs font-semibold text-slate-300">API Testing</div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                                              <IconSettings size={24} className="text-blue-400" />
                                            </div>
                                            <div className="text-xs font-semibold text-slate-300">{tool}</div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-xs font-semibold text-slate-400">
                                        {tool} workspace preview
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Example beginner projects */}
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30">
                          <button
                            type="button"
                            onClick={() => toggleSection('projects')}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <IconFolderDashed size={18} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-200">Example beginner projects</span>
                            </div>
                            <IconChevronDown
                              size={16}
                              className={cn(
                                'text-slate-400 transition-transform',
                                expandedSections.projects && 'rotate-180',
                              )}
                            />
                          </button>
                          {expandedSections.projects && (
                            <div className="border-t border-slate-800/70 px-4 py-3 text-sm text-slate-300/90">
                              {selected.starterProjects && selected.starterProjects.length > 0 ? (
                                <div className="space-y-2">
                                  {selected.starterProjects.map((project, idx) => (
                                    <div key={idx} className="text-sm text-slate-300/90">• {project}</div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-400">No projects available yet.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedPath(null)}
                        className="w-full rounded-xl bg-purple-600/20 border border-purple-500/30 px-4 py-3 text-base font-semibold text-slate-100 hover:bg-purple-600/30"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  </>
              )}
            </>
          )}

          {/* Other Technology Paths Section */}
          {top3.length > 0 && (
            <div className="space-y-6 mt-12">
              <h3 className="text-center text-lg font-semibold text-slate-200">
                Feel like trying something else? Here are some other technology paths.
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Cybersecurity */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('Cybersecurity')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-blue-600/20 p-2 ring-1 ring-blue-500/25">
                      <IconShield size={20} className="text-blue-400" />
                    </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Realistic
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">Cybersecurity</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Learn to protect networks and secure systems.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                  </div>
                </button>

                {/* IT Support */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('IT Support')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-purple-600/20 p-2 ring-1 ring-purple-500/25">
                      <IconWrench size={20} className="text-purple-400" />
                    </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Conventional
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">IT Support</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Help maintain and support computer systems.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                  </div>
                </button>

                {/* UX/UI Design */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('UX/UI Design')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-teal-600/20 p-2 ring-1 ring-teal-500/25">
                      <IconBrowser size={20} className="text-teal-400" />
                    </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Artistic
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">UX/UI Design</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Design engaging and user-friendly interfaces.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                  </div>
                </button>

                {/* Digital Marketing */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('Digital Marketing')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-orange-600/20 p-2 ring-1 ring-orange-500/25">
                      <IconMegaphone size={20} className="text-orange-400" />
                    </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Enterprising
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">Digital Marketing</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Use technology to reach and engage audiences.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                  </div>
                </button>

                {/* Game Development */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('Game Development')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-pink-600/20 p-2 ring-1 ring-pink-500/25">
                      <IconGamepad size={20} className="text-pink-400" />
                    </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Social
                            </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">Game Development</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Create interactive video games and simulations.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                          </div>
                </button>

                {/* IT Entrepreneurship */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('IT Entrepreneurship')}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-4 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="rounded-lg bg-emerald-600/20 p-2 ring-1 ring-emerald-500/25">
                      <IconRocket size={20} className="text-emerald-400" />
                        </div>
                    <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                      Enterprising
                    </span>
                      </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-100">IT Entrepreneurship</h4>
                  <p className="mb-2.5 text-xs text-slate-400 leading-relaxed">Start your own tech business by solving problems.</p>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-blue-500/25 group-hover:bg-blue-600/25">
                    View Details <IconArrowRight size={11} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
