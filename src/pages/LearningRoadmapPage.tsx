import { useMemo, useState, Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useUserProgress } from '../context/UserProgressContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { cn } from '../lib/cn'
import {
  IconBook,
  IconCheck,
  IconClipboard,
  IconTarget,
  IconUser,
} from '../components/icons'

type RoadmapNodeKey =
  | 'profile'
  | 'psychometric'
  | 'course'
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
  color: string // For the circle color
  stepNumber: number
}

export function LearningRoadmapPage() {
  const { progress } = useUserProgress()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isLight = theme === 'light'
  
  const [selected, setSelected] = useState<RoadmapNodeKey | null>(null)

  const stepStatus = useMemo(() => {
    return {
      profile: progress.journey.profile,
      psychometric: progress.journey.psychometric,
      course: progress.journey.course,
      futureRole: progress.journey.futureRole ?? false,
    } as const
  }, [progress.journey])

  const nodes: RoadmapNode[] = useMemo(() => {
    const pathTitle = progress.careerPathReport?.primaryPath?.title ?? 'Technology Career Path'
    return [
      {
        key: 'profile',
        title: t('roadmap.profile'),
        badge: 'Start',
        bullets: ['Your interests', 'Your goal', 'Your context'],
        detailTitle: t('roadmap.profileTitle'),
        detailText: t('roadmap.profileDesc'),
        cta: { label: t('roadmap.profileCta'), to: '/dashboard#profile' },
        accent: 'blue',
        icon: ({ className }) => <IconUser size={20} className={className} />,
        color: '#ef4444', // Red
        stepNumber: 1,
      },
      {
        key: 'psychometric',
        title: t('roadmap.test'),
        badge: 'RIASEC',
        bullets: ['Test Mode', '24 statements', 'Retake anytime'],
        detailTitle: t('roadmap.testTitle'),
        detailText: t('roadmap.testDesc'),
        cta: { label: t('roadmap.testCta'), to: '/psychometric-test' },
        accent: 'emerald',
        icon: ({ className }) => <IconClipboard size={20} className={className} />,
        color: '#f97316', // Orange
        stepNumber: 2,
      },
      {
        key: 'course',
        title: t('roadmap.career'),
        badge: 'Explore',
        bullets: ['Course recommendations', 'Learning paths', 'Skills to build'],
        detailTitle: t('roadmap.careerTitle'),
        detailText: t('roadmap.careerDesc'),
        cta: { label: t('roadmap.careerCta'), to: '/course-recommendation' },
        accent: 'blue',
        icon: ({ className }) => <IconBook size={20} className={className} />,
        color: '#22c55e', // Green
        stepNumber: 3,
      },
      {
        key: 'futureRole',
        title: t('roadmap.futureRoles'),
        badge: 'Outcome',
        bullets: ['A role target', 'A portfolio', 'A direction'],
        detailTitle: `${t('roadmap.futureRolesTitle')}: ${pathTitle}`,
        detailText: t('roadmap.futureRolesDesc'),
        cta: { label: t('roadmap.futureRolesCta'), to: '/psychometric-test' },
        accent: 'emerald',
        icon: ({ className }) => <IconTarget size={20} className={className} />,
        color: '#3b82f6', // Blue
        stepNumber: 4,
      },
    ]
  }, [progress.careerPathReport?.primaryPath?.title, t])

  const nodeStatus = useMemo(() => {
    return {
      profile: stepStatus.profile,
      psychometric: stepStatus.psychometric,
      course: stepStatus.course,
      futureRole: stepStatus.futureRole,
    } as const
  }, [stepStatus])

  const completedCount = useMemo(() => {
    const keys: RoadmapNodeKey[] = ['profile', 'psychometric', 'course', 'futureRole']
    return keys.filter((k) => nodeStatus[k]).length
  }, [nodeStatus])

  const overallPercent = useMemo(() => {
    if (nodes.length === 0) return 0
    return Math.round((completedCount / nodes.length) * 100)
  }, [completedCount, nodes.length])

  const nextRecommended = useMemo(() => {
    return nodes.find((n) => !nodeStatus[n.key]) ?? null
  }, [nodes, nodeStatus])

  const activeNode = useMemo(() => {
    if (selected) {
      return nodes.find((n) => n.key === selected) ?? nextRecommended ?? nodes[0]
    }
    return nextRecommended ?? nodes[0]
  }, [selected, nodes, nextRecommended])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className={cn(
          "text-3xl font-semibold tracking-tight md:text-4xl",
          isLight ? "text-slate-900" : "text-slate-100"
        )}>
          {t('roadmap.title')}
        </div>
        <div className={cn(
          "text-base",
          isLight ? "text-slate-600" : "text-slate-400"
        )}>
          {t('roadmap.subtitle')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title={t('roadmap.progress')} className="lg:col-span-2">
          <div className="space-y-4">
            <ProgressBar label="Overall" value={overallPercent} barClass="bg-violet-400" />
            <div className={cn(
              "rounded-2xl border px-4 py-3",
              isLight
                ? "border-slate-200 bg-slate-50"
                : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className="flex items-center justify-between gap-4">
                <div className={cn(
                  "text-base font-semibold",
                  isLight ? "text-slate-900" : "text-slate-100"
                )}>
                  {completedCount} / {nodes.length} {t('roadmap.stepsCompleted')}
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-slate-700" : "text-slate-300"
                )}>
                  {overallPercent}%
                </div>
              </div>
              {nextRecommended && (
                <div className={cn(
                  "mt-2 text-sm",
                  isLight ? "text-slate-600" : "text-slate-400"
                )}>
                  {t('roadmap.recommendedNext')}{' '}
                  <span className={cn(
                    "font-semibold",
                    isLight ? "text-slate-900" : "text-slate-200"
                  )}>
                    {nextRecommended.detailTitle}
                  </span>
                </div>
              )}
            </div>
            <div className={cn(
              "text-sm",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              {t('roadmap.tip')}
            </div>
          </div>
        </Card>

        <Card title="Visual Roadmap (Infographic Style)" right={<span className={cn("text-xs", isLight ? "text-slate-600" : "text-slate-400")}>4 {t('roadmap.stepsCompleted').split(' ')[0]}</span>} className="lg:col-span-3">
          {/* Infographic-style horizontal flow */}
          <div className="relative py-8 px-2">
            {/* Connecting line */}
            <div className="absolute top-12 sm:top-16 left-8 sm:left-10 right-8 sm:right-10 h-1 hidden sm:block">
              <div className="relative h-full w-full">
                {nodes.map((node, idx) => {
                  if (idx === nodes.length - 1) return null
                  const isCompleted = nodeStatus[node.key]
                  const nextNode = nodes[idx + 1]
                  const nextCompleted = nodeStatus[nextNode.key]
                  const lineColor = isCompleted && nextCompleted 
                    ? node.color 
                    : isCompleted 
                      ? node.color 
                      : isLight ? '#e2e8f0' : '#475569'
                  
                  return (
                    <div
                      key={`line-${idx}`}
                      className="absolute h-full"
                      style={{
                        left: `${(idx / (nodes.length - 1)) * 100}%`,
                        width: `${(1 / (nodes.length - 1)) * 100}%`,
                        backgroundColor: lineColor,
                        opacity: isCompleted || nextCompleted ? 1 : 0.3,
                      }}
                    />
                  )
                })}
              </div>
            </div>
            
            {/* Steps */}
            <div className="relative flex items-start justify-between gap-2 sm:gap-0">
              {nodes.map((node, idx) => {
                const isCompleted = nodeStatus[node.key]
                const isActive = selected === node.key || (!selected && node.key === nextRecommended?.key)
                
                return (
                  <button
                    key={node.key}
                    type="button"
                    onClick={() => setSelected(node.key)}
                    className="flex-1 flex flex-col items-center group relative z-10"
                  >
                    {/* Circle with number and icon */}
                    <div
                      className={cn(
                        "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                        isActive && "scale-110"
                      )}
                      style={{
                        backgroundColor: node.color,
                        boxShadow: isActive 
                          ? `0 10px 25px -5px ${node.color}60, 0 0 0 4px ${node.color}30`
                          : `0 4px 6px -1px ${node.color}40, 0 2px 4px -1px ${node.color}30`
                      }}
                    >
                      {/* Inner white circle */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex flex-col items-center justify-center">
                        {/* Icon */}
                        <div className="mb-0.5" style={{ color: node.color }}>
                          {isCompleted ? (
                            <IconCheck size={14} style={{ color: node.color }} />
                          ) : (
                            <div style={{ color: node.color }}>
                              {node.icon({ className: '' })}
                            </div>
                          )}
                        </div>
                        {/* Number */}
                        <div className="text-xs sm:text-sm font-bold" style={{ color: node.color }}>
                          {node.stepNumber}
                        </div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="mt-3 text-center w-full">
                      <div className={cn(
                        "text-xs sm:text-sm font-semibold mb-1",
                        isActive
                          ? isLight ? "text-slate-900" : "text-slate-100"
                          : isLight ? "text-slate-700" : "text-slate-300"
                      )}>
                        {node.title}
                      </div>
                      {isActive && (
                        <div className={cn(
                          "text-[10px] sm:text-xs mt-0.5",
                          isLight ? "text-slate-600" : "text-slate-400"
                        )}>
                          {node.badge}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {activeNode && (
        <Card
          title="Node Details"
          right={
            <span className={cn(
              "text-xs",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              {activeNode.key.toUpperCase()}
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className={cn(
                    "text-xs font-semibold",
                    isLight ? "text-slate-600" : "text-slate-400"
                  )}>
                    Selected node
                  </div>
                  <div className={cn(
                    "mt-2 text-lg font-semibold",
                    isLight ? "text-slate-900" : "text-slate-100"
                  )}>
                    {activeNode.detailTitle}
                  </div>
                </div>
              </div>
            </div>
            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className={cn(
                    "text-xs font-semibold",
                    isLight ? "text-slate-600" : "text-slate-400"
                  )}>
                    Description
                  </div>
                  <div className={cn(
                    "mt-2 text-base leading-relaxed",
                    isLight ? "text-slate-700" : "text-slate-300"
                  )}>
                    {activeNode.detailText}
                  </div>
                </div>
              </div>
            </div>
            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="min-w-0">
                  <div className={cn(
                    "text-xs font-semibold",
                    isLight ? "text-slate-600" : "text-slate-400"
                  )}>
                    Status
                  </div>
                  <div className={cn(
                    "mt-2 text-base font-semibold",
                    nodeStatus[activeNode.key]
                      ? isLight ? "text-emerald-700" : "text-emerald-300"
                      : isLight ? "text-slate-700" : "text-slate-300"
                  )}>
                    {nodeStatus[activeNode.key] ? t('common.completed') : t('common.inProgress')}
                  </div>
                </div>
                <Link
                  to={activeNode.cta.to}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-base font-semibold transition",
                    isLight
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {activeNode.cta.label}
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
