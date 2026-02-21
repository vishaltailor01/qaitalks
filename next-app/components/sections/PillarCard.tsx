const highlightClasses = {
  'logic-cyan': 'bg-logic-cyan',
  'signal-yellow': 'bg-signal-yellow',
  'growth-green': 'bg-growth-green',
  'purple-accent': 'bg-purple-accent',
} as const

type HighlightKey = keyof typeof highlightClasses

interface PillarCardProps {
  title: string
  description: string
  icon: string
  highlight?: HighlightKey
}

export default function PillarCard({
  title,
  description,
  icon,
  highlight = 'logic-cyan',
}: PillarCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all font-sans">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-black text-deep-blueprint mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-700 leading-relaxed font-normal">{description}</p>
      <div className={`mt-6 h-1 w-12 ${highlightClasses[highlight]} rounded-full`}></div>
    </div>
  )
}
