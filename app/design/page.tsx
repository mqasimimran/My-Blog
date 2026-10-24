'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SkeletonMasonryGrid } from '@/app/components/Skeleton'
import BeforeAfterSlider from '@/app/components/BeforeAfterSlider'
import FilterTabs from '@/app/components/ui/FilterTabs'
import EmptyState from '@/app/components/EmptyState'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'

type DesignItem = {
  id: string
  title: string
  category: string
  images: string[]
  before_image?: string | null
}

function DesignGalleryInner() {
  const { tx } = useLocale()
  const searchParams = useSearchParams()
  const [designPortfolio, setDesignPortfolio] = useState<DesignItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState<DesignItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    async function fetchDesigns() {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching designs:', error)
      else setDesignPortfolio(data || [])
      setIsLoading(false)
    }

    fetchDesigns()
  }, [])

  // If arriving via a link like /design?item=<id> (e.g. from the homepage's
  // Featured Design section), open that specific piece's lightbox directly
  // instead of just landing on the gallery.
  useEffect(() => {
    const itemId = searchParams.get('item')
    if (itemId && designPortfolio.length > 0) {
      const match = designPortfolio.find((d) => d.id === itemId)
      if (match) {
        setSelectedItem(match)
        setCurrentImageIndex(0)
      }
    }
  }, [searchParams, designPortfolio])

  const categories = ['All', 'Branding & Identity', 'Logo Design', 'Social Media Posts', 'Print Design', 'Packaging Design', 'Product Design', 'Advertising', 'UI/UX Design', 'Illustration', 'Graphic Design']

  const filteredDesigns = activeCategory === 'All'
    ? designPortfolio
    : designPortfolio.filter(item => item.category === activeCategory)

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedItem) {
      setCurrentImageIndex((prev) => 
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedItem) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      )
    }
  }

  const openModal = (item: DesignItem) => {
    setSelectedItem(item)
    setCurrentImageIndex(0)
  }

  // Keyboard: Escape closes the viewer; arrow keys step through a set.
  useEffect(() => {
    if (!selectedItem) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null)
      if (selectedItem.images.length < 2) return
      if (e.key === 'ArrowRight') setCurrentImageIndex((i) => (i === selectedItem.images.length - 1 ? 0 : i + 1))
      if (e.key === 'ArrowLeft') setCurrentImageIndex((i) => (i === 0 ? selectedItem.images.length - 1 : i - 1))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selectedItem])

  return (
    <main className="pb-24">
      <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
        <h1 className="type-display text-ink-900"><SplitText text={tx("Visual Design")} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">
          {tx("A curated showcase of brand identities, UI/UX architecture, and promotional graphics. Select a piece to see the full design set.")}
        </p>
      </header>

      <section className="container-page">
        <FilterTabs label={tx("Filter designs by category")} options={categories.map((c) => ({ key: c, label: c }))} value={activeCategory} onChange={setActiveCategory} />

        <div className="mt-12">
          {isLoading ? (
            <SkeletonMasonryGrid count={9} />
          ) : filteredDesigns.length === 0 ? (
            <EmptyState icon="image" title={tx("No designs in this category yet")} description={tx("Try another category.")} />
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {filteredDesigns.map((item) => (
                <button key={item.id} type="button" onClick={() => openModal(item)} data-cursor="Open" className="group mb-10 block w-full break-inside-avoid text-left">
                  <div className="overflow-hidden bg-ink-50">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <h2 className="text-[15px] font-medium tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{item.title}</h2>
                    {item.images?.length > 1 && <span className="type-meta shrink-0">{item.images.length} images</span>}
                  </div>
                  <p className="type-meta mt-0.5">{item.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image viewer */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          className="fixed inset-0 z-overlay flex items-center justify-center bg-zinc-950/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative flex w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              autoFocus
              aria-label={tx("Close")}
              className="absolute -top-12 right-0 z-10 grid h-10 w-10 place-items-center text-white transition-colors duration-200 hover:text-accent-600"
              onClick={() => setSelectedItem(null)}
            >
              <X size={24} aria-hidden />
            </button>

            <div className="relative flex w-full items-center justify-center">
              {selectedItem.images.length > 1 && (
                <button onClick={handlePrev} aria-label={tx("Previous image")} className="absolute left-0 z-10 grid h-12 w-12 place-items-center text-white/60 transition-colors duration-200 hover:text-white md:-left-14">
                  <CaretLeft size={32} aria-hidden />
                </button>
              )}

              {selectedItem.before_image ? (
                <div className="w-full max-w-2xl">
                  <BeforeAfterSlider beforeSrc={selectedItem.before_image} afterSrc={selectedItem.images[currentImageIndex]} alt={selectedItem.title} />
                </div>
              ) : (
                <img src={selectedItem.images[currentImageIndex]} alt={`${selectedItem.title}, ${currentImageIndex + 1} of ${selectedItem.images.length}`} className="max-h-[80vh] w-auto object-contain" />
              )}

              {selectedItem.images.length > 1 && (
                <button onClick={handleNext} aria-label={tx("Next image")} className="absolute right-0 z-10 grid h-12 w-12 place-items-center text-white/60 transition-colors duration-200 hover:text-white md:-right-14">
                  <CaretRight size={32} aria-hidden />
                </button>
              )}
            </div>

            <div className="mt-6 w-full text-center">
              <h3 className="text-lg font-medium tracking-tight text-white">{selectedItem.title}</h3>
              <p className="mt-1 font-mono text-xs text-white/60">
                {selectedItem.category}
                {selectedItem.images.length > 1 && <span className="ml-4">{currentImageIndex + 1} / {selectedItem.images.length}</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function DesignGalleryPage() {
  return (
    <Suspense fallback={
      <main className="container-page pb-24 pt-20">
        <div className="h-14 w-72 bg-ink-50 motion-safe:animate-pulse" />
      </main>
    }>
      <DesignGalleryInner />
    </Suspense>
  )
}