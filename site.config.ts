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
    /** The "Download CV" button. Leave empty to generate the PDF live from your resume data
     *  (always up to date). Or put your own PDF in /public and give its path, e.g. '/resume.pdf'. */
    cvFile: '',
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
  // ---- Media kit page (/media-kit) for brands and collaborators -----------------
  // Empty sections are hidden. Add your real audience numbers when you have them.
  mediaKit: {
    intro: 'Software engineer and graphic designer creating content about AI, computer science and design. Open to collaborations, sponsorships and speaking.',
    stats: [] as { value: string; label: string }[],   // e.g. { value: '12K', label: 'Instagram followers' }
    topics: ['AI and machine learning explained', 'Computer science for students', 'Game development with Unity', 'Graphic and UI design'],
    highlights: [
      { title: 'Lead Graphic Designer, TEDxUMT', detail: 'Visual identity and event design.' },
      { title: 'Graphic Designer, UMT Entrepreneurial Society and UMT Happiness Society', detail: 'Campaign and event graphics.' },
      { title: 'Two indie games shipped', detail: 'Hospital of the Damned and Ball Blast, built in Unity.' },
    ],
    downloads: [
      { label: 'Profile photo', href: '/profile.png' },
      { label: 'Logo (512 px)', href: '/icons/512' },
    ],
  },

  // ---- Free download for an email (blog) ------------------------------------
  // Visitors join your newsletter and get this file straight away. Upload the file (e.g. to
  // Supabase storage or /public) and paste its link; empty fileUrl = hidden.
    leadMagnet: {
     title: 'Free CS Student Starter Kit',
     description: '12 free resources I recommend to every new computer science student, on one page. Join the newsletter and download it straight away.',
     fileUrl: '/downloads/cs-student-starter-kit.pdf',
   },

  // ---- Urdu version -------------------------------------------------------
  // Shown when a visitor switches the site to Urdu (the EN / \u0627\u0631\u062f\u0648 button in the menu).
  // Please review: these are translations of the English hero text above. Keep the same number
  // of roles as hero.roles. Menu and button wording lives in lib/i18n.ts.
  urdu: {
    name: '\u0645\u062d\u0645\u062f \u0642\u0627\u0633\u0645 \u0639\u0645\u0631\u0627\u0646',
    firstName: '\u0642\u0627\u0633\u0645',
    /** Contact page intro in Urdu (translation of contact.intro). */
    contactIntro: '\u0686\u0627\u06c1\u06d2 \u0622\u067e \u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631 \u0627\u0646\u062c\u06cc\u0646\u0626\u0631 \u06a9\u06cc \u062a\u0644\u0627\u0634 \u0645\u06cc\u06ba \u06c1\u0648\u06ba\u060c \u06a9\u0633\u06cc \u0646\u0626\u06d2 \u06a9\u0627\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u0688\u06cc\u0632\u0627\u0626\u0646\u0631 \u06cc\u0627 \u0628\u0633 \u06c1\u06cc\u0644\u0648 \u06a9\u06c1\u0646\u0627 \u0686\u0627\u06c1\u062a\u06d2 \u06c1\u0648\u06ba\u060c \u0645\u06cc\u0631\u0627 \u0627\u0646 \u0628\u0627\u06a9\u0633 \u06a9\u06be\u0644\u0627 \u06c1\u06d2\u06d4',
    greeting: '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u06cc\u06a9\u0645\u060c \u0645\u06cc\u06ba \u0642\u0627\u0633\u0645 \u06c1\u0648\u06ba',
    roles: ['\u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631 \u0627\u0646\u062c\u06cc\u0646\u0626\u0631', '\u06af\u0631\u0627\u0641\u06a9 \u0688\u06cc\u0632\u0627\u0626\u0646\u0631', '\u06af\u06cc\u0645 \u0688\u06cc\u0648\u0644\u067e\u0631', '\u0627\u06d2 \u0622\u0626\u06cc \u0628\u0644\u0688\u0631'],
    bio: [
      '\u0645\u06cc\u06ba \u0627\u06cc\u06a9 \u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631 \u0627\u0646\u062c\u06cc\u0646\u0626\u0631 \u0627\u0648\u0631 \u06af\u0631\u0627\u0641\u06a9 \u0688\u06cc\u0632\u0627\u0626\u0646\u0631 \u06c1\u0648\u06ba \u062c\u0648 \u0645\u0636\u0628\u0648\u0637\u060c \u06a9\u0627\u0631\u0622\u0645\u062f \u06a9\u0648\u0688 \u0627\u0648\u0631 \u0633\u0627\u062f\u06c1\u060c \u062e\u0648\u0628\u0635\u0648\u0631\u062a \u0688\u06cc\u0632\u0627\u0626\u0646 \u06a9\u0648 \u0627\u06cc\u06a9 \u0633\u0627\u062a\u06be \u0644\u0627\u062a\u0627 \u06c1\u06d2\u06d4 \u0627\u0633 \u0648\u0642\u062a \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0633\u0627\u0626\u0646\u0633 \u0645\u06cc\u06ba \u0628\u06cc \u0627\u06cc\u0633 \u06a9\u0631 \u0631\u06c1\u0627 \u06c1\u0648\u06ba\u060c \u0627\u0648\u0631 \u0645\u06cc\u0631\u06cc \u062a\u0648\u062c\u06c1 \u0622\u0633\u0627\u0646 \u0627\u0648\u0631 \u0631\u0648\u0627\u06ba \u0688\u06cc\u062c\u06cc\u0679\u0644 \u062a\u062c\u0631\u0628\u0627\u062a \u0628\u0646\u0627\u0646\u06d2 \u067e\u0631 \u06c1\u06d2\u06d4',
      '\u06cc\u0648\u0646\u0679\u06cc \u0645\u06cc\u06ba \u06af\u06cc\u0645 \u0645\u06cc\u06a9\u06cc\u0646\u06a9\u0633 \u0627\u0648\u0631 Next.js \u06a9\u06d2 \u0633\u0627\u062a\u06be \u0648\u06cc\u0628 \u0633\u0633\u0679\u0645 \u0628\u0646\u0627\u0646\u06d2 \u0633\u06d2 \u0644\u06d2 \u06a9\u0631 \u0627\u06cc\u0688\u0648\u0628\u06cc \u0633\u0648\u0679 \u06a9\u06cc \u0645\u062f\u062f \u0633\u06d2 \u0645\u06a9\u0645\u0644 \u0628\u0631\u0627\u0646\u0688 \u0634\u0646\u0627\u062e\u062a \u0688\u06cc\u0632\u0627\u0626\u0646 \u06a9\u0631\u0646\u06d2 \u062a\u06a9\u060c \u0645\u062c\u06be\u06d2 \u0645\u0646\u0637\u0642 \u0627\u0648\u0631 \u062a\u062e\u0644\u06cc\u0642 \u06a9\u06d2 \u0633\u0646\u06af\u0645 \u067e\u0631 \u06a9\u0627\u0645 \u06a9\u0631\u0646\u0627 \u067e\u0633\u0646\u062f \u06c1\u06d2\u06d4 \u0628\u06af \u0628\u0631\u06cc\u0646\u0632 \u0644\u0631\u0646\u0646\u06af \u0645\u06cc\u06ba \u0633\u0627\u0641\u0679 \u0648\u06cc\u0626\u0631 \u06a9\u0648\u0627\u0644\u0679\u06cc \u0627\u0646\u062c\u06cc\u0646\u0626\u0631\u0646\u06af \u0627\u0646\u0679\u0631\u0646 \u0634\u067e \u06a9\u06d2 \u062f\u0648\u0631\u0627\u0646\u060c \u062c\u06c1\u0627\u06ba \u06cc\u0648 \u0622\u0626\u06cc/\u06cc\u0648 \u0627\u06cc\u06a9\u0633 \u0679\u06cc\u0633\u0679\u0646\u06af \u0627\u0648\u0631 \u0628\u0627\u0624\u0646\u0688\u0631\u06cc \u0648\u06cc\u0644\u06cc\u0648 \u0627\u06cc\u0646\u0627\u0644\u06cc\u0633\u0633 \u067e\u0631 \u06a9\u0627\u0645 \u06a9\u06cc\u0627\u060c \u062a\u0641\u0635\u06cc\u0644 \u067e\u0631 \u0645\u06cc\u0631\u06cc \u0646\u0638\u0631 \u0645\u0632\u06cc\u062f \u067e\u062e\u062a\u06c1 \u06c1\u0648\u0626\u06cc\u06d4',
    ],
  },

  // ---- Latest videos (homepage) -------------------------------------------
  videos: {
    /** Your YouTube channel ID: starts with "UC", 24 characters. Find it in YouTube Studio ->
     *  Settings -> Channel -> Advanced settings, or in your channel's URL. Empty = section hidden. */
    youtubeChannelId: '',
  },

  // ---- Tech Stack page (/tech-stack) --------------------------------------
  // Each group is a section; each item is one tool: name, what it is, and how you use it.
  techStack: [
    {
      category: "Hardware & Performance Workstation",
      items: [
        {
          name: "AMD Ryzen 5 7500F & RX 6750 XT",
          role: "Primary Rig",
          usage: "Handles heavy multi-threaded C# compilation, real-time lighting bakes in Unity 3D, and high-resolution graphic design workflows across Adobe Illustrator and Photoshop without frame drops."
        },
        {
          name: "Jmary MC-PW12 Microphone",
          role: "Audio Capture",
          usage: "Used for recording clear audio narration and voiceovers for tutorials published on the QasimDevelops YouTube channel."
        },
        {
          name: "Cyber Acoustics WC-3000 Webcam",
          role: "Video & Streaming",
          usage: "Powers video communication, live sessions, and collaborative virtual meetings."
        }
      ]
    },
    {
      category: "Game Development & Software Engineering",
      items: [
        {
          name: "Unity 3D & C#",
          role: "Game Engine",
          usage: "Engineered complex mechanics, custom inventory systems, and save/load logic for projects like 'Hospital of the Damned' and physics-driven simulations."
        },
        {
          name: "Next.js & TypeScript",
          role: "Web Architecture",
          usage: "Powers this high-performance portfolio, ensuring fast server-side rendering, smooth MDX blog integration, and strict type safety."
        },
        {
          name: "Python & TensorFlow",
          role: "AI & Machine Learning",
          usage: "Applied in building deep learning tools like the Brain Tumor MRI Classifier and backend logic for the bilingual AI Urdu Teaching Assistant."
        },
        {
          name: "Node.js & Playwright",
          role: "Automation",
          usage: "Utilized for script-driven browser task execution, web scraping, and automated content distribution tools like the LinkedIn Automator."
        }
      ]
    },
    {
      category: "Visual Design & Creative Branding",
      items: [
        {
          name: "Adobe Illustrator & Photoshop",
          role: "Vector & Raster Graphics",
          usage: "Employed during graphic design leadership roles (such as for TEDxUMTLahore) to build crisp brand identities, promotional assets, and UI components."
        },
        {
          name: "Figma",
          role: "UI/UX Prototyping",
          usage: "Used to blueprint modern application layouts, wireframes, and design systems for mobile and web apps like NovaPay."
        }
      ]
    }
  ],

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
