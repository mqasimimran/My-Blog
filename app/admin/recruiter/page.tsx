'use client'

import { Fragment, useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { siteConfig } from '@/site.config'

type Pack = { id: string; company: string; role_applied: string | null; contact_name: string | null; note: string | null; project_ids: string[]; include_cv: boolean; public_token: string; views: number; first_viewed_at: string | null; last_viewed_at: string | null; created_at: string }
type Ev = { id: string; pack_id: string; event: string; detail: string | null; created_at: string }
type Proj = { id: string; title: string; slug: string }
const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'
const when = (d: string | null) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '\u2014')

// Admin -> Recruiter Packs: a private page per company you apply to, and what they looked at.
export default function RecruiterAdmin() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [events, setEvents] = useState<Ev[]>([])
  const [projects, setProjects] = useState<Proj[]>([])
  const [d, setD] = useState<Partial<Pack> | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const load = async () => {
    try { setPacks(((await adminApi.list('recruiter_packs', { orderBy: 'created_at', ascending: false })) as Pack[]) || []); setEvents(((await adminApi.list('recruiter_events', { orderBy: 'created_at', ascending: false })) as Ev[]) || []) }
    catch { setMsg('Could not load. Has the latest SQL update been run?') }
  }
  useEffect(() => { load(); adminApi.list('projects', { orderBy: 'created_at', ascending: false }).then((p) => setProjects(((p as (Proj & { published: boolean })[]) || []).filter((x) => x.published))).catch(() => {}) }, [])
  async function save() {
    if (!d?.company?.trim()) return setMsg('Add the company name.')
    const row = { company: d.company.trim(), role_applied: d.role_applied?.trim() || null, contact_name: d.contact_name?.trim() || null, note: d.note?.trim() || null, project_ids: (d.project_ids || []).slice(0, 3), include_cv: d.include_cv !== false }
    try { if (d.id) await adminApi.update('recruiter_packs', d.id, row); else await adminApi.insert('recruiter_packs', row); setD(null); setMsg('Saved. Copy the link and add it to your application.'); load() } catch { setMsg('Could not save.') }
  }
  const toggle = (id: string) => { const cur = d?.project_ids || []; setD({ ...d, project_ids: cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 3 ? [...cur, id] : cur }) }
  const describe = (e: Ev) => e.event === 'view' ? 'Opened the page' : e.event === 'cv' ? 'Downloaded your CV' : e.event === 'project' ? `Opened project: ${projects.find((p) => p.slug === e.detail?.slice(8))?.title || e.detail?.slice(8)}` : `Clicked ${e.detail}`
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl text-ink-900">Recruiter Packs</h1><p className="mt-2 text-sm text-ink-500">A private page for each company you apply to. You&rsquo;re alerted when they first open it, and can see what they click.</p></div>
          {!d && <button onClick={() => { setMsg(''); setD({ include_cv: true, project_ids: [] }) }} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ New pack</button>}
        </div>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        {d && (
          <section className="mt-8 max-w-3xl space-y-4 border border-ink-100 bg-paper-raised p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div><label htmlFor="rp-co" className={label}>Company</label><input id="rp-co" value={d.company || ''} onChange={(e) => setD({ ...d, company: e.target.value })} className={field} /></div>
              <div><label htmlFor="rp-role" className={label}>Role you applied for</label><input id="rp-role" value={d.role_applied || ''} onChange={(e) => setD({ ...d, role_applied: e.target.value })} placeholder="e.g. Software Engineering Intern" className={field} /></div>
              <div><label htmlFor="rp-contact" className={label}>Recruiter&rsquo;s first name (optional)</label><input id="rp-contact" value={d.contact_name || ''} onChange={(e) => setD({ ...d, contact_name: e.target.value })} className={field} /></div>
            </div>
            <div><label htmlFor="rp-note" className={label}>Your message to them</label><textarea id="rp-note" rows={4} value={d.note || ''} onChange={(e) => setD({ ...d, note: e.target.value })} placeholder="Why you're excited about this role, in two or three sentences." className={field} /></div>
            <div><p className={label}>Projects to show (up to 3, in the order you pick)</p>
              <div className="flex flex-wrap gap-2">{projects.map((p) => { const i = (d.project_ids || []).indexOf(p.id); return <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-pressed={i >= 0} className={`border px-3 py-2 text-sm ${i >= 0 ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-100 text-ink-700 hover:border-ink-500'}`}>{i >= 0 ? `${i + 1}. ` : ''}{p.title}</button> })}</div></div>
            <label className="flex items-center gap-2 text-sm text-ink-900"><input type="checkbox" checked={d.include_cv !== false} onChange={(e) => setD({ ...d, include_cv: e.target.checked })} className="h-4 w-4" /> Include a CV download</label>
            <div className="flex gap-4"><button onClick={save} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Save pack</button><button onClick={() => setD(null)} className="px-4 text-xs uppercase tracking-[0.08em] text-ink-500">Cancel</button></div>
          </section>
        )}
        <div className="mt-10 overflow-x-auto border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-right">Views</th><th className="px-4 py-3">First opened</th><th className="px-4 py-3" /></tr></thead>
            <tbody>{packs.length === 0 ? <tr><td colSpan={5} className="px-4 py-6 text-ink-500">No packs yet.</td></tr> : packs.map((p) => (
              <Fragment key={p.id}>
                <tr className="border-t border-ink-100"><td className="px-4 py-3 font-medium text-ink-900">{p.company}</td><td className="px-4 py-3">{p.role_applied}</td>
                  <td className={`px-4 py-3 text-right font-mono ${p.views ? 'text-success' : 'text-ink-500'}`}>{p.views}</td><td className="px-4 py-3">{p.first_viewed_at ? when(p.first_viewed_at) : 'Not yet'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.08em]">
                    <button onClick={() => setOpen(open === p.id ? null : p.id)} className="ml-3 text-ink-700">Activity</button>
                    <button onClick={() => { navigator.clipboard.writeText(`${siteConfig.url}/for/${p.public_token}`); setMsg(`Link for ${p.company} copied.`) }} className="ml-3 text-ink-700">Copy link</button>
                    <a href={`/for/${p.public_token}?preview=1`} target="_blank" rel="noopener noreferrer" className="ml-3 text-ink-700">Preview</a>
                    <button onClick={() => setD({ ...p })} className="ml-3 text-ink-700">Edit</button>
                    <button onClick={async () => { if (confirm(`Delete the pack for ${p.company}?`)) { await adminApi.remove('recruiter_packs', p.id); load() } }} className="ml-3 text-ink-500 hover:text-error">Delete</button></td></tr>
                {open === p.id && <tr><td colSpan={5} className="bg-paper px-4 py-3"><ul className="space-y-1 text-sm">{events.filter((e) => e.pack_id === p.id).map((e) => <li key={e.id} className="flex gap-4"><span className="w-44 shrink-0 text-ink-500">{when(e.created_at)}</span><span className="text-ink-900">{describe(e)}</span></li>)}{!events.some((e) => e.pack_id === p.id) && <li className="text-ink-500">No activity yet. Previews from the admin don&rsquo;t count.</li>}</ul></td></tr>}
              </Fragment>
            ))}</tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
