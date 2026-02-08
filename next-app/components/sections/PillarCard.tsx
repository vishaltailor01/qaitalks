const highlightClasses = {
  'logic-cyan': 'bg-logic-cyan',
  'warning-amber': 'bg-warning-amber',
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
    <div className="bg-white rounded-lg p-8 border border-slate-200 hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-deep-blueprint mb-3">
        {title}
      </h3>
      <p className="text-text-slate leading-relaxed">
        {description}
      </p>
      <div className={`mt-6 h-1 w-12 ${highlightClasses[highlight]} rounded`}></div>
    </div>
  )
}
