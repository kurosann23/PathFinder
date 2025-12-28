import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useUserProgress } from '../context/UserProgressContext'
import { cn } from '../lib/cn'
import {
  IconBook,
  IconCheck,
  IconClipboard,
  IconGamepad,
  IconMap,
  IconPin,
  IconTarget,
  IconUser,
} from '../components/icons'

type RoadmapNodeKey =
  | 'profile'
  | 'psychometric'
  | 'careerPath'
  | 'track'
  | 'skills'
  | 'tools'
  | 'projects'
  | 'minigame'
  | 'futureRole'

type Accent = 'blue' | 'emerald' | 'violet' | 'orange'

type RoadmapNode = {
  key: RoadmapNodeKey
  title: string
  badge: string
  bullets: string[]
  detailTitle: string
  detailText: string
  cta: { label: string; to: string }
  accent: Accent
  icon: (props: { className?: string }) => ReactNode
}

function IconBadge(props: { accent: Accent; children: ReactNode }) {
  const { accent, children } = props
  const styles: Record<Accent, string> = {
    blue: 'bg-blue-600/20 text-blue-100 ring-blue-500/25',
    emerald: 'bg-emerald-600/20 text-emerald-100 ring-emerald-500/25',
    violet: 'bg-violet-600/20 text-violet-100 ring-violet-500/25',
    orange: 'bg-orange-600/20 text-orange-100 ring-orange-500/25',
  }
  return (
    <span className={cn('grid size-11 place-items-center rounded-2xl ring-1', styles[accent])}>
      {children}
    </span>
  )
}

