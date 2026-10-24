// English and Urdu wording for the site's fixed text (menus, headings, buttons, forms).
// Content from the database (posts, projects...) stays in the language it was written in.
// To change a translation, edit the 'ur' entry. Every key must exist in both languages.
import { UR } from '@/lib/i18n-ur'

export type Locale = 'en' | 'ur'
export const LOCALES: Locale[] = ['en', 'ur']
export const isRtl = (l: Locale) => l === 'ur'

const en = {
  'nav.home': 'Home', 'nav.work': 'Work', 'nav.projects': 'Projects', 'nav.design': 'Design', 'nav.blog': 'Blog',
  'nav.shop': 'Shop', 'nav.services': 'Services', 'nav.about': 'About', 'nav.journey': 'My Journey', 'nav.resume': 'Resume',
  'nav.techStack': 'Tech Stack', 'nav.contact': 'Contact',
  'nav.projects.desc': 'Software, AI and games', 'nav.design.desc': 'Graphic and UI design', 'nav.wallpapers': 'Wallpapers', 'nav.wallpapers.desc': 'Free and premium wallpapers', 'nav.courses': 'Courses', 'nav.courses.desc': 'Free short courses',
  'nav.journey.desc': 'My story so far', 'nav.resume.desc': 'Experience and CV', 'nav.techStack.desc': 'The tools I use',
  'nav.openSearch': 'Open search', 'nav.closeSearch': 'Close search', 'nav.searchLabel': 'Search the site',
  'nav.searchPlaceholder': 'Search projects, posts, design, services', 'nav.openMenu': 'Open menu', 'nav.closeMenu': 'Close menu',
  'lang.switch': '\u0627\u0631\u062f\u0648', 'lang.switchLabel': 'Read this site in Urdu',
  'footer.cta': 'Let\u2019s build something.', 'footer.explore': 'Explore', 'footer.elsewhere': 'Elsewhere', 'footer.roadmap': 'Roadmap', 'footer.mediaKit': 'Media kit',
  'footer.rights': 'All rights reserved.', 'footer.privacy': 'Privacy Policy', 'footer.rss': 'RSS feed',
  'home.iam': 'I\'m', 'home.iamEnd': '', 'home.viewWork': 'View my work \u2192', 'home.featuredWork': 'Featured work',
  'home.stats.title': 'Numbers that reflect the work', 'home.stats.meta': '(Live from this site)',
  'home.stats.projects': 'Projects shipped across software, games and AI', 'home.stats.designs': 'Design pieces published in the gallery',
  'home.stats.articles': 'Articles written on engineering and design', 'home.stats.certs': 'Certifications and licenses earned',
  'home.testimonials': 'What people say', 'home.testimonials.one': 'kind word', 'home.testimonials.many': 'kind words',
  'home.blog.title': 'From the blog', 'home.blog.meta': '(Latest writing)', 'home.blog.desc': 'Writing on engineering, design, and the journey behind the projects.',
  'home.design.title': 'Featured design', 'home.design.meta': '(Selected pieces)', 'home.design.desc': 'A few pieces from the visual design side: brand identities, UI/UX, and promotional work.',
  'home.videos.title': 'Latest videos', 'home.videos.meta': '(From YouTube)', 'home.videos.channel': 'See the channel',
  'home.workSeenAt': 'Work seen at',
  'certs.title': 'Licenses and certifications', 'certs.desc': 'Verified credentials across software, design, and AI.', 'certs.meta': '(Verified)',
  'projects.title': 'Project archive', 'projects.desc': 'A complete collection of my work across software engineering, machine learning, game development, and design.',
  'shop.title': 'Store', 'shop.desc': 'Templates, design resources, and a few physical pieces. Browse what\u2019s available below.', 'shop.track': 'Already ordered? Track your order',
  'blog.rss': 'Follow by RSS',
  'assistant.open': 'Ask about {name}', 'assistant.close': 'Close the assistant', 'assistant.hello': 'Hi! I can answer questions about {name}\u2019s projects, skills, services and availability.',
  'assistant.q1': 'What has {name} built?', 'assistant.q2': 'Is {name} available for work?', 'assistant.q3': 'What services and prices are there?',
  'assistant.placeholder': 'Ask a question', 'assistant.send': 'Send', 'assistant.thinking': 'Thinking...', 'assistant.note': 'Answers come from this site\u2019s content. AI can make mistakes.',
  'assistant.error': 'Something went wrong. Please try again.',
  'whatsapp.label': 'Chat on WhatsApp',
}
export type Key = keyof typeof en

