import type { Metadata } from 'next'
import Link from 'next/link'

import { siteConfig } from '@/site.config'
import SplitText from '@/app/components/ui/SplitText'
import { getT } from '@/lib/locale'
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How this site collects, uses, and protects information, including contact messages, newsletter signups, analytics, comments, and advertising.',
}

const LAST_UPDATED = 'September 2026'

export default async function PrivacyPage() {
  const { locale } = await getT()
  return (
    <main>
      {locale === 'ur' && (
        <p lang="ur" dir="rtl" className="container-page mt-10 border-s-2 border-accent-600 bg-ink-50 p-4 text-[15px] text-ink-700">
          {'\u06cc\u06c1 \u0631\u0627\u0632\u062f\u0627\u0631\u06cc \u06a9\u06cc \u067e\u0627\u0644\u06cc\u0633\u06cc \u0627\u0646\u06af\u0631\u06cc\u0632\u06cc \u0645\u06cc\u06ba \u06c1\u06d2\u06d4 \u06a9\u0648\u0626\u06cc \u0633\u0648\u0627\u0644 \u06c1\u0648 \u062a\u0648 \u0631\u0627\u0628\u0637\u06c1 \u06a9\u0631\u06cc\u06ba\u06d4'}
        </p>
      )}
      <div dir="ltr" lang="en">
      <header className="container-page pb-10 pt-12 md:pb-14 md:pt-20">
        <h1 className="type-display text-ink-900"><SplitText text={"Privacy Policy"} /></h1>
        <p className="type-meta mt-5">Last updated {LAST_UPDATED}</p>
      </header>

      <article className="container-page space-y-10 pb-24 text-[17px] leading-[1.75] text-ink-700 [&>*]:max-w-3xl">

        <p>
          This is the personal portfolio and blog of {siteConfig.name}. This page explains, in plain
          language, what information the site collects, why, and who else handles it.
        </p>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Information you give me directly"} /></h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-ink-900">Contact form.</strong> If you send a message, I collect the name, email
              address, subject, and message you enter. It is stored in the site's database and emailed to me so I can
              reply. Your IP address is also recorded briefly to limit spam and repeated submissions.
            </li>
            <li>
              <strong className="text-ink-900">Newsletter.</strong> If you subscribe, your email address is stored so I
              can send you new posts. You can ask to be removed at any time through the contact page.
            </li>
            <li>
              <strong className="text-ink-900">Comments.</strong> Blog comments are powered by giscus and stored as
              GitHub Discussions. Commenting requires a GitHub account and is governed by GitHub's own privacy
              practices.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Information collected automatically"} /></h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-ink-900">Analytics.</strong> The site uses Vercel Web Analytics to understand
              which pages are visited. It reports aggregated usage and does not use cookies to track you across sites.
            </li>
            <li>
              <strong className="text-ink-900">Reactions.</strong> When you tap the reaction button on a post, a small
              marker is saved in your own browser (local storage) so the button knows you've already reacted. The
              reaction count itself is stored anonymously.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Advertising"} /></h2>
          <p className="mb-3">
            This site may display ads served by Google AdSense. Third-party vendors, including Google, use cookies to
            serve ads based on a user's prior visits to this and other websites. Google's use of advertising cookies
            enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the
            internet.
          </p>
          <p>
            You can opt out of personalized advertising by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-accent-600 underline">
              Google Ads Settings
            </a>
            , or learn more about opting out of third-party vendors' use of cookies at{' '}
            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-accent-600 underline">
              aboutads.info
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Services that handle data on this site’s behalf"} /></h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Supabase: database and file storage for site content, messages, and subscriber emails.</li>
            <li>Vercel: hosting and analytics.</li>
            <li>Resend: delivers the email notification when someone uses the contact form.</li>
            <li>GitHub (via giscus): blog comments.</li>
            <li>Google AdSense: advertising.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"How long information is kept"} /></h2>
          <p>
            Contact messages and newsletter emails are kept until I delete them or you ask me to. Spam-prevention
            records (IP address and timestamp) are only used to detect repeated submissions.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Your choices"} /></h2>
          <p>
            You can ask to see, correct, or delete the information I hold about you, or unsubscribe from the
            newsletter, by getting in touch through the{' '}
            <Link href="/contact" className="text-accent-600 underline">contact page</Link>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink-900 mb-3"><SplitText text={"Changes to this policy"} /></h2>
          <p>
            If how the site handles information changes, I'll update this page and the date at the top.
          </p>
        </div>

      </article>
          </div>
    </main>
  )
}
