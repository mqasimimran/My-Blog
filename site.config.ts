/**
 * SITE CONFIG — the one file that says who this site belongs to.
 *
 * Everything that identifies the site owner lives here: name, domain,
 * emails, social links, hero text. Pages, emails, metadata, structured
 * data, the sitemap, RSS feed and social-preview images all read from this
 * file — so personalising the template means editing THIS file (plus your
 * environment variables and database content), not hunting through dozens
 * of pages.
 *
 * Plain data on purpose (no secrets, no server-only code), so it can be
 * imported from both server and client components. Secrets — passwords,
 * API keys — belong in environment variables (see .env.example), never here.
 */

const name = 'Muhammad Qasim Imran'
const firstName = 'Qasim'
const mailDomain = 'muhammadqasimimran.me'

export const siteConfig = {
  // ---- Who you are --------------------------------------------------------
  name,
  /** Used in casual copy: "Hi Qasim!", "Logged in as Qasim" */
  firstName,
  /** Letters drawn inside the favicon / app icon (1-3 characters) */
  initials: 'MQ',
  /** Short app name for the home-screen icon (keep under ~12 characters) */
  shortName: 'MQ Imran',
  jobTitle: 'Software Engineer & Graphic Designer',
  location: 'Lahore, Pakistan',
  /** The subtitle line on the social-share image */
  skillsLine: 'Web Development · Graphic Design · Unity Game Development',
  /** Default <meta description> and social-card text for the whole site */
  description:
    'Software Engineer and Graphic Designer building Unity games, AI/ML projects, and web apps. Bridging functional code with minimalist design.',

  // ---- Where the site lives ----------------------------------------------
  /**
   * Public production URL, no trailing slash. Powers canonical links,
   * sitemap, RSS, social cards, and links inside emails. Can also be set
   * with the NEXT_PUBLIC_SITE_URL environment variable (handy for staging).
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.muhammadqasimimran.me').replace(/\/+$/, ''),

  // ---- How people reach you ----------------------------------------------
  /** Public contact address shown on the site */
  email: 'm.qasimimran01@gmail.com',
  whatsapp: {
    /** Country code, no "+", no spaces. E.g. +92 300 1234567 -> 923001234567 */
    number: '923249453952',
    message: `Hi ${firstName}! I came across your website and wanted to reach out.`,
  },

  // ---- Outgoing email (via Resend) ---------------------------------------
  mail: {
    /** Domain you've verified in Resend. Until it's verified, emails fall back to onboarding@resend.dev. */
    domain: mailDomain,
    ordersFrom: `${name} <orders@${mailDomain}>`,
    newsletterFrom: `${name} <newsletter@${mailDomain}>`,
    storeFallbackFrom: 'Portfolio Store <onboarding@resend.dev>',
    contactFormFrom: 'Portfolio Contact Form <onboarding@resend.dev>',
  },

  // ---- Profiles -----------------------------------------------------------
  social: {
    youtube: 'https://youtube.com/@qasimdevelops',
    youtubeHandle: 'qasimdevelops',
    linkedin: 'https://www.linkedin.com/in/muhammadqasimimran',
    github: 'https://github.com/mqasimimran',
    instagramPersonal: 'https://instagram.com/muhammadqasimimrann',
    instagramDev: 'https://instagram.com/qasimdevelops',
    portfolio: 'https://muhammadqasimimran1.myportfolio.com/',
    /** Source repo — shown in the browser-console easter egg */
    repo: 'https://github.com/mqasimimran/My-Blog',
  },

  // ---- Homepage -----------------------------------------------------------
  hero: {
    greeting: `Hi, I'm ${firstName}`,
    /** One short sentence (20 words or fewer) shown under the headline */
    tagline: 'Software engineer and graphic designer bridging functional code with minimalist design.',
    /** Hero portrait. A transparent PNG (about 806 x 1050) works best. */
    image: '/profile.png',
    /** The rotating "I'm a ..." words under the greeting */
    roles: ['Software Engineer', 'Graphic Designer', 'Game Developer', 'AI Builder'],
    bio: [
      'I am a Software Engineer and Graphic Designer bridging the gap between highly functional code and minimalist aesthetic design. Currently pursuing a BS in Computer Science, my focus lies in crafting seamless digital experiences.',
      "From engineering robust game mechanics in Unity and building scalable web architecture with Next.js, to designing complete brand identities utilizing the Adobe Suite, I thrive at the intersection of logic and creativity. I've also sharpened that eye for detail through a Software Quality Engineering internship at Big Brains Learning, focused on UI/UX testing and boundary-value analysis.",
    ],
  },

  contact: {
    intro:
      "Whether you are a recruiter looking for a software engineer, a founder needing full-stack architecture, or a collaborator for a 3D game project, I'd love to hear from you.",
  },

  // ---- Resume generator ---------------------------------------------------
  // Contact details printed on the resume from Admin -> Resume -> Download.
  // They follow the public values above, so the resume can never disagree with
  // the site. Only the phone number is specific to the resume.
  resume: {
    get linkedin() { return siteConfig.social.linkedin },
    get github() { return siteConfig.social.github },
    get portfolio() { return `${siteConfig.url}/` },
    get email() { return siteConfig.email },
    phone: '92-324-9453952',
  },

  // ---- Payments -----------------------------------------------------------
  payments: {
    /**
     * Manual transfers the buyer sends and you verify by hand. Delete a line to hide
     * that method everywhere (checkout, admin settings, server). `pkr: true` also
     * shows/records the price in Pakistani rupees. Account details for each are
     * entered under Admin -> Site Settings.
     * (ids must stay one of: jazzcash, easypaisa, bank_transfer, payoneer)
     */
    manualMethods: [
      { id: 'jazzcash', label: 'JazzCash', group: 'Local (Pakistan)', pkr: true },
      { id: 'easypaisa', label: 'EasyPaisa', group: 'Local (Pakistan)', pkr: true },
      { id: 'bank_transfer', label: 'Bank Transfer', group: 'Local (Pakistan)', pkr: true },
      { id: 'payoneer', label: 'Payoneer', group: 'International', pkr: false },
    ],
  },

  // ---- Brand --------------------------------------------------------------
  brand: {
    /**
     * Accent color for places CSS variables can't reach (social-card images,
     * emails). The on-site color is the --color-accent-* tokens in
     * app/globals.css — change both together.
     */
    accent: '#b0233f',
  },

  // ---- Admin sign-in defaults --------------------------------------------
  // Overridden by the ADMIN_USERNAME / ADMIN_NAME / ADMIN_EMAIL environment
  // variables. Passwords and 2FA are never stored here.
  admin: {
    username: 'qasim',
    displayName: firstName,
    email: 'qasimshibli12@gmail.com',
  },
} as const

/** Site URL without trailing slash — "https://example.com" */
export const SITE_URL = siteConfig.url
/** Site URL WITH trailing slash — "https://example.com/" (what metadata/sitemap code expects) */
export const SITE_URL_SLASH = `${siteConfig.url}/`
