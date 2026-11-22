import { isDriveLink } from '@/lib/clientSocialLinks'
import { useState } from 'react'

export default function ClientSocialField({value, onChange}: {value: string; onChange: (value: string) => void}) {
  const links = value.split('\n')
  const drive = links.filter(isDriveLink)
  const social = links.filter(link => !isDriveLink(link))
  const savedDrive = drive[0] || ''
  const [draft, setDraft] = useState<{ base: string; text: string } | null>(null)
  const driveDraft = draft?.base === savedDrive ? draft.text : savedDrive
  return <div className="space-y-4"><label className="block text-sm">
    Social media links (optional)
    <textarea value={social.join('\n')} onChange={event => onChange([...event.target.value.split('\n'), ...drive].join('\n'))} rows={2}
      placeholder="@instagram_handle" className="mt-1 block w-full border border-ink-100 bg-paper p-3" />
    <span className="mt-1 block text-xs text-ink-500">Enter one profile URL per line. For Instagram, you can also enter @username.</span>
  </label>
    <label className="block text-sm">Google Drive files or folder (optional)
      <input type="url" pattern="https://drive\.google\.com/.*" value={driveDraft}
        onChange={event => {
          const next = event.target.value
          setDraft({ base: savedDrive, text: next })
          if (!next || isDriveLink(next)) onChange([...social, next, ...drive.slice(1)].filter(Boolean).join('\n'))
        }}
        placeholder="https://drive.google.com/drive/folders/…" className="mt-1 block w-full border border-ink-100 bg-paper p-3" />
      <span className="mt-1 block text-xs text-ink-500">Shown publicly on the client case study and its campaigns. Share only the intended file or folder with “Anyone with the link”. Keep confidential files restricted in Client Projects.</span>
    </label>
  </div>
}
