'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { adminStorage } from '@/lib/adminStorage'
import { siteConfig } from '@/site.config'

type Milestone = { title: string; due: string; done: boolean }
type Update = { date: string; text: string }
type FileLink = { label: string; url: string }
type CP = { id?: string; title: string; client_name: string; client_email: string | null; status: 'planning' | 'in_progress' | 'review' | 'done'; progress: number; summary: string | null; needs_from_client: string | null; milestones: Milestone[]; updates: Update[]; files: FileLink[]; public_token?: string }
const STATUS: Record<CP['status'], string> = { planning: 'Planning', in_progress: 'In progress', review: 'In review', done: 'Done' }
const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'
const blank = (): CP => ({ title: '', client_name: '', client_email: '', status: 'planning', progress: 0, summary: '', needs_from_client: '', milestones: [], updates: [], files: [] })

// Admin -> Client Projects: a private page per client with progress, milestones, updates and files.
export default function ClientProjectsPage() {
  const [list, setList] = useState<CP[]>([])
  const [d, setD] = useState<CP | null>(null)
  const [newUpdate, setNewUpdate] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const load = async () => { try { setList(((await adminApi.list('client_projects', { orderBy: 'created_at', ascending: false })) as CP[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') } }
  useEffect(() => { load() }, [])

  async function save() {
    if (!d || !d.title.trim() || !d.client_name.trim()) return setMsg('Add a title and the client\u2019s name.')
    const updates = newUpdate.trim() ? [{ date: new Date().toISOString().slice(0, 10), text: newUpdate.trim() }, ...d.updates] : d.updates
    const row = { title: d.title.trim(), client_name: d.client_name.trim(), client_email: d.client_email?.trim() || null, status: d.status, progress: Math.min(100, Math.max(0, Number(d.progress) || 0)),
      summary: d.summary?.trim() || null, needs_from_client: d.needs_from_client?.trim() || null, milestones: d.milestones.filter((m) => m.title.trim()), updates, files: d.files.filter((f) => f.url) }
    try { if (d.id) await adminApi.update('client_projects', d.id, row); else await adminApi.insert('client_projects', row); setD(null); setNewUpdate(''); setMsg('Saved.'); load() } catch { setMsg('Could not save.') }
  }
  async function upload(file: File) {
    if (!d) return
    setUploading(true)
    const name = `client-files/${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`
    const { error } = await adminStorage.from('blog-images').upload(name, file, { optimize: false })
    if (error) setMsg('Upload failed: ' + error.message)
    else setD({ ...d, files: [...d.files, { label: file.name, url: adminStorage.from('blog-images').getPublicUrl(name).data.publicUrl }] })
    setUploading(false)
  }
  const link = (p: CP) => `${siteConfig.url}/client/${p.public_token}`

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl text-ink-900">Client Projects</h1><p className="mt-2 text-sm text-ink-500">A private page for each client: progress, milestones, updates, files and their invoices.</p></div>
          {!d && <button onClick={() => { setMsg(''); setD(blank()) }} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ New project</button>}
        </div>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        {d && (
          <section className="mt-8 space-y-6 border border-ink-100 bg-paper-raised p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div><label htmlFor="c-title" className={label}>Project title</label><input id="c-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={field} /></div>
              <div><label htmlFor="c-name" className={label}>Client name</label><input id="c-name" value={d.client_name} onChange={(e) => setD({ ...d, client_name: e.target.value })} className={field} /></div>
              <div><label htmlFor="c-email" className={label}>Client email (shows their invoices)</label><input id="c-email" type="email" value={d.client_email || ''} onChange={(e) => setD({ ...d, client_email: e.target.value })} className={field} /></div>
              <div><label htmlFor="c-status" className={label}>Status</label><select id="c-status" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value as CP['status'] })} className={field}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="md:col-span-2"><label htmlFor="c-progress" className={label}>Progress: {d.progress}%</label><input id="c-progress" type="range" min="0" max="100" step="5" value={d.progress} onChange={(e) => setD({ ...d, progress: Number(e.target.value) })} className="w-full" /></div>
            </div>
            <div><label htmlFor="c-summary" className={label}>Summary</label><textarea id="c-summary" rows={2} value={d.summary || ''} onChange={(e) => setD({ ...d, summary: e.target.value })} className={field} /></div>
            <div><label htmlFor="c-needs" className={label}>What I need from you (highlighted for the client)</label><textarea id="c-needs" rows={2} placeholder="e.g. Your logo files and brand colours by Friday" value={d.needs_from_client || ''} onChange={(e) => setD({ ...d, needs_from_client: e.target.value })} className={field} /></div>
            <div>
              <p className={label}>Milestones</p>
              <div className="space-y-2">{d.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" aria-label={`Milestone ${i + 1} done`} checked={m.done} onChange={(e) => setD({ ...d, milestones: d.milestones.map((x, k) => (k === i ? { ...x, done: e.target.checked } : x)) })} className="h-4 w-4" />
                  <input aria-label={`Milestone ${i + 1}`} value={m.title} onChange={(e) => setD({ ...d, milestones: d.milestones.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} className={`${field} flex-1`} />
                  <input aria-label={`Milestone ${i + 1} due date`} type="date" value={m.due} onChange={(e) => setD({ ...d, milestones: d.milestones.map((x, k) => (k === i ? { ...x, due: e.target.value } : x)) })} className="border border-ink-300 bg-paper-raised px-2 py-2 text-sm" />
                  <button type="button" aria-label={`Remove milestone ${i + 1}`} onClick={() => setD({ ...d, milestones: d.milestones.filter((_, k) => k !== i) })} className="text-ink-500 hover:text-error">✕</button>
                </div>))}</div>
              <button type="button" onClick={() => setD({ ...d, milestones: [...d.milestones, { title: '', due: '', done: false }] })} className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-900">+ Add milestone</button>
            </div>
            <div>
              <label htmlFor="c-update" className={label}>Post an update (added on save, newest first)</label>
              <textarea id="c-update" rows={2} placeholder="e.g. First concepts are ready for you to review." value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} className={field} />
              {d.updates.length > 0 && <ul className="mt-2 space-y-1 text-xs text-ink-500">{d.updates.map((u, i) => <li key={i} className="flex justify-between gap-2"><span>{u.date}: {u.text}</span><button type="button" onClick={() => setD({ ...d, updates: d.updates.filter((_, k) => k !== i) })} className="hover:text-error">remove</button></li>)}</ul>}
            </div>
            <div>
              <p className={label}>Files</p>
              <ul className="space-y-2">{d.files.map((f, i) => (
                <li key={i} className="flex items-center gap-2"><input aria-label={`File ${i + 1} name`} value={f.label} onChange={(e) => setD({ ...d, files: d.files.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} className={`${field} flex-1`} />
                  <input aria-label={`File ${i + 1} link`} value={f.url} onChange={(e) => setD({ ...d, files: d.files.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)) })} className={`${field} flex-1 font-mono text-xs`} />
                  <button type="button" aria-label={`Remove file ${i + 1}`} onClick={() => setD({ ...d, files: d.files.filter((_, k) => k !== i) })} className="text-ink-500 hover:text-error">✕</button></li>))}</ul>
              <div className="mt-2 flex gap-4 text-xs font-medium uppercase tracking-[0.08em]">
                <label className="cursor-pointer text-ink-900">{uploading ? 'Uploading...' : '+ Upload file'}<input type="file" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = '' }} /></label>
                <button type="button" onClick={() => setD({ ...d, files: [...d.files, { label: '', url: '' }] })} className="text-ink-900">+ Add a link</button>
              </div>
            </div>
            <div className="flex gap-4"><button onClick={save} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Save project</button><button onClick={() => { setD(null); setNewUpdate('') }} className="px-4 py-3 text-xs uppercase tracking-[0.08em] text-ink-500">Cancel</button></div>
          </section>
        )}
        <div className="mt-10 overflow-x-auto border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3" /></tr></thead>
            <tbody>{list.length === 0 ? <tr><td colSpan={5} className="px-4 py-6 text-ink-500">No client projects yet.</td></tr> : list.map((p) => (
              <tr key={p.id} className="border-t border-ink-100"><td className="px-4 py-3 text-ink-900">{p.title}</td><td className="px-4 py-3">{p.client_name}</td><td className="px-4 py-3">{STATUS[p.status]}</td><td className="px-4 py-3 font-mono">{p.progress}%</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.08em]">
                  <button onClick={() => { setMsg(''); setD({ ...p }) }} className="ml-3 text-ink-700">Edit</button>
                  <button onClick={() => { navigator.clipboard.writeText(link(p)); setMsg(`Link for ${p.client_name} copied.`) }} className="ml-3 text-ink-700">Copy link</button>
                  <a href={`/client/${p.public_token}`} target="_blank" rel="noopener noreferrer" className="ml-3 text-ink-700">View</a>
                  <button onClick={async () => { if (confirm(`Delete ${p.title}?`)) { await adminApi.remove('client_projects', p.id!); load() } }} className="ml-3 text-ink-500 hover:text-error">Delete</button>
                </td></tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
