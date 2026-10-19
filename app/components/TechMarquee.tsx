const TOOLS = [
  'Unity 3D',
  'C#',
  'Python',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Figma',
  'TensorFlow',
  'Node.js',
  'Playwright',
  'Django',
  'React.js',
]

export default function TechMarquee() {
  return (
    <section aria-label="Tools and technologies" className="select-none overflow-hidden border-y border-ink-100 bg-paper py-5">
      <div className="animate-marquee items-center">
        {/* The list is rendered twice for a seamless loop; the copy is hidden from screen readers. */}
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {TOOLS.map((tool) => (
              <li key={tool} className="flex items-center whitespace-nowrap font-display text-[clamp(2.75rem,1.5rem+5vw,6.5rem)] uppercase leading-none text-ink-900">
                {tool}
                <span aria-hidden className="px-[0.35em] text-ink-300">/</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
