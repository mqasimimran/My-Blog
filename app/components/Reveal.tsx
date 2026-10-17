// Kept so existing pages keep working. Scroll animation now happens site-wide, piece by piece,
// in ScrollAnimator.tsx (mounted in layout.tsx), so this is just a plain wrapper.
export default function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string; index?: number }) {
  return <div className={className}>{children}</div>
}
