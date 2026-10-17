import SplitText from '@/app/components/ui/SplitText'

/** A section heading: title (reveals letter by letter), optional one-line description and action
 *  below it, and an optional small note opposite it on the right, like "(Results that speak)". */
export default function SectionHeader({
  title,
  description,
  action,
  meta,
  className = '',
}: {
  title: string
  description?: string
  action?: React.ReactNode
  meta?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10 ${className}`}>
      <div className="max-w-2xl">
        <h2 className="type-h2 text-ink-900"><SplitText text={title} /></h2>
        {description && <p className="type-lead mt-4 max-w-[52ch]">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
      {meta && <p className="shrink-0 text-sm text-ink-500 md:pb-1">{meta}</p>}
    </div>
  )
}
