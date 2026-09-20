'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type DesignItem = {
  id: string
  title: string
  category: string
  images: string[]
}

function DesignGalleryInner() {
  const searchParams = useSearchParams()
  const [designPortfolio, setDesignPortfolio] = useState<DesignItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [selectedItem, setSelectedItem] = useState<DesignItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    async function fetchDesigns() {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
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

  const categories = ['ALL', 'Branding & Identity', 'Logo Design', 'Social Media Posts', 'Print Design', 'Packaging Design', 'Product Design', 'Advertising', 'UI/UX Design', 'Illustration', 'Graphic Design']

  const filteredDesigns = activeCategory === 'ALL'
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

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 uppercase mb-4">
            Visual Design
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            A curated showcase of brand identities, UI/UX architecture, and promotional graphics. Click on a project to view the full design set.
          </p>
        </header>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-gray-200 pb-6">
          {categories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded transition-colors ${
                  isActive 
                    ? 'bg-[#aa002a] text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Masonry Grid Layout */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">
            Loading design gallery...
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No design entries found in this category.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredDesigns.map((item) => (
              <div 
                key={item.id} 
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 bg-white"
                onClick={() => openModal(item)}
              >
                {item.images?.[0] && (
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}
                
                <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#aa002a]">
                      {item.category}
                    </span>
                    {item.images?.length > 1 && (
                      <span className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded">
                        1 / {item.images.length}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-lg font-medium tracking-wide">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Carousel Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 p-4 sm:p-8 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center group"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="absolute -top-12 right-0 text-white hover:text-[#aa002a] transition-colors text-sm font-bold tracking-widest uppercase z-10"
              onClick={() => setSelectedItem(null)}
            >
              Close ✕
            </button>
            
            <div className="relative w-full flex items-center justify-center">
              {selectedItem.images.length > 1 && (
                <button 
                  onClick={handlePrev}
                  className="absolute left-0 md:-left-12 p-3 text-white/50 hover:text-[#aa002a] transition-colors z-10"
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <img 
                src={selectedItem.images[currentImageIndex]} 
                alt={`${selectedItem.title} - ${currentImageIndex + 1}`} 
                className="max-h-[80vh] w-auto object-contain rounded shadow-2xl transition-opacity duration-300"
              />

              {selectedItem.images.length > 1 && (
                <button 
                  onClick={handleNext}
                  className="absolute right-0 md:-right-12 p-3 text-white/50 hover:text-[#aa002a] transition-colors z-10"
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="mt-6 text-center w-full">
              <h3 className="text-white text-xl font-medium tracking-wide mb-1">
                {selectedItem.title}
              </h3>
              
              {selectedItem.images.length > 1 ? (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {selectedItem.images.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex ? 'w-6 bg-[#aa002a]' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#aa002a] block mt-2">
                  {selectedItem.category}
                </span>
              )}
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading design gallery...</p>
      </main>
    }>
      <DesignGalleryInner />
    </Suspense>
  )
}