import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminNav from '@/app/admin/AdminNav'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { storageStatus } from '@/lib/r2'

export default async function StoragePage() {
  if (await requireAdminSession()) redirect('/admin/login')
  const status = storageStatus()
  return <div className="flex min-h-screen"><AdminNav /><main className="min-w-0 flex-1 space-y-8 p-6 md:p-10">
    <h1 className="type-h2">Storage</h1>
    <section className="max-w-3xl space-y-3 border border-ink-100 p-6">
      <h2 className="text-xl font-semibold">Portfolio uploads</h2>
      <p>Selected provider: <strong>{status.provider}</strong></p>
      <p>{status.missing.length ? `R2 setup still needs: ${status.missing.join(', ')}.` : 'R2 environment settings are present. Upload a small image to verify credentials, public access and CORS.'}</p>
      <p>Existing Supabase files keep their saved addresses. New admin uploads use R2 after you set UPLOAD_STORAGE_PROVIDER=r2 and restart or redeploy.</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Open Cloudflare → Storage &amp; databases → R2. Complete its billing setup and create a Standard bucket for public portfolio media.</li>
        <li>In bucket Settings, connect a public custom domain, such as media.muhammadqasimimran.me. This is your R2_PUBLIC_URL.</li>
        <li>Create an R2 API token with Object Read &amp; Write permission restricted to this bucket.</li>
        <li>Add the account ID, access key ID, secret access key, bucket name and public URL to .env.local and your hosting environment settings. Never put secrets in public fields.</li>
        <li>Apply the CORS policy in docs/r2-cors.json, then enable R2 and redeploy.</li>
      </ol>
      <p>R2’s free allowance is limited; excess storage and requests can incur charges. Store only public files in this bucket.</p>
      <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="underline">Open Cloudflare</a>
    </section>
    <section className="max-w-3xl space-y-3 border border-ink-100 p-6">
      <h2 className="text-xl font-semibold">Google Drive originals</h2>
      <p>Upload originals to your own Drive, copy the file or folder sharing link, and paste it into the Google Drive field on a client case study. No Google password or API key is needed. This shares links; it does not sync your Drive.</p>
      <p>Public case studies need “Anyone with the link” access. Private client delivery can use restricted links shared with that client’s Google account.</p>
      <div className="flex flex-wrap gap-5"><Link href="/admin/logos" className="underline">Client case studies</Link><Link href="/admin/client-projects" className="underline">Private client projects</Link><a href="https://drive.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Open Google Drive</a></div>
    </section>
  </main></div>
}
