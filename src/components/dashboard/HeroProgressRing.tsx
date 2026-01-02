import { motion } from 'framer-motion'

export function HeroProgressRing(props: {
  value: number
  label?: string
  size?: number
  stroke?: number
}) {
  const { value, label = 'Journey Complete', size = 300, stroke = 16 } = props
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  const pctFontSize = Math.round(size * 0.21)
  const labelFontSize = Math.max(12, Math.round(size * 0.045))

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference
  const offset = dash * (1 - v / 100)
  const tickRadius = radius - stroke * 0.55

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <linearGradient id="pf-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="pf-ring-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="70%" stopColor="rgba(59,130,246,0.06)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.18)" />
          </radialGradient>
        </defs>

        {/* Soft glow behind ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + stroke * 0.6}
          fill="url(#pf-ring-glow)"
          opacity="0.55"
        />

        {/* Tick marks (subtle segments like the reference ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={tickRadius}
          fill="transparent"
          stroke="rgba(148,163,184,0.20)"
          strokeWidth={2}
          strokeDasharray="1 10"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148,163,184,0.16)"
          strokeWidth={stroke}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#pf-blue)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: dash }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{
            filter: 'drop-shadow(0px 0px 14px rgba(59,130,246,0.35))',
          }}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - stroke * 1.2}
          fill="rgba(2,6,23,0.28)"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth="1"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <div
          className="font-semibold tracking-tight text-slate-50"
          style={{ fontSize: pctFontSize, lineHeight: 1.2 }}
        >
          {v}%
        </div>
        <div
          className="mt-1.5 font-medium text-slate-300/80"
          style={{ fontSize: labelFontSize, lineHeight: 1.2 }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}


