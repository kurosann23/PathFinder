import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'

const games = [
  { name: 'Career Quiz Sprint', xp: 120, difficulty: 'Easy' },
  { name: 'Skill Match Puzzle', xp: 180, difficulty: 'Medium' },
  { name: 'Roadmap Runner', xp: 250, difficulty: 'Medium' },
  { name: 'Interview Simulator', xp: 300, difficulty: 'Hard' },
]

export function MiniGamesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mini Games"
        subtitle="See available mini games and XP rewards (dummy data)"
      />

      <Card title="Available Games" right={<span className="text-xs text-slate-400">850 XP</span>}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <div
              key={g.name}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4"
            >
              <div className="text-sm font-semibold text-slate-100">{g.name}</div>
              <div className="mt-1 text-xs text-slate-400">{g.difficulty}</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="rounded-xl bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-200 ring-1 ring-orange-500/25">
                  {g.xp} XP
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70 hover:bg-slate-900/70"
                >
                  Play (UI only)
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


