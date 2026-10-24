import { createClient } from '@supabase/supabase-js'
import { siteConfig } from '@/site.config'

// Everything the "Ask about me" assistant may draw on: only what is already public on the site.
// Rebuilt at most every 5 minutes.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
let cache: { at: number; text: string } | null = null

const cut = (v: unknown, n = 600) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim()
  return s.length > n ? s.slice(0, n) + '...' : s
}

export async function buildAssistantContext(): Promise<string> {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.text

  const [projects, exp, edu, certs, services, settings, designs, posts, products, journey, testimonials] = await Promise.all([
    supabase.from('projects').select('title, slug, category, description, tech_stack, status, problem, approach, outcome, stats, live_url, github_url, play_url').eq('published', true).order('created_at', { ascending: false }).limit(40),
    supabase.from('experiences').select('role, company, period, description').order('order_index', { ascending: true }),
    supabase.from('education').select('degree, institution, period, description').order('order_index', { ascending: true }),
    supabase.from('certifications').select('title, issuer, date').order('order_index', { ascending: true }),
    supabase.from('services').select('name, tagline, description, starting_price, service_packages(tier, price, delivery_days, features)').eq('active', true),
    supabase.from('site_settings').select('available_for_work, availability_message').eq('id', 1).maybeSingle(),
    supabase.from('designs').select('title, category').eq('published', true).order('created_at', { ascending: false }).limit(60),
    supabase.from('articles').select('title, slug, category, excerpt').eq('published', true).order('created_at', { ascending: false }).limit(30),
    supabase.from('products').select('name, slug, type, category, price, description').order('order_index', { ascending: true }).limit(40),
    supabase.from('journey_entries').select('date_label, title, body').order('order_index', { ascending: true }).limit(30),
    supabase.from('testimonials').select('name, role, quote').eq('active', true).limit(10),
  ])

  const lines: string[] = []
  lines.push(`Name: ${siteConfig.name}. Role: ${siteConfig.jobTitle}. Based in: ${siteConfig.location}.`)
  lines.push(`Summary: ${cut(siteConfig.description, 400)}`)
  lines.push(`Contact: ${siteConfig.url}/contact or ${siteConfig.email}. LinkedIn: ${siteConfig.social.linkedin}. GitHub: ${siteConfig.social.github}.`)
  const u = siteConfig.url
  lines.push(`\nSITE PAGES (link the most specific one)
- Home: ${u}/ (intro, featured work, numbers, testimonials)
- Projects: ${u}/projects (software, AI and game projects; each has its own case-study page)
- Design gallery: ${u}/design (graphic design work: branding, posters, social media and UI designs)
- Blog: ${u}/blog (articles)
- Shop: ${u}/shop (templates and digital products); order status: ${u}/shop/order
- Services and prices: ${u}/services
- Resume and CV download: ${u}/resume (experience, education, certifications)
- My journey: ${u}/about (life and career timeline)
- Tech stack: ${u}/tech-stack (tools and hardware used)
- Roadmap: ${u}/roadmap (what's shipped, in progress and planned)
- Contact: ${u}/contact (hire or get in touch); all links: ${u}/links`)
  if (settings.data) lines.push(`Availability: ${settings.data.available_for_work ? cut(settings.data.availability_message || 'Available for new projects') : 'Not currently taking new projects.'}`)

  if (projects.data?.length) {
    lines.push('\nPROJECTS')
    for (const p of projects.data) {
      lines.push(`- ${p.title} (${p.category || 'Project'}${p.status ? ', ' + p.status : ''}). ${cut(p.description, 300)}` +
        (p.tech_stack ? ` Tech: ${cut(p.tech_stack, 150)}.` : '') +
        (p.problem ? ` Problem: ${cut(p.problem, 350)}` : '') +
        (p.approach ? ` Approach: ${cut(p.approach, 450)}` : '') +
        (p.outcome ? ` Outcome: ${cut(p.outcome, 300)}` : '') +
        (p.stats ? ` Stats: ${cut(String(p.stats).replace(/\n/g, '; '), 200)}` : '') +
        ` Page: ${siteConfig.url}/projects/${p.slug}` +
        (p.play_url ? ' (playable in the browser on that page)' : '') +
        (p.live_url ? ` Live demo: ${p.live_url}` : '') +
        (p.github_url ? ` Code: ${p.github_url}` : ''))
    }
  }
  if (exp.data?.length) {
    lines.push('\nEXPERIENCE')
    for (const e of exp.data) lines.push(`- ${e.role} at ${e.company} (${e.period}). ${cut(e.description, 300)}`)
  }
  if (edu.data?.length) {
    lines.push('\nEDUCATION')
    for (const e of edu.data) lines.push(`- ${e.degree}, ${e.institution} (${e.period}). ${cut(e.description, 200)}`)
  }
  if (certs.data?.length) {
    lines.push('\nCERTIFICATIONS')
    for (const c of certs.data) lines.push(`- ${c.title} (${c.issuer}${c.date ? ', ' + c.date : ''})`)
  }
  if (services.data?.length) {
    lines.push('\nSERVICES AND PRICES')
    for (const s of services.data as any[]) {
      lines.push(`- ${s.name}: ${cut(s.tagline || s.description, 250)}${s.starting_price ? ` ${s.starting_price}.` : ''}`)
      for (const pk of s.service_packages || []) lines.push(`  - ${pk.tier}: ${pk.price}${pk.delivery_days ? `, ${pk.delivery_days}-day delivery` : ''}. ${cut(String(pk.features || '').replace(/\n/g, ', '), 200)}`)
    }
    lines.push(`Services page: ${siteConfig.url}/services`)
  }

  if (designs.data?.length) {
    const byCategory: Record<string, string[]> = {}
    for (const d of designs.data) (byCategory[d.category || 'Other'] ||= []).push(d.title)
    lines.push(`\nDESIGN GALLERY (${designs.data.length} pieces, all at ${siteConfig.url}/design)`)
    for (const [cat, titles] of Object.entries(byCategory)) lines.push(`- ${cat}: ${titles.slice(0, 12).join(', ')}`)
  }
  if (posts.data?.length) {
    lines.push('\nBLOG POSTS')
    for (const p of posts.data) lines.push(`- ${p.title} (${p.category || 'Blog'}). ${cut(p.excerpt, 160)} ${siteConfig.url}/blog/${p.slug}`)
  }
  if (products.data?.length) {
    lines.push('\nSHOP')
    for (const p of products.data) lines.push(`- ${p.name} (${p.type}${p.category ? ', ' + p.category : ''}), $${p.price}. ${cut(p.description, 140)} ${siteConfig.url}/shop/${p.slug}`)
  }
  const stack = (siteConfig.techStack || []).flatMap((g: any) => (g.items || []).map((i: any) => i.name))
  if (stack.length) lines.push(`\nTECH STACK: ${stack.join(', ')}. Details: ${siteConfig.url}/tech-stack`)
  if (journey.data?.length) {
    lines.push('\nJOURNEY (timeline)')
    for (const j of journey.data) lines.push(`- ${j.date_label}: ${j.title}. ${cut(j.body, 200)}`)
  }
  if (testimonials.data?.length) {
    lines.push('\nWHAT PEOPLE SAY')
    for (const t of testimonials.data) lines.push(`- ${t.name}${t.role ? ', ' + t.role : ''}: "${cut(t.quote, 220)}"`)
  }

  const text = lines.join('\n').slice(0, 30000)
  cache = { at: Date.now(), text }
  return text
}