const ur: Record<Key, string> = {
  'nav.home': '\u06c1\u0648\u0645', 'nav.work': '\u06a9\u0627\u0645', 'nav.projects': '\u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633', 'nav.design': '\u0688\u06cc\u0632\u0627\u0626\u0646', 'nav.blog': '\u0628\u0644\u0627\u06af',
  'nav.shop': '\u0634\u0627\u067e', 'nav.services': '\u062e\u062f\u0645\u0627\u062a', 'nav.about': '\u062a\u0639\u0627\u0631\u0641', 'nav.journey': '\u0645\u06cc\u0631\u0627 \u0633\u0641\u0631', 'nav.resume': '\u0631\u06cc\u0632\u06cc\u0648\u0645\u06d2',
  'nav.techStack': '\u0679\u06cc\u06a9 \u0627\u0633\u0679\u06cc\u06a9', 'nav.contact': '\u0631\u0627\u0628\u0637\u06c1',
  'nav.projects.desc': '\u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631\u060c \u0627\u06d2 \u0622\u0626\u06cc \u0627\u0648\u0631 \u06af\u06cc\u0645\u0632', 'nav.design.desc': '\u06af\u0631\u0627\u0641\u06a9 \u0627\u0648\u0631 \u06cc\u0648 \u0622\u0626\u06cc \u0688\u06cc\u0632\u0627\u0626\u0646', 'nav.wallpapers': '\u0648\u0627\u0644 \u067e\u06cc\u067e\u0631\u0632', 'nav.wallpapers.desc': '\u0645\u0641\u062a \u0627\u0648\u0631 \u067e\u0631\u06cc\u0645\u06cc\u0645 \u0648\u0627\u0644 \u067e\u06cc\u067e\u0631\u0632', 'nav.courses': '\u06a9\u0648\u0631\u0633\u0632', 'nav.courses.desc': '\u0645\u0641\u062a \u0645\u062e\u062a\u0635\u0631 \u06a9\u0648\u0631\u0633\u0632',
  'nav.journey.desc': '\u0627\u0628 \u062a\u06a9 \u06a9\u06cc \u06a9\u06c1\u0627\u0646\u06cc', 'nav.resume.desc': '\u062a\u062c\u0631\u0628\u06c1 \u0627\u0648\u0631 \u0633\u06cc \u0648\u06cc', 'nav.techStack.desc': '\u0645\u06cc\u0631\u06d2 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u06d2 \u0679\u0648\u0644\u0632',
  'nav.openSearch': '\u062a\u0644\u0627\u0634 \u06a9\u06be\u0648\u0644\u06cc\u06ba', 'nav.closeSearch': '\u062a\u0644\u0627\u0634 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba', 'nav.searchLabel': '\u0633\u0627\u0626\u0679 \u0645\u06cc\u06ba \u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba',
  'nav.searchPlaceholder': '\u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633\u060c \u062a\u062d\u0631\u06cc\u0631\u06cc\u06ba\u060c \u0688\u06cc\u0632\u0627\u0626\u0646 \u0627\u0648\u0631 \u062e\u062f\u0645\u0627\u062a \u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba', 'nav.openMenu': '\u0645\u06cc\u0646\u0648 \u06a9\u06be\u0648\u0644\u06cc\u06ba', 'nav.closeMenu': '\u0645\u06cc\u0646\u0648 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba',
  'lang.switch': 'EN', 'lang.switchLabel': '\u06cc\u06c1 \u0633\u0627\u0626\u0679 \u0627\u0646\u06af\u0631\u06cc\u0632\u06cc \u0645\u06cc\u06ba \u067e\u0691\u06be\u06cc\u06ba',
  'footer.cta': '\u0622\u0626\u06cc\u06d2 \u0645\u0644 \u06a9\u0631 \u06a9\u0686\u06be \u0628\u0646\u0627\u0626\u06cc\u06ba\u06d4', 'footer.explore': '\u062f\u06cc\u06a9\u06be\u06cc\u06ba', 'footer.elsewhere': '\u062f\u06cc\u06af\u0631 \u062c\u06af\u06c1\u0648\u06ba \u067e\u0631', 'footer.roadmap': '\u0631\u0648\u0688 \u0645\u06cc\u067e', 'footer.mediaKit': '\u0645\u06cc\u0688\u06cc\u0627 \u06a9\u0679',
  'footer.rights': '\u062c\u0645\u0644\u06c1 \u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638 \u06c1\u06cc\u06ba\u06d4', 'footer.privacy': '\u0631\u0627\u0632\u062f\u0627\u0631\u06cc \u06a9\u06cc \u067e\u0627\u0644\u06cc\u0633\u06cc', 'footer.rss': '\u0622\u0631 \u0627\u06cc\u0633 \u0627\u06cc\u0633 \u0641\u06cc\u0688',
  'home.iam': '\u0645\u06cc\u06ba', 'home.iamEnd': '\u06c1\u0648\u06ba', 'home.viewWork': '\u0645\u06cc\u0631\u0627 \u06a9\u0627\u0645 \u062f\u06cc\u06a9\u06be\u06cc\u06ba \u2190', 'home.featuredWork': '\u0645\u0646\u062a\u062e\u0628 \u06a9\u0627\u0645',
  'home.stats.title': '\u06a9\u0627\u0645 \u06a9\u06cc \u0639\u06a9\u0627\u0633\u06cc \u06a9\u0631\u062a\u06d2 \u0627\u0639\u062f\u0627\u062f', 'home.stats.meta': '(\u0627\u0633 \u0633\u0627\u0626\u0679 \u0633\u06d2 \u0628\u0631\u0627\u06c1\u0650 \u0631\u0627\u0633\u062a)',
  'home.stats.projects': '\u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631\u060c \u06af\u06cc\u0645\u0632 \u0627\u0648\u0631 \u0627\u06d2 \u0622\u0626\u06cc \u0645\u06cc\u06ba \u0645\u06a9\u0645\u0644 \u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633', 'home.stats.designs': '\u06af\u06cc\u0644\u0631\u06cc \u0645\u06cc\u06ba \u0634\u0627\u0626\u0639 \u0688\u06cc\u0632\u0627\u0626\u0646',
  'home.stats.articles': '\u0627\u0646\u062c\u06cc\u0646\u0626\u0631\u0646\u06af \u0627\u0648\u0631 \u0688\u06cc\u0632\u0627\u0626\u0646 \u067e\u0631 \u062a\u062d\u0631\u06cc\u0631\u06cc\u06ba', 'home.stats.certs': '\u062d\u0627\u0635\u0644 \u06a9\u0631\u062f\u06c1 \u0633\u0631\u0679\u06cc\u0641\u06cc\u06a9\u06cc\u0634\u0646\u0632 \u0627\u0648\u0631 \u0644\u0627\u0626\u0633\u0646\u0633',
  'home.testimonials': '\u0644\u0648\u06af \u06a9\u06cc\u0627 \u06a9\u06c1\u062a\u06d2 \u06c1\u06cc\u06ba', 'home.testimonials.one': '\u062a\u0628\u0635\u0631\u06c1', 'home.testimonials.many': '\u062a\u0628\u0635\u0631\u06d2',
  'home.blog.title': '\u0628\u0644\u0627\u06af \u0633\u06d2', 'home.blog.meta': '(\u062a\u0627\u0632\u06c1 \u062a\u062d\u0631\u06cc\u0631\u06cc\u06ba)', 'home.blog.desc': '\u0627\u0646\u062c\u06cc\u0646\u0626\u0631\u0646\u06af\u060c \u0688\u06cc\u0632\u0627\u0626\u0646 \u0627\u0648\u0631 \u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633 \u06a9\u06d2 \u067e\u06cc\u0686\u06be\u06d2 \u06a9\u06d2 \u0633\u0641\u0631 \u067e\u0631 \u062a\u062d\u0631\u06cc\u0631\u06cc\u06ba\u06d4',
  'home.design.title': '\u0645\u0646\u062a\u062e\u0628 \u0688\u06cc\u0632\u0627\u0626\u0646', 'home.design.meta': '(\u0645\u0646\u062a\u062e\u0628 \u0646\u0645\u0648\u0646\u06d2)', 'home.design.desc': '\u0628\u0635\u0631\u06cc \u0688\u06cc\u0632\u0627\u0626\u0646 \u06a9\u06d2 \u0686\u0646\u062f \u0646\u0645\u0648\u0646\u06d2: \u0628\u0631\u0627\u0646\u0688 \u0634\u0646\u0627\u062e\u062a\u060c \u06cc\u0648 \u0622\u0626\u06cc/\u06cc\u0648 \u0627\u06cc\u06a9\u0633 \u0627\u0648\u0631 \u062a\u0634\u06c1\u06cc\u0631\u06cc \u06a9\u0627\u0645\u06d4',
  'home.videos.title': '\u062a\u0627\u0632\u06c1 \u0648\u06cc\u0688\u06cc\u0648\u0632', 'home.videos.meta': '(\u06cc\u0648\u0679\u06cc\u0648\u0628 \u0633\u06d2)', 'home.videos.channel': '\u0686\u06cc\u0646\u0644 \u062f\u06cc\u06a9\u06be\u06cc\u06ba',
  'home.workSeenAt': '\u062c\u0646 \u0627\u062f\u0627\u0631\u0648\u06ba \u06a9\u06d2 \u0633\u0627\u062a\u06be \u06a9\u0627\u0645 \u06a9\u06cc\u0627',
  'certs.title': '\u0644\u0627\u0626\u0633\u0646\u0633 \u0627\u0648\u0631 \u0633\u0631\u0679\u06cc\u0641\u06cc\u06a9\u06cc\u0634\u0646\u0632', 'certs.desc': '\u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631\u060c \u0688\u06cc\u0632\u0627\u0626\u0646 \u0627\u0648\u0631 \u0627\u06d2 \u0622\u0626\u06cc \u0645\u06cc\u06ba \u062a\u0635\u062f\u06cc\u0642 \u0634\u062f\u06c1 \u0627\u0633\u0646\u0627\u062f\u06d4', 'certs.meta': '(\u062a\u0635\u062f\u06cc\u0642 \u0634\u062f\u06c1)',
  'projects.title': '\u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633 \u06a9\u0627 \u0645\u062c\u0645\u0648\u0639\u06c1', 'projects.desc': '\u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631 \u0627\u0646\u062c\u06cc\u0646\u0626\u0631\u0646\u06af\u060c \u0645\u0634\u06cc\u0646 \u0644\u0631\u0646\u0646\u06af\u060c \u06af\u06cc\u0645 \u0688\u06cc\u0648\u0644\u067e\u0645\u0646\u0679 \u0627\u0648\u0631 \u0688\u06cc\u0632\u0627\u0626\u0646 \u0645\u06cc\u06ba \u0645\u06cc\u0631\u06d2 \u06a9\u0627\u0645 \u06a9\u0627 \u0645\u06a9\u0645\u0644 \u0645\u062c\u0645\u0648\u0639\u06c1\u06d4',
  'shop.title': '\u0627\u0633\u0679\u0648\u0631', 'shop.desc': '\u0679\u06cc\u0645\u067e\u0644\u06cc\u0679\u0633\u060c \u0688\u06cc\u0632\u0627\u0626\u0646 \u0631\u06cc\u0633\u0648\u0631\u0633\u0632 \u0627\u0648\u0631 \u0686\u0646\u062f \u062c\u0633\u0645\u0627\u0646\u06cc \u0627\u0634\u06cc\u0627\u0621\u06d4 \u0646\u06cc\u0686\u06d2 \u062f\u0633\u062a\u06cc\u0627\u0628 \u0627\u0634\u06cc\u0627\u0621 \u062f\u06cc\u06a9\u06be\u06cc\u06ba\u06d4', 'shop.track': '\u0622\u0631\u0688\u0631 \u062f\u06d2 \u0686\u06a9\u06d2 \u06c1\u06cc\u06ba\u061f \u0627\u067e\u0646\u06d2 \u0622\u0631\u0688\u0631 \u06a9\u06cc \u0635\u0648\u0631\u062a\u062d\u0627\u0644 \u062f\u06cc\u06a9\u06be\u06cc\u06ba',
  'blog.rss': '\u0622\u0631 \u0627\u06cc\u0633 \u0627\u06cc\u0633 \u06a9\u06d2 \u0630\u0631\u06cc\u0639\u06d2 \u0641\u0627\u0644\u0648 \u06a9\u0631\u06cc\u06ba',
  'assistant.open': '{name} \u06a9\u06d2 \u0628\u0627\u0631\u06d2 \u0645\u06cc\u06ba \u067e\u0648\u0686\u06be\u06cc\u06ba', 'assistant.close': '\u0627\u0633\u0633\u0679\u0646\u0679 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba', 'assistant.hello': '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u06cc\u06a9\u0645! \u0645\u06cc\u06ba {name} \u06a9\u06d2 \u067e\u0631\u0627\u062c\u06cc\u06a9\u0679\u0633\u060c \u0645\u06c1\u0627\u0631\u062a\u0648\u06ba\u060c \u062e\u062f\u0645\u0627\u062a \u0627\u0648\u0631 \u062f\u0633\u062a\u06cc\u0627\u0628\u06cc \u06a9\u06d2 \u0628\u0627\u0631\u06d2 \u0645\u06cc\u06ba \u0633\u0648\u0627\u0644\u0627\u062a \u06a9\u06d2 \u062c\u0648\u0627\u0628 \u062f\u06d2 \u0633\u06a9\u062a\u0627 \u06c1\u0648\u06ba\u06d4',
  'assistant.q1': '{name} \u0646\u06d2 \u06a9\u06cc\u0627 \u06a9\u06cc\u0627 \u0628\u0646\u0627\u06cc\u0627 \u06c1\u06d2\u061f', 'assistant.q2': '\u06a9\u06cc\u0627 {name} \u06a9\u0627\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u062f\u0633\u062a\u06cc\u0627\u0628 \u06c1\u06cc\u06ba\u061f', 'assistant.q3': '\u06a9\u0648\u0646 \u0633\u06cc \u062e\u062f\u0645\u0627\u062a \u0627\u0648\u0631 \u0642\u06cc\u0645\u062a\u06cc\u06ba \u06c1\u06cc\u06ba\u061f',
  'assistant.placeholder': '\u0633\u0648\u0627\u0644 \u067e\u0648\u0686\u06be\u06cc\u06ba', 'assistant.send': '\u0628\u06be\u06cc\u062c\u06cc\u06ba', 'assistant.thinking': '\u0633\u0648\u0686 \u0631\u06c1\u0627 \u06c1\u0648\u06ba...', 'assistant.note': '\u062c\u0648\u0627\u0628\u0627\u062a \u0627\u0633 \u0633\u0627\u0626\u0679 \u06a9\u06d2 \u0645\u0648\u0627\u062f \u0633\u06d2 \u0622\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u0627\u06d2 \u0622\u0626\u06cc \u063a\u0644\u0637\u06cc \u06a9\u0631 \u0633\u06a9\u062a\u06cc \u06c1\u06d2\u06d4',
  'assistant.error': '\u06a9\u0686\u06be \u063a\u0644\u0637 \u06c1\u0648 \u06af\u06cc\u0627\u06d4 \u062f\u0648\u0628\u0627\u0631\u06c1 \u06a9\u0648\u0634\u0634 \u06a9\u0631\u06cc\u06ba\u06d4',
  'whatsapp.label': '\u0648\u0627\u0679\u0633 \u0627\u06cc\u067e \u067e\u0631 \u0628\u0627\u062a \u06a9\u0631\u06cc\u06ba',
}

const DICTS: Record<Locale, Record<Key, string>> = { en, ur }

/** Looks up a phrase; {name}-style placeholders are filled from vars. */
export function translate(locale: Locale, key: Key, vars?: Record<string, string>): string {
  let s = DICTS[locale]?.[key] ?? en[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}

/** Translates a phrase by its English text (see lib/i18n-ur.ts). Unknown phrases stay in English. */
let LOWER: Record<string, string> | null = null
export function tr(locale: Locale, text: string): string {
  if (locale !== 'ur') return text
  const hit = UR[text]
  if (hit !== undefined) return hit
  // Data often arrives in a different case ("LIVE", "web apps"): match ignoring capitals.
  LOWER ??= Object.fromEntries(Object.entries(UR).map(([k, v]) => [k.toLowerCase(), v]))
  return LOWER[text.toLowerCase()] ?? text
}

/** The locale to format dates in: Urdu month names for Urdu visitors. */
export const dateLocale = (locale: Locale) => (locale === 'ur' ? 'ur-PK' : 'en-US')
