'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import type { Campaign } from '@/lib/designNeeds'

const empty = { id: '', client_id: '', title: '', summary: '', role: '', share_image_url: '', published: false }

export default function CampaignsPage() {
  const [clients, setClients] = useState<{id: string; name: string; slug: string | null}[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    Promise.all([adminApi.list('client_logos', {orderBy:'name'}), adminApi.list('design_campaigns', {orderBy:'title'})])
      .then(([clients, campaigns]) => {setClients(clients); setCampaigns(campaigns)})
      .catch(() => setMessage('Could not load campaigns. Apply the design campaigns SQL migration and refresh.'))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const {id, ...fields} = form
    try {
      const saved: Campaign[] = id ? await adminApi.update('design_campaigns', id, fields) : await adminApi.insert('design_campaigns', fields)
      setCampaigns(current => [...current.filter(c => c.id !== id), ...saved])
      setForm(empty)
      setMessage('Campaign saved. Assign designs from Design Gallery.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save campaign.') }
    finally { setBusy(false) }
  }

  const field = 'mt-1 block w-full border border-ink-100 bg-paper p-3'
  return <div className="flex min-h-screen"><AdminNav /><main className="min-w-0 flex-1 p-6 md:p-10">
    <div className="mx-auto max-w-5xl">
      <h1 className="type-h2">Client campaigns</h1>
      <Link href="/admin/designs" className="mt-3 inline-block underline">Assign designs in Design Gallery</Link>
      {message && <p role="status" className="mt-4">{message}</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-label="Campaigns" className="space-y-3">
          {!campaigns.length && <p>No campaigns yet.</p>}
          {campaigns.map(c => {
            const client = clients.find(client => client.id === c.client_id)
            return <article key={c.id} className="border border-ink-100 p-4">
              <h2 className="text-lg font-medium">{c.title}</h2>
              <p className="mt-1 text-sm text-ink-500">{client?.name} · {c.published ? 'Published' : 'Draft'}</p>
              <div className="mt-3 flex gap-4">
                <button onClick={() => setForm({...c, role:c.role || '', share_image_url:c.share_image_url || ''})} className="underline">Edit</button>
                {c.published && <Link className="underline" href={'/admin/testimonials?work='+encodeURIComponent('campaign:'+c.id)}>Request testimonials</Link>}
                {c.published && client && <Link className="underline" href={`/design/clients/${client.slug || client.id}/campaigns/${c.id}`}>View case study</Link>}
              </div>
            </article>
          })}
        </section>
        <form onSubmit={save} className="space-y-4 border border-ink-100 p-5">
          <h2 className="text-xl">{form.id ? 'Edit campaign' : 'New campaign'}</h2>
          <label className="block text-sm">Client<select required disabled={!!form.id} value={form.client_id} onChange={e => setForm({...form,client_id:e.target.value})} className={field}>
            <option value="">Choose a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <label className="block text-sm">Campaign title<input required maxLength={160} value={form.title} onChange={e => setForm({...form,title:e.target.value})} className={field} /></label>
          <label className="block text-sm">Your role<input value={form.role} onChange={e => setForm({...form,role:e.target.value})} className={field} /></label>
          <label className="block text-sm">Case study<textarea rows={8} value={form.summary} onChange={e => setForm({...form,summary:e.target.value})} className={field} /></label>
          <label className="block text-sm">Share image URL (optional)<input type="url" placeholder="https://…" value={form.share_image_url} onChange={e => setForm({...form,share_image_url:e.target.value})} className={field} /></label>
          <p className="text-xs text-ink-500">Use an uploaded artwork URL. Leave blank for an automatic title card.</p>
          <label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={e => setForm({...form,published:e.target.checked})} />Publish campaign</label>
          <div className="flex gap-4">
            <button disabled={busy} className="bg-ink-900 px-4 py-3 text-paper">{busy ? 'Saving…' : 'Save campaign'}</button>
            {form.id && <button type="button" onClick={() => setForm(empty)}>Cancel editing</button>}
          </div>
        </form>
      </div>
    </div>
  </main></div>
}
