export default function VideoLinksField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-ink-900">
      YouTube videos (optional)
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2}
        placeholder="https://www.youtube.com/shorts/…"
        className="mt-2 block w-full border border-ink-100 bg-paper p-3 text-sm font-normal" />
      <span className="mt-1 block text-xs font-normal text-ink-500">Paste one video or Short link per line. Public and unlisted videos can be embedded when the owner allows it.</span>
    </label>
  )
}