function ArrowRight() {
  return (
    <div className="hidden items-center justify-center px-3 lg:flex">
      <svg width="44" height="18" viewBox="0 0 44 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 9H40" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 2l8 7-8 7" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ArrowLeft() {
  return (
    <div className="hidden items-center justify-center px-3 lg:flex">
      <svg width="44" height="18" viewBox="0 0 44 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 9H4" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 2 2 9l8 7" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ArrowDown() {
  return (
    <div className="hidden items-center justify-center py-3 lg:flex">
      <svg width="18" height="44" viewBox="0 0 18 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1v38" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 34l7 8 7-8" stroke="rgba(148,163,184,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function accentClasses(accent: Accent) {
  switch (accent) {
    case 'emerald':
      return {
        node: 'bg-emerald-600/15 ring-emerald-500/25 text-emerald-100',
        line: 'bg-emerald-500/30',
        glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_25px_rgba(16,185,129,0.10)]',
      }
    case 'violet':
      return {
        node: 'bg-violet-600/15 ring-violet-500/25 text-violet-100',
        line: 'bg-violet-500/30',
        glow: 'shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_0_25px_rgba(139,92,246,0.10)]',
      }
    case 'orange':
      return {
        node: 'bg-orange-600/15 ring-orange-500/25 text-orange-100',
        line: 'bg-orange-500/30',
        glow: 'shadow-[0_0_0_1px_rgba(249,115,22,0.25),0_0_25px_rgba(249,115,22,0.10)]',
      }
    default:
      return {
        node: 'bg-blue-600/15 ring-blue-500/25 text-blue-100',
        line: 'bg-blue-500/30',
        glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_0_25px_rgba(59,130,246,0.10)]',
      }
  }
}

export function LearningRoadmapPage() {
  const { progress } = useUserProgress()
  const [selected, setSelected] = useState<RoadmapNodeKey>('psychometric')

  const stepStatus = useMemo(() => {
    return {
      profile: progress.journey.profile,
      psychometric: progress.journey.psychometric,
      course: progress.journey.course,
      roadmap: progress.journey.roadmap,
      minigame: progress.journey.minigame,
    } as const
  }, [progress.journey])

  const nodes: RoadmapNode[] = useMemo(() => {
    const pathTitle = progress.careerPathReport?.primaryPath?.title ?? 'Technology Career Path'
    const topMatch = progress.courseRecommendations?.[0]?.subDomain ?? 'Top Technology Track'
    return [
      {
        key: 'profile',
        title: 'Profile',
        badge: 'Start',
        bullets: ['Your interests', 'Your goal', 'Your context'],
        detailTitle: 'Complete Profile',
        detailText:
          'This step gives basic context so the system can explain guidance in a way that fits you (still frontend-only).',
        cta: { label: 'Go to Profile', to: '/profile' },
        accent: 'blue',
        icon: ({ className }) => <IconUser size={20} className={className} />,
      },
      {
        key: 'psychometric',
        title: 'Psychometric',
        badge: 'RIASEC',
        bullets: ['Test Mode', '24 statements', 'Retake anytime'],
        detailTitle: 'Take Psychometric Test',
        detailText:
          'Answer one question at a time. The system uses your responses to calculate RIASEC and generate guidance.',
        cta: { label: 'Go to Psychometric Test', to: '/psychometric-test' },
        accent: 'emerald',
        icon: ({ className }) => <IconClipboard size={20} className={className} />,
      },
      {
        key: 'careerPath',
        title: 'Career Path',
        badge: 'Who I am',
        bullets: ['Your direction', 'Your style', 'Your strengths'],
        detailTitle: 'Career Path Guidance',
        detailText:
          'This explains “who you are”, “what you will generally learn”, and “what you may become” in simple language.',
        cta: { label: 'View Guidance', to: '/psychometric-test' },
        accent: 'violet',
        icon: ({ className }) => <IconTarget size={20} className={className} />,
      },
      {
        key: 'track',
        title: 'Pick Track',
        badge: 'Choose',
        bullets: ['Top match', 'Compare 3', 'Decide 1'],
        detailTitle: `Choose a Track: ${topMatch}`,
        detailText:
          'Pick one technology direction first. This keeps your next steps clear instead of overwhelming.',
        cta: { label: 'Go to Course Recommendations', to: '/course-recommendation' },
        accent: 'blue',
        icon: ({ className }) => <IconBook size={20} className={className} />,
      },
      {
        key: 'skills',
        title: 'Core Skills',
        badge: 'Learn',
        bullets: ['Basics first', 'Build confidence', 'Stay consistent'],
        detailTitle: 'Build Core Skills (Conceptual)',
        detailText:
          'Focus on foundational skills that support your chosen track. The goal is confidence, not grades.',
        cta: { label: 'Explore Suggested Courses', to: '/course-recommendation' },
        accent: 'emerald',
        icon: ({ className }) => <IconMap size={20} className={className} />,
      },
      {
        key: 'tools',
        title: 'Tools',
        badge: 'Hands-on',
        bullets: ['Tools list', 'Setup basics', 'Practice'],
        detailTitle: 'Tools You’ll Use',
        detailText:
          'Use the tools suggested in your recommendation. Tools make learning practical and measurable.',
        cta: { label: 'See Tools', to: '/course-recommendation' },
        accent: 'violet',
        icon: ({ className }) => <IconPin size={20} className={className} />,
      },
      {
        key: 'projects',
        title: 'Projects',
        badge: 'Prove it',
        bullets: ['1 starter', 'Finish it', 'Show results'],
        detailTitle: 'Starter Projects',
        detailText:
          'Projects turn learning into evidence. Start with one simple project and complete it before moving on.',
        cta: { label: 'View Projects', to: '/course-recommendation' },
        accent: 'orange',
        icon: ({ className }) => <IconCheck size={20} className={className} />,
      },
      {
        key: 'minigame',
        title: 'Mini Activity',
        badge: 'Motivate',
        bullets: ['Short break', 'Stay engaged', 'Come back'],
        detailTitle: 'Mini Activities',
        detailText:
          'Small activities help motivation. Use them as a break between learning sessions.',
        cta: { label: 'Go to Mini Games', to: '/mini-games' },
        accent: 'blue',
        icon: ({ className }) => <IconGamepad size={20} className={className} />,
      },
      {
        key: 'futureRole',
        title: 'Future Role',
        badge: 'Outcome',
        bullets: ['A role target', 'A portfolio', 'A direction'],
        detailTitle: `Your Direction: ${pathTitle}`,
        detailText:
          'This is your long-term direction. You can retake the test or switch tracks as your interests grow.',
        cta: { label: 'Review Career Path', to: '/psychometric-test' },
        accent: 'emerald',
        icon: ({ className }) => <IconTarget size={20} className={className} />,
      },
    ]
  }, [progress.careerPathReport?.primaryPath?.title, progress.courseRecommendations])

  const nodeStatus = useMemo(() => {
    return {
      profile: stepStatus.profile,
      psychometric: stepStatus.psychometric,
      careerPath: stepStatus.psychometric,
      track: stepStatus.course,
      skills: stepStatus.course,
      tools: stepStatus.roadmap,
      projects: stepStatus.roadmap,
      minigame: stepStatus.minigame,
      futureRole: stepStatus.roadmap,
    } as const
  }, [stepStatus])

  const completedCount = useMemo(() => {
    const keys: RoadmapNodeKey[] = ['profile', 'psychometric', 'careerPath', 'track', 'skills', 'tools', 'projects', 'minigame', 'futureRole']
    return keys.filter((k) => nodeStatus[k]).length
  }, [nodeStatus])

  const overallPercent = useMemo(() => {
    return Math.round((completedCount / nodes.length) * 100)
  }, [completedCount])

  const activeNode = useMemo(() => nodes.find((s) => s.key === selected) ?? nodes[0], [selected, nodes])

  const nextRecommended = useMemo(() => {
    return nodes.find((n) => !nodeStatus[n.key]) ?? null
  }, [nodes, nodeStatus])

  function RoadmapNodeCard(props: { node: RoadmapNode; active: boolean }) {
    const { node, active } = props
    const accent = accentClasses(node.accent)
    const done = nodeStatus[node.key]
    return (
      <button
        type="button"
        onClick={() => setSelected(node.key)}
        className={cn(
          'group w-full rounded-3xl border bg-slate-950/25 px-4 py-4 text-left transition hover:bg-slate-900/40',
          active ? 'border-blue-500/35 ring-1 ring-blue-500/15' : 'border-slate-800/70',
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn('shrink-0 rounded-3xl ring-1', accent.node, active && accent.glow)}>
            <div className="p-3">
              <IconBadge accent={node.accent}>
                {done ? <IconCheck size={18} className="text-emerald-200" /> : node.icon({ className: 'text-current' })}
              </IconBadge>
            </div>
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/40 px-3 py-1 text-[11px] font-semibold text-slate-200 ring-1 ring-slate-800/70">
              {node.badge}
            </div>
            <div className={cn('mt-2 text-base font-semibold', active ? 'text-blue-100' : 'text-slate-100')}>
              {node.title}
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
              {node.bullets.slice(0, 3).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
          Roadmap To Learn{' '}
          <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-sky-300 bg-clip-text text-transparent">
            Technology
          </span>
        </div>
        <div className="text-sm text-slate-400">
          Visual guidance only (not an LMS). Click each node to see what it means and what to do next.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card title="Roadmap Progress" className="xl:col-span-2">
          <div className="space-y-4">
            <ProgressBar label="Overall" value={overallPercent} barClass="bg-violet-400" />
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-slate-100">
                  {completedCount} / {nodes.length} steps completed
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  {overallPercent}%
                </div>
              </div>
              {nextRecommended && (
                <div className="mt-2 text-xs text-slate-400">
                  Recommended next step:{' '}
                  <span className="font-semibold text-slate-200">
                    {nextRecommended.detailTitle}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-400">
              Tip: This roadmap is guidance-oriented. Focus on small, repeatable goals and improve week by week.
            </div>
          </div>
        </Card>

        <Card title="Visual Roadmap (Infographic Style)" right={<span className="text-xs text-slate-400">Like your reference</span>} className="xl:col-span-3">
          {/* Desktop infographic: 3x3 snake layout */}
          <div className="hidden lg:block">
            <div className="space-y-4">
              <div className="flex items-stretch">
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[0]} active={selected === nodes[0]?.key} />
                </div>
                <ArrowRight />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[1]} active={selected === nodes[1]?.key} />
                </div>
                <ArrowRight />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[2]} active={selected === nodes[2]?.key} />
                </div>
              </div>

              <div className="flex justify-end">
                <ArrowDown />
              </div>

              <div className="flex items-stretch">
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[5]} active={selected === nodes[5]?.key} />
                </div>
                <ArrowLeft />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[4]} active={selected === nodes[4]?.key} />
                </div>
                <ArrowLeft />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[3]} active={selected === nodes[3]?.key} />
                </div>
              </div>

              <div className="flex justify-start">
                <ArrowDown />
              </div>

              <div className="flex items-stretch">
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[6]} active={selected === nodes[6]?.key} />
                </div>
                <ArrowRight />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[7]} active={selected === nodes[7]?.key} />
                </div>
                <ArrowRight />
                <div className="flex-1">
                  <RoadmapNodeCard node={nodes[8]} active={selected === nodes[8]?.key} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: simple vertical list (still clickable) */}
          <div className="lg:hidden">
            <div className="space-y-3">
              {nodes.map((n) => (
                <RoadmapNodeCard key={n.key} node={n} active={selected === n.key} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Node Details"
        right={
          <span className="text-xs text-slate-400">
            {activeNode.key.toUpperCase()}
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-400">Selected node</div>
                <div className="mt-2 text-lg font-semibold text-slate-100">{activeNode.detailTitle}</div>
                <div className="mt-1 text-sm text-slate-300/90">{activeNode.title}</div>
              </div>
              <div className="shrink-0 rounded-2xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
                {nodeStatus[activeNode.key] ? 'Done' : 'Next'}
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-300/90">{activeNode.detailText}</div>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4">
            <div className="text-xs font-semibold text-slate-400">Quick actions</div>
            <div className="mt-3 space-y-2">
              {activeNode.bullets.map((b) => (
                <div key={b} className="flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  <span className="mt-0.5 block size-2 rounded-full bg-blue-300/80" />
                  <span className="leading-snug">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4">
            <div className="text-xs font-semibold text-slate-400">Action</div>
            <div className="mt-2 text-sm text-slate-300/90">
              Jump to the relevant page to complete this step.
            </div>
            <div className="mt-4">
              <Link
                to={activeNode.cta.to}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
              >
                {activeNode.cta.label}
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
              <IconPin size={16} className="text-slate-300" />
              This roadmap is guidance-only (no grading, no syllabus).
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


