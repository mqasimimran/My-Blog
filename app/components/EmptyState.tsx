type IconName = 'search' | 'inbox' | 'image' | 'sparkle'

const ICONS: Record<IconName, React.ReactNode> = {
  search: (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="24" cy="24" r="14" stroke="#aa002a" strokeWidth="2.5" opacity="0.4" />
      <line x1="34" y1="34" x2="46" y2="46" stroke="#aa002a" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  inbox: (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect x="8" y="18" width="40" height="30" rx="4" stroke="#aa002a" strokeWidth="2.5" opacity="0.4" />
      <path d="M8 30h12l4 6h8l4-6h12" stroke="#aa002a" strokeWidth="2.5" strokeLinejoin="round" opacity="0.4" />
    </svg>
  ),
  image: (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect x="8" y="10" width="40" height="36" rx="4" stroke="#aa002a" strokeWidth="2.5" opacity="0.4" />
      <circle cx="20" cy="22" r="4" stroke="#aa002a" strokeWidth="2.5" opacity="0.4" />
      <path d="M12 40l10-10 8 8 8-8 10 10" stroke="#aa002a" strokeWidth="2.5" strokeLinejoin="round" opacity="0.4" />
    </svg>
  ),
  sparkle: (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path d="M28 8l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" stroke="#aa002a" strokeWidth="2.5" strokeLinejoin="round" opacity="0.4" />
    </svg>
  ),
}

export default function EmptyState({ icon = 'sparkle', title, description }: { icon?: IconName; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {ICONS[icon]}
      <p className="text-sm font-medium text-ink-500 mt-5">{title}</p>
      {description && <p className="text-xs text-ink-300 mt-1.5 max-w-xs">{description}</p>}
    </div>
  )
}
