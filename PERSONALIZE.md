# Personalising this template

Everything that says *whose site this is* lives in a few known places.
Work through them in order, then run the checker at the end.

## 1. `site.config.ts` — the main file
Edit the values; pages, emails, metadata, structured data, sitemap, RSS
feed, manifest and social-share images all follow automatically.

| Section | Controls |
|---|---|
| `name`, `firstName`, `initials`, `shortName` | Titles, footer, emails, favicon letters, home-screen app name |
| `jobTitle`, `location`, `description`, `skillsLine` | Tagline, footer, search/social descriptions, share-image subtitle |
| `url` | Canonical URLs, sitemap, RSS, links in emails (or set `NEXT_PUBLIC_SITE_URL`) |
| `email`, `whatsapp` | Contact page, footer, chat button |
| `mail` | Sender names/addresses for order + newsletter emails (domain must be verified in Resend) |
| `social` | Footer, contact, links page, homepage, structured data |
| `hero`, `contact.intro` | Homepage greeting, rotating roles, bio, contact blurb |
| `resume` | Contact details printed on the generated resume (phone is separate) |
| `payments` | Which manual payment methods are listed (JazzCash, EasyPaisa, bank, Payoneer) — see PAYMENTS.md |
| `brand.accent` | Colour in share images/emails. **Also change `--color-accent-*` in `app/globals.css`.** |
| `admin` | Default admin username/display name/email (env vars override) |

## 2. Environment variables
Copy `.env.example` to `.env.local` and fill it in (and add the same in
Vercel). Create the admin credentials with:

    node scripts/admin-setup.mjs hash     # password hash
    node scripts/admin-setup.mjs totp     # optional 2FA

## 3. Database
**New site:** run `supabase/setup.sql` once in the Supabase SQL editor (builds every table and locks the database
down). Optional sample content: `supabase/demo-data.sql` (remove later with `demo-data-remove.sql`).
Then `node scripts/setup.mjs` checks everything. Full walkthrough: **SETUP.md**. Which file when: `supabase/README.md`.
Fill the site with your own content through `/admin` (articles, projects, designs, services, shop, journey,
testimonials, client logos, roadmap, resume sections).

## 4. Things that are NOT in the config
- **Images:** replace `public/profile.png` (transparent PNG, ~806×1050) and anything in `public/`.
- **Page copy about the original owner:** `app/tech-stack/page.tsx`, the
  resume placeholders in `app/admin/resume/*`, and the legal wording in
  `app/privacy/page.tsx` — read and rewrite these.
- **Payments:** choose which payment methods to offer, as described in `PAYMENTS.md`.

## 5. Check you found everything

    node scripts/check-personalization.mjs

Lists every file still containing the original owner's name, domain, social
handles, emails, phone, location or brand colour. Anything under "CODE"
should move into `site.config.ts`; "PAGE COPY" is writing to redo.
Add `--strict` to make it fail a build.

## 6. Before launch
1. `node scripts/setup.mjs` → no ✗, and `node scripts/verify-lockdown.mjs` → "Lockdown verified."
2. Sign in, open **/admin/security**: every Protection-status line green.
3. Verify your sending domain in Resend; send yourself a test order and contact message.
4. View a blog post's link preview — it shows the post's own title.

Selling this to a customer? Use **SELLING.md** — a full checklist from collecting their details to handover.
