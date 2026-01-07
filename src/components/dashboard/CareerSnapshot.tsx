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
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/LanguageContext'
import { cn } from '../../lib/cn'

// Custom tick component to show full labels
function CustomTick({ payload, x, y, isLight }: any) {
  return (
    <text
      x={x}
      y={y}
      fill={isLight ? 'rgba(71,85,105,0.9)' : 'rgba(203,213,225,0.9)'}
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {payload.value}
    </text>
  )
}

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
  const { t } = useTranslation()
  const { title = t('dashboard.careerSnapshot'), viewReportTo, traits, topCareerTypeLabel } = props
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const data = traits.map((t) => ({
    trait: t.label,
    value: clamp100(t.value),
  }))

  const validTypes = ['Conventional', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Realistic']
  const typeKey = validTypes.includes(topCareerTypeLabel) ? topCareerTypeLabel : 'default'
  
  const meaningTitle = t(`career.meaning.${typeKey}.title` as any)
  const meaningBody = t(`career.meaning.${typeKey}.body` as any)

  return (
    <Card
      title={title}
      right={
        <Link to={viewReportTo} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
          {t('dashboard.viewFullReport')}
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_280px] lg:items-start">
        <div className="space-y-2">
          {traits.map((t) => (
            <div
              key={t.key}
              className={cn(
                'flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5',
                isLight 
                  ? 'border-slate-200 bg-slate-50' 
                  : 'border-slate-800/60 bg-slate-950/18'
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-md border',
                  isLight 
                    ? 'border-slate-300 bg-white' 
                    : 'border-slate-800/60 bg-slate-950/20'
                )}>
                  <span className={cn(
                    'block size-2 rounded-sm',
                    isLight ? 'bg-blue-500' : 'bg-blue-200/80'
                  )} />
                </span>
                <span className={cn(
                  'text-xs font-semibold whitespace-nowrap',
                  isLight ? 'text-slate-800' : 'text-slate-200'
                )}>
                  {t.label}
                </span>
              </div>
              <span className={cn(
                'shrink-0 text-xs font-semibold tabular-nums',
                isLight ? 'text-slate-700' : 'text-slate-300'
              )}>
                {Math.round(clamp100(t.value))}
              </span>
            </div>
          ))}
        </div>

        <div className="h-[420px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              data={data} 
              outerRadius="75%"
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
            >
              <PolarGrid stroke={isLight ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.14)'} />
              <PolarAngleAxis
                dataKey="trait"
                tick={<CustomTick isLight={isLight} />}
              />
              <Radar
                dataKey="value"
                stroke={isLight ? 'rgba(59,130,246,0.8)' : 'rgba(59,130,246,0.9)'}
                fill={isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.20)'}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <div className={cn('text-sm font-semibold leading-tight', isLight ? 'text-slate-900' : 'text-slate-100')}>
              {meaningTitle}
            </div>
            <div className={cn('mt-2 text-sm leading-relaxed', isLight ? 'text-slate-700' : 'text-slate-300')}>
              {meaningBody}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap',
              isLight 
                ? 'border-blue-200 bg-blue-50 text-blue-700' 
                : 'border-slate-800/60 bg-slate-950/18 text-slate-200'
            )}>
              {t('dashboard.top')} {topCareerTypeLabel}
            </span>
            <span className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap',
              isLight 
                ? 'border-slate-200 bg-slate-50 text-slate-700' 
                : 'border-slate-800/60 bg-slate-950/18 text-slate-200'
            )}>
              {t('dashboard.riasecRadar')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}


