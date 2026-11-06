'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import { DESIGN_NEEDS, type Campaign } from '@/lib/designNeeds'

export default function DesignAssignment({ clientId, campaignId, needs, onChange }: {
  clientId: string
  campaignId: string
  needs: string[]
  onChange: (clientId: string, campaignId: string, needs: string[]) => void
}) {
  const [clients, setClients] = useState<{id: string; name: string}[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([adminApi.list('client_logos', {orderBy: 'name'}), adminApi.list('design_campaigns', {orderBy: 'title'})])
      .then(([clients, campaigns]) => { setClients(clients); setCampaigns(campaigns) })
      .catch(() => setError('Could not load assignments. Apply the design campaigns migration and refresh.'))
  }, [])
  return <fieldset className="space-y-4 border border-ink-100 p-4">
    <legend className="px-2 font-medium">Client, campaign and purpose</legend>
    {error && <p role="alert" className="text-error">{error}</p>}
    <label className="block text-sm">Client
      <select value={clientId} onChange={e => onChange(e.target.value, '', needs)} className="mt-1 block w-full border border-ink-100 bg-paper p-2">
        <option value="">Personal work</option>
        {clientId && !clients.some(c => c.id === clientId) && <option value={clientId}>Current client</option>}
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
    <label className="block text-sm">Campaign
      <select value={campaignId} disabled={!clientId} onChange={e => onChange(clientId, e.target.value, needs)} className="mt-1 block w-full border border-ink-100 bg-paper p-2">
        <option value="">No campaign</option>
        {campaignId && !campaigns.some(c => c.id === campaignId) && <option value={campaignId}>Current campaign</option>}
        {campaigns.filter(c => c.client_id === clientId).map(c => <option key={c.id} value={c.id}>{c.title}{c.published ? '' : ' (draft)'}</option>)}
      </select>
    </label>
    <Link href="/admin/campaigns" className="inline-block text-sm underline">Manage campaigns</Link>
    <fieldset className="flex flex-wrap gap-4">
      <legend className="mb-2 text-sm">What does this design help with?</legend>
      {DESIGN_NEEDS.map(need => <label key={need.id} className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={needs.includes(need.id)} onChange={e => onChange(clientId, campaignId, e.target.checked ? [...needs, need.id] : needs.filter(n => n !== need.id))} />
        {need.label}
      </label>)}
    </fieldset>
  </fieldset>
}
