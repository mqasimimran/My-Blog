'use client'
import SplitText from '@/app/components/ui/SplitText'
import { siteConfig } from '@/site.config'
import { useLocale } from '@/app/components/LocaleProvider'
import GitHubActivity from '@/app/components/GitHubActivity'


export default function TechStackPage() {
  const { tx } = useLocale()
  // The list lives in site.config.ts -> techStack, so it's edited in one place.
  const techCategories = siteConfig.techStack

  return (
    <main className="pb-24">
      <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
        <h1 className="type-display max-w-[16ch] text-ink-900"><SplitText text={tx("Tech Stack & Hardware")} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">{tx("The hardware and software behind my development and creative work, and what each one is actually used for.")}</p>
      </header>

      <div className="container-page">
        {techCategories.map((group) => (
          <section key={group.category} className="grid gap-8 border-t border-ink-100 py-14 md:grid-cols-12 md:gap-10 md:py-16">
            <div className="md:col-span-4">
              <h2 className="type-h3 max-w-[18ch] text-ink-900 md:sticky md:top-28">{group.category}</h2>
            </div>
            <ul className="divide-y divide-ink-100 md:col-span-8">
              {group.items.map((tool) => (
                <li key={tool.name} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-lg font-medium tracking-tight text-ink-900">{tool.name}</h3>
                    <span className="type-meta">{tool.role}</span>
                  </div>
                  <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-700">{tool.usage}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <GitHubActivity />
    </main>
  )
}
