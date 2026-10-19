'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

import { siteConfig } from '@/site.config'
import { getManualMethod, MANUAL_METHODS } from '@/lib/paymentMethods'
import { HEX, accentVars } from '@/lib/accent'
// Live preview: apply the colour to this page straight away (the site follows after saving).
function applyAccentPreview(hex: string) {
  const root = document.documentElement
  const vars = accentVars(hex, root.classList.contains('dark'))
  for (const k of ['--color-accent-50', '--color-accent-600', '--color-accent-700', '--color-on-accent']) {
    if (vars) root.style.setProperty(k, vars[k])
    else root.style.removeProperty(k)
  }
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const [availableForWork, setAvailableForWork] = useState(true)
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [nowText, setNowText] = useState('')
  const [accentColor, setAccentColor] = useState('')
  const previewAccent = (value: string) => {
    setAccentColor(value)
    applyAccentPreview(value)
  }
  const [jazzcashNumber, setJazzcashNumber] = useState('')
  const [jazzcashAccountName, setJazzcashAccountName] = useState('')
  const [easypaisaNumber, setEasypaisaNumber] = useState('')
  const [easypaisaAccountName, setEasypaisaAccountName] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountTitle, setBankAccountTitle] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankIban, setBankIban] = useState('')
  const [payoneerEmail, setPayoneerEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      let data: any = null
      let error: any = null
      try { data = await adminApi.get('site_settings', 1) } catch (e: any) { error = e }
      if (error) console.error('Error fetching settings:', error)
      else if (data) {
        setAvailableForWork(data.available_for_work)
        setAvailabilityMessage(data.availability_message || '')
        setNowText(data.now_text || '')
        setAccentColor(data.accent_color || '')
        setJazzcashNumber(data.jazzcash_number || '')
        setJazzcashAccountName(data.jazzcash_account_name || '')
        setEasypaisaNumber(data.easypaisa_number || '')
        setEasypaisaAccountName(data.easypaisa_account_name || '')
        setBankName(data.bank_name || '')
        setBankAccountTitle(data.bank_account_title || '')
        setBankAccountNumber(data.bank_account_number || '')
        setBankIban(data.bank_iban || '')
        setPayoneerEmail(data.payoneer_email || '')
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchSettings()
  }, [status])

  async function handleSave() {
    setIsSaving(true)
    let error: any = null
    try { await adminApi.update('site_settings', 1, {
      available_for_work: availableForWork,
      availability_message: availabilityMessage,
      now_text: nowText,
      accent_color: HEX.test(accentColor) ? accentColor : null,
      jazzcash_number: jazzcashNumber,
      jazzcash_account_name: jazzcashAccountName,
      easypaisa_number: easypaisaNumber,
      easypaisa_account_name: easypaisaAccountName,
      bank_name: bankName,
      bank_account_title: bankAccountTitle,
      bank_account_number: bankAccountNumber,
      bank_iban: bankIban,
      payoneer_email: payoneerEmail,
    }) } catch (e: any) { error = e }

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setIsSaving(false)
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const [projects, articles, designs, services, servicePackages, testimonials, journeyEntries] = await Promise.all([
        adminApi.list('projects'),
        adminApi.list('articles'),
        adminApi.list('designs'),
        adminApi.list('services'),
        adminApi.list('service_packages'),
        adminApi.list('testimonials'),
        adminApi.list('journey_entries'),
      ])

      const exportData = {
        exported_at: new Date().toISOString(),
        projects: projects || [],
        articles: articles || [],
        designs: designs || [],
        services: services || [],
        service_packages: servicePackages || [],
        testimonials: testimonials || [],
        journey_entries: journeyEntries || [],
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed — check the console for details.')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading admin portal...</div>
  }

  if (!session) return null

  // Headings and which account fields appear follow site.config.ts (payments.manualMethods)
  const localGroup = MANUAL_METHODS.find((m) => ['jazzcash', 'easypaisa', 'bank_transfer'].includes(m.id))?.group

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-8">Site Settings</h1>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-900 mb-3">Availability Badge</p>
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="available" checked={availableForWork} onChange={(e) => setAvailableForWork(e.target.checked)} className="w-4 h-4 accent-gray-900" />
                <label htmlFor="available" className="text-sm text-ink-700">Show "Available for work" badge on the homepage and Services</label>
              </div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Badge Text</label>
              <input
                type="text"
                value={availabilityMessage}
                onChange={(e) => setAvailabilityMessage(e.target.value)}
                placeholder="Available for new projects"
                className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm"
              />
            </div>

            <div className="pt-6 border-t border-ink-100">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-900 mb-3">"Right Now" Widget</p>
              <p className="text-[11px] text-ink-300 mb-3">Shown on the homepage. Leave blank to hide it.</p>
              <textarea
                value={nowText}
                onChange={(e) => setNowText(e.target.value)}
                rows={3}
                placeholder="e.g. Currently building a bilingual AI Urdu teaching assistant for my final year project."
                className="w-full border border-ink-100 p-3 outline-none focus:border-ink-900 text-ink-700 text-sm"
              />
            </div>

            <div className="pt-6 border-t border-ink-100">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-900 mb-3">Accent colour</p>
              <p className="text-[11px] text-ink-500 mb-3">Your brand colour across the site. This page previews it live; after you save, the site updates within a minute.</p>
              <div className="flex flex-wrap items-center gap-3">
                <input type="color" aria-label="Pick the accent colour" value={HEX.test(accentColor) ? accentColor : siteConfig.brand.accent} onChange={(e) => previewAccent(e.target.value)} className="h-11 w-14 cursor-pointer border border-ink-100 bg-paper-raised p-1" />
                <input type="text" aria-label="Accent colour as a hex code" value={accentColor} onChange={(e) => previewAccent(e.target.value)} placeholder={siteConfig.brand.accent} className="w-32 border border-ink-100 p-3 font-mono text-sm" />
                <span className="grid h-11 place-items-center bg-accent-600 px-4 text-xs font-medium uppercase tracking-[0.08em] text-on-accent">Button</span>
                <span className="text-sm font-medium text-accent-600">Link text</span>
                {accentColor && (
                  <button type="button" onClick={() => previewAccent('')} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-ink-900">Reset to default</button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-ink-100">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-900 mb-1">Payment Accounts</p>
              <p className="text-[11px] text-ink-300 mb-5">Shown to buyers on the checkout page so they know where to send payment. Leave any section blank to hide that option.</p>

              {localGroup && <p className="text-[10px] font-bold uppercase tracking-widest text-accent-600 mb-3">{localGroup}</p>}

              {getManualMethod('jazzcash') && (
                <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">JazzCash Number</label>
                  <input type="text" value={jazzcashNumber} onChange={(e) => setJazzcashNumber(e.target.value)} placeholder="03XX-XXXXXXX" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Account Name</label>
                  <input type="text" value={jazzcashAccountName} onChange={(e) => setJazzcashAccountName(e.target.value)} placeholder={siteConfig.name} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
                </>
              )}

              {getManualMethod('easypaisa') && (
                <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">EasyPaisa Number</label>
                  <input type="text" value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} placeholder="03XX-XXXXXXX" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Account Name</label>
                  <input type="text" value={easypaisaAccountName} onChange={(e) => setEasypaisaAccountName(e.target.value)} placeholder={siteConfig.name} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
                </>
              )}

              {getManualMethod('bank_transfer') && (
                <>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Bank Name</label>
                  <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HBL, Meezan Bank" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Account Title</label>
                  <input type="text" value={bankAccountTitle} onChange={(e) => setBankAccountTitle(e.target.value)} placeholder={siteConfig.name} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Account Number</label>
                  <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">IBAN (optional)</label>
                  <input type="text" value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="Helps international senders" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
                </>
              )}

              {getManualMethod('payoneer') && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent-600 mb-3">{getManualMethod('payoneer')?.group}</p>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Payoneer Email</label>
                <input type="email" value={payoneerEmail} onChange={(e) => setPayoneerEmail(e.target.value)} placeholder="The email tied to your Payoneer account" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                <p className="text-[10px] text-ink-300 mt-1">Buyers will send a Payoneer-to-Payoneer payment to this email.</p>
              </div>
                </>
              )}
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors">
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </button>

            <div className="pt-6 border-t border-ink-100">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-900 mb-2">Data Export</p>
              <p className="text-[11px] text-ink-300 mb-4">
                Download everything — projects, articles, designs, services, testimonials, and your journey entries — as a single JSON file. Good insurance before any big change.
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-ink-100 text-ink-900 text-xs font-bold tracking-widest uppercase py-3 rounded-none hover:bg-ink-100 transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Export Everything As JSON'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
