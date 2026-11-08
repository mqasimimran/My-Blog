export default function ClientSocialField({value, onChange}: {value: string; onChange: (value: string) => void}) {
  return <label className="block text-sm">
    Social media links (optional)
    <textarea value={value} onChange={event => onChange(event.target.value)} rows={2}
      placeholder="@instagram_handle" className="mt-1 block w-full border border-ink-100 bg-paper p-3" />
    <span className="mt-1 block text-xs text-ink-500">Enter one profile URL per line. For Instagram, you can also enter @username.</span>
  </label>
}
