interface SectionHeadingProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className} font-primary`}>
      <div className="relative inline-block">
        <h2 className="text-5xl md:text-6xl font-primary font-extrabold text-deep-blueprint mb-4 leading-tight relative">
          {title}
          <span aria-hidden="true" className="block w-full h-1 bg-logic-cyan/20 rounded mt-2" />
        </h2>
      </div>
      {subtitle && (
        <p className="mt-4 text-lg md:text-2xl text-signal-yellow font-primary max-w-2xl mx-auto marker-highlight">
          {subtitle}
        </p>
      )}
    </div>
  )
}
