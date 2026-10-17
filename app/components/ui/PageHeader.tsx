import SplitText from '@/app/components/ui/SplitText'

/** The opening of every top-level page: one heading, one short line, left-aligned on the grid. */
export default function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
      <h1 className="type-display max-w-[16ch] text-ink-900"><SplitText text={title} /></h1>
      {description && <p className="type-lead mt-6 max-w-[52ch]">{description}</p>}
      {children}
    </header>
  )
}
