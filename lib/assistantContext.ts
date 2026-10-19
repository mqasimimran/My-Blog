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

  const [projects, exp, edu, certs, services, settings] = await Promise.all([
    supabase.from('projects').select('title, category, description, tech_stack, status, problem, approach, outcome, stats').eq('published', true).order('created_at', { ascending: false }).limit(40),
    supabase.from('experiences').select('role, company, period, description').order('order_index', { ascending: true }),
    supabase.from('education').select('degree, institution, period, description').order('order_index', { ascending: true }),
    supabase.from('certifications').select('title, issuer, date').order('order_index', { ascending: true }),
    supabase.from('services').select('name, tagline, description, starting_price, service_packages(tier, price, delivery_days, features)').eq('active', true),
    supabase.from('site_settings').select('available_for_work, availability_message').eq('id', 1).maybeSingle(),
  ])

  const lines: string[] = []
  lines.push(`Name: ${siteConfig.name}. Role: ${siteConfig.jobTitle}. Based in: ${siteConfig.location}.`)
  lines.push(`Summary: ${cut(siteConfig.description, 400)}`)
  lines.push(`Contact: ${siteConfig.url}/contact or ${siteConfig.email}. LinkedIn: ${siteConfig.social.linkedin}. GitHub: ${siteConfig.social.github}.`)
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
        ` Page: ${siteConfig.url}/projects`)
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

  const text = lines.join('\n').slice(0, 30000)
  cache = { at: Date.now(), text }
  return text
}
