import SiteImage from '@/components/SiteImage'
import { supabase } from '@/lib/supabase'
import { mediaCover } from '@/lib/portfolioVideo'

export default async function HomeHeroBackdrop() {
  const { data } = await supabase.from('designs').select('images')
    .eq('published', true).eq('featured', true).order('created_at', { ascending: false }).limit(8)
  const images = [...new Set((data || []).map(d => mediaCover(d.images?.[0])).filter((src): src is string => Boolean(src)))].slice(0, 4)
  return <div className="cinematic-backdrop" aria-hidden>
    {images.map((src, index) => <div key={src} className="cinematic-artwork">
      <SiteImage src={src} alt="" loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} sizes="(min-width: 768px) 50vw, 80vw" />
    </div>)}
  </div>
}
