export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
}

/** A grid of card-shaped skeletons — thumbnail + a couple of text lines. */
export function SkeletonCardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const colClass =
    columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' :
    columns === 2 ? 'sm:grid-cols-2' :
    'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <SkeletonBlock className="w-full h-44" />
          <div className="p-6 space-y-3">
            <SkeletonBlock className="h-3 w-1/3" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** A grid of text-only card skeletons — for cards with no thumbnail image. */
export function SkeletonTextCardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const colClass =
    columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
    columns === 2 ? 'md:grid-cols-2' :
    'md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-8 space-y-4">
          <SkeletonBlock className="h-3 w-1/4" />
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-5/6" />
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
    <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={`w-full ${heights[i % heights.length]} break-inside-avoid`} />
      ))}
    </div>
  )
}

/** A stacked list skeleton, e.g. for the editorial blog listing. */
export function SkeletonBlogList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-20 max-w-2xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-4 w-full">
          <SkeletonBlock className="w-full h-64" />
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
