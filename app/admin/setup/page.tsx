'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, WarningCircle, Info } from '@phosphor-icons/react'
import AdminNav from '@/app/admin/AdminNav'
import { siteConfig } from '@/site.config'

type Check = { group: string; label: string; ok: boolean; level: 'required' | 'recommended' | 'optional'; fix: string }

const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'

// Setup wizard: (1) a checklist of everything the site needs, (2) a form that writes a ready-to-use
// site.config.ts with your name, links and colours, so nobody has to edit code by hand.
export default function SetupPage() {
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const c = siteConfig
  const [v, setV] = useState({
    name: c.name, firstName: c.firstName, initials: c.initials, shortName: c.shortName, jobTitle: c.jobTitle, location: c.location,
    skillsLine: c.skillsLine, description: c.description, url: c.url, email: c.email, whatsapp: c.whatsapp.number,
    youtube: c.social.youtube, linkedin: c.social.linkedin, github: c.social.github, instagramPersonal: c.social.instagramPersonal, instagramDev: c.social.instagramDev,
    tagline: c.hero.tagline, roles: c.hero.roles.join(', '), bio: c.hero.bio.join('\n\n'), contactIntro: c.contact.intro, accent: c.brand.accent,
    phone: c.resume.phone, youtubeChannelId: c.videos.youtubeChannelId, adminUsername: c.admin.username, adminEmail: c.admin.email,
  })
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })

  useEffect(() => {
    fetch('/api/admin/setup-status').then((r) => r.json()).then((d) => setChecks(d.checks || [])).catch(() => setChecks([]))
  }, [])

  async function download(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/setup-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, roles: v.roles.split(',').map((r) => r.trim()).filter(Boolean), bio: v.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) }),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Something went wrong.')
      } else {
        const url = URL.createObjectURL(await res.blob())
        const a = document.createElement('a')
        a.href = url
        a.download = 'site.config.ts'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  const groups = checks ? Array.from(new Set(checks.map((x) => x.group))) : []
  const needed = checks?.filter((x) => !x.ok && x.level === 'required').length ?? 0
  // Called as a plain function (not <F />): a component defined inside the page would be rebuilt on
  // every keystroke and the cursor would jump out of the field.
  const F = ({ k, text, wide, hint, area }: { k: keyof typeof v; text: string; wide?: boolean; hint?: string; area?: number }) => (
    <div key={k} className={wide ? 'md:col-span-2' : ''}>
      <label htmlFor={`s-${k}`} className={label}>{text}</label>
      {area ? <textarea id={`s-${k}`} rows={area} value={v[k]} onChange={set(k)} className={`${field} resize-y`} /> : <input id={`s-${k}`} value={v[k]} onChange={set(k)} className={field} />}
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Setup</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">Everything this site needs to run, and your details in one form. Work down the list; green means done.</p>

        <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">1. Checklist</h2>
          {!checks ? (
            <p className="mt-4 text-sm text-ink-500">Checking...</p>
          ) : (
            <>
              <p className={`mt-3 text-sm font-medium ${needed ? 'text-error' : 'text-success'}`}>{needed ? `${needed} required item${needed > 1 ? 's' : ''} left to do` : 'Everything required is in place.'}</p>
              {groups.map((g) => (
                <div key={g} className="mt-6">
                  <p className="type-meta">{g}</p>
                  <ul className="mt-2 divide-y divide-ink-100 border-y border-ink-100">
                    {checks.filter((x) => x.group === g).map((x) => (
                      <li key={x.label} className="flex items-start gap-3 py-3">
                        {x.ok ? <CheckCircle size={20} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-success" /> : x.level === 'optional' ? <Info size={20} aria-hidden className="mt-0.5 shrink-0 text-ink-500" /> : <WarningCircle size={20} weight="fill" aria-hidden className={`mt-0.5 shrink-0 ${x.level === 'required' ? 'text-error' : 'text-warning'}`} />}
                        <div>
                          <p className="text-sm text-ink-900">{x.label} {!x.ok && <span className="text-xs text-ink-500">({x.level})</span>}</p>
                          {!x.ok && <p className="mt-1 text-xs text-ink-700">{x.fix}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="mt-4 text-xs text-ink-500">Changed something in Vercel or .env.local? Restart or redeploy, then reload this page.</p>
            </>
          )}
        </section>

        <form onSubmit={download} className="mt-8 border border-ink-100 bg-paper-raised p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">2. Your details</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">Fill this in and download a finished <code className="font-mono">site.config.ts</code>. Put it in your project folder (replacing the old one), then push to GitHub; Vercel updates the site automatically. Everything else in the file stays as it is.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {F({ k: "name", text: "Full name" })}{F({ k: "firstName", text: "First name" })}
            {F({ k: "jobTitle", text: "Job title" })}{F({ k: "location", text: "Location" })}
            {F({ k: "initials", text: "Initials (icon, 1-3 letters)" })}{F({ k: "shortName", text: "Short name (phone home screen)" })}
            {F({ k: "description", text: "One-sentence description (search results, link previews)", wide: true, area: 2 })}
            {F({ k: "skillsLine", text: "Skills line (share image)", wide: true })}
            {F({ k: "url", text: "Site address", hint: "Starts with https://" })}{F({ k: "email", text: "Public email" })}
            {F({ k: "whatsapp", text: "WhatsApp number", hint: "Country code, digits only, e.g. 923001234567" })}{F({ k: "phone", text: "Phone on your CV" })}
            {F({ k: "linkedin", text: "LinkedIn" })}{F({ k: "github", text: "GitHub" })}
            {F({ k: "youtube", text: "YouTube" })}{F({ k: "youtubeChannelId", text: "YouTube channel ID (latest videos)", hint: "Starts with UC. Leave empty to hide the section." })}
            {F({ k: "instagramPersonal", text: "Instagram" })}{F({ k: "instagramDev", text: "Second Instagram" })}
            {F({ k: "tagline", text: "Hero sentence", wide: true })}
            {F({ k: "roles", text: "Rotating roles", wide: true, hint: "Separate with commas, e.g. Software Engineer, Graphic Designer" })}
            {F({ k: "bio", text: "Bio", wide: true, area: 6, hint: "Leave a blank line between paragraphs." })}
            {F({ k: "contactIntro", text: "Contact page intro", wide: true, area: 2 })}
            <div>
              <label htmlFor="s-accent" className={label}>Accent colour (emails, share images)</label>
              <div className="flex gap-2"><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(v.accent) ? v.accent : '#b0233f'} onChange={set('accent')} aria-label="Pick the accent colour" className="h-11 w-14 border border-ink-300 bg-paper-raised p-1" /><input id="s-accent" value={v.accent} onChange={set('accent')} className={`${field} font-mono`} /></div>
              <p className="mt-1 text-xs text-ink-500">The on-site colour is set live in Site Settings.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">{F({ k: "adminUsername", text: "Admin username" })}{F({ k: "adminEmail", text: "Admin email" })}</div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 disabled:opacity-60">{saving ? 'Preparing...' : 'Download site.config.ts'}</button>
            {error && <p role="alert" className="text-sm text-error">{error}</p>}
          </div>
        </form>
      </main>
    </div>
  )
}
