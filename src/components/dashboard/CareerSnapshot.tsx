import { Link } from 'react-router-dom'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { CareerTraitKey } from '../../constants/dashboard'
import { Card } from '../ui/Card'
import { buttonClasses } from '../ui/buttonStyles'

type TraitDatum = {
  key: CareerTraitKey
  label: string
  value: number
}

function clamp100(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export function CareerSnapshot(props: {
  title?: string
  viewReportTo: string
  traits: TraitDatum[]
  topCareerTypeLabel: string
}) {
  const { title = 'Career Snapshot', viewReportTo, traits, topCareerTypeLabel } = props

  const data = traits.map((t) => ({
    trait: t.label,
    value: clamp100(t.value),
  }))

  const meaning = getMeaning(topCareerTypeLabel)

  return (
    <Card
      title={title}
      right={
        <Link to={viewReportTo} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
          View Full Report
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr_1fr] lg:items-center">
        <div className="space-y-2">
          {traits.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/18 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-5 place-items-center rounded-md border border-slate-800/60 bg-slate-950/20">
                  <span className="block size-2 rounded-sm bg-blue-200/80" />
                </span>
                <span className="truncate text-xs font-semibold text-slate-200/90">
                  {t.label}
                </span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-slate-300/70">
                {Math.round(clamp100(t.value))}
              </span>
            </div>
          ))}
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="74%">
              <PolarGrid stroke="rgba(148,163,184,0.14)" />
              <PolarAngleAxis
                dataKey="trait"
                tick={{ fill: 'rgba(203,213,225,0.78)', fontSize: 11, fontWeight: 600 }}
              />
              <Radar
                dataKey="value"
                stroke="rgba(59,130,246,0.9)"
                fill="rgba(59,130,246,0.20)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-100">{meaning.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-300/80">{meaning.body}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200">
              Top: {topCareerTypeLabel}
            </span>
            <span className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200">
              RIASEC Radar
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function getMeaning(topCareerTypeLabel: string) {
  const copy: Record<string, { title: string; body: string }> = {
    Conventional: {
      title: 'Well-organized and detail-oriented',
      body: 'You excel in structured environments and enjoy working with systems, data, and clear processes. Roles involving administration, operations, analysis, or finance often fit well.',
    },
    Investigative: {
      title: 'Analytical and curious',
      body: 'You thrive on problem-solving and learning. Roles involving research, engineering, data, or troubleshooting are often a strong match.',
    },
    Artistic: {
      title: 'Creative and expressive',
      body: 'You enjoy creating, exploring ideas, and producing original work. Roles involving design, content, UX, or creative tech often fit well.',
    },
    Social: {
      title: 'People-focused and supportive',
      body: 'You enjoy helping others learn and grow. Roles involving teaching, collaboration, community, or user success often fit well.',
    },
    Enterprising: {
      title: 'Ambitious and persuasive',
      body: 'You enjoy leading, initiating, and turning ideas into action. Roles involving product, business, marketing, or entrepreneurship often fit well.',
    },
    Realistic: {
      title: 'Hands-on and practical',
      body: 'You prefer building and doing. Roles involving technical implementation, systems, hardware, or applied engineering often fit well.',
    },
  }

  return (
    copy[topCareerTypeLabel] ?? {
      title: 'Your strengths are emerging',
      body: 'Complete the psychometric test to unlock a personalized interpretation and a clearer direction for your next steps.',
    }
  )
}


