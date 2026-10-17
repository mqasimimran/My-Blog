import { Image as ImageIcon, MagnifyingGlass, Sparkle, Tray } from '@phosphor-icons/react/dist/ssr'

type IconName = 'search' | 'inbox' | 'image' | 'sparkle'

const ICONS: Record<IconName, React.ComponentType<{ size?: number; weight?: 'light'; 'aria-hidden'?: boolean; className?: string }>> = {
  search: MagnifyingGlass,
  inbox: Tray,
  image: ImageIcon,
  sparkle: Sparkle,
}

export default function EmptyState({ icon = 'sparkle', title, description }: { icon?: IconName; title: string; description?: string }) {
  const Icon = ICONS[icon]
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <Icon size={44} weight="light" aria-hidden className="text-ink-300" />
      <p className="mt-6 text-base font-medium text-ink-900">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>}
    </div>
  )
}
