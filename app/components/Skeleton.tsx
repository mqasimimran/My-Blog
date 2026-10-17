export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-ink-50 motion-safe:animate-pulse ${className}`} />
}

/** Skeleton for the lead + side project layout on the homepage. */
export function SkeletonProjectGrid() {
  const card = (media: string) => (
    <div className="space-y-4">
      <SkeletonBlock className={`w-full ${media}`} />
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-6 w-3/5" />
      <SkeletonBlock className="h-3 w-full" />
    </div>
  )
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12">
      <div className="lg:col-span-7">{card('aspect-[4/3]')}</div>
      <div className="flex flex-col gap-14 lg:col-span-5 lg:gap-10">
        {card('aspect-[16/10]')}
        {card('aspect-[16/10]')}
      </div>
    </div>
  )
}

/** Skeleton for the lead article + list layout. */
export function SkeletonEditorial() {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <SkeletonBlock className="aspect-[16/10] w-full" />
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-7 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
      </div>
      <div className="space-y-10 lg:col-span-5">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-6 w-4/5" />
            <SkeletonBlock className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** A grid of card-shaped skeletons: thumbnail + a couple of text lines. */
export function SkeletonCardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const colClass =
    columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' :
    columns === 2 ? 'sm:grid-cols-2' :
    'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-x-8 gap-y-12`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <SkeletonBlock className="aspect-[4/3] w-full" />
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-5 w-5/6" />
          <SkeletonBlock className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

/** A grid of text-only skeletons, for items with no thumbnail image. */
export function SkeletonTextCardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const colClass =
    columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
    columns === 2 ? 'md:grid-cols-2' :
    'md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-x-8 gap-y-10`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4 border-t border-ink-100 pt-6">
          <SkeletonBlock className="h-3 w-1/4" />
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}

/** A masonry-style skeleton for the design gallery, with varied heights. */
export function SkeletonMasonryGrid({ count = 8 }: { count?: number }) {
  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60']
  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={`mb-6 w-full ${heights[i % heights.length]} break-inside-avoid`} />
      ))}
    </div>
  )
}

/** A stacked list skeleton, e.g. for the editorial blog listing. */
export function SkeletonBlogList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-16">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid gap-8 md:grid-cols-12">
          <SkeletonBlock className="aspect-[16/10] w-full md:col-span-5" />
          <div className="space-y-4 md:col-span-7">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-7 w-2/3" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
