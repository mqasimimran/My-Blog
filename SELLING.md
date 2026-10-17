# Handing a site to a customer — checklist

Work through it top to bottom. Tick things off as you go.

## A. Before you start — collect from the customer
- [ ] Their **name** (or business name), **job title / tagline**, **city & country**
- [ ] Their **domain** (or help them buy one). Who owns the registrar account?
- [ ] A **public email** and, if wanted, a **WhatsApp number**
- [ ] **Social links** (LinkedIn, GitHub, YouTube, Instagram…)
- [ ] A **profile photo** (transparent PNG works best) and a **logo**, plus a brand **colour**
- [ ] Their **bio / about text**, a few **projects**, **services** and prices, **testimonials**
- [ ] How they want to be **paid** and the account details for each method
- [ ] Do they want a **shop**, a **blog**, a **newsletter**? (Unused sections can simply stay empty — they hide.)

## B. Accounts — create them in the CUSTOMER'S name
They should own these so you are never the single point of failure, and so they can leave you.
- [ ] **Supabase** project (the database) — free tier is fine to start
- [ ] **Vercel** (hosting)
- [ ] **Resend** (email) with their domain verified
- [ ] A **private GitHub copy** of this template for them
> Keep the `service_role` key out of chats and email. Share it only through a password manager.

## C. Build
1. [ ] Copy the template into the customer's repo; `npm install`
2. [ ] Edit **`site.config.ts`**: name, titles, contact, socials, hero text, payment methods, admin defaults
3. [ ] Set the colour in **both** `site.config.ts → brand.accent` and `app/globals.css`
4. [ ] Replace the images in `public/`; rewrite the pages listed by `node scripts/check-personalization.mjs`
       (about, tech-stack, resume placeholders, privacy wording)
5. [ ] Create the database: run **`supabase/setup.sql`**; optionally load `demo-data.sql` while you work
6. [ ] Fill **`.env.local`**; create admin credentials: `node scripts/admin-setup.mjs hash` and `… totp`
7. [ ] **`node scripts/setup.mjs`** → no ✗
8. [ ] Enter the real content in `/admin`; enter payment details in **Admin → Site Settings**
9. [ ] Remove the demo content: `supabase/demo-data-remove.sql`
10. [ ] Deploy to Vercel; add all env vars; set `NEXTAUTH_URL`; connect the domain
11. [ ] `node scripts/setup.mjs --env <production values>` → no ✗ (delete that file afterwards)

## D. Quality check — do all of it, on a phone as well
- [ ] Every page loads; nothing says Qasim / the original owner (`node scripts/check-personalization.mjs --strict`)
- [ ] Light **and** dark mode look right; the menu works on mobile
- [ ] **Contact form** → you receive the email; message appears in Admin → Messages
- [ ] **Newsletter signup** → subscriber appears in Admin → Newsletter
- [ ] **Place a test order** with each payment method → email arrives → click **Verify** once → download works → then delete the test order
- [ ] Click **Verify** twice on a test order: nothing is sent or deducted the second time
- [ ] Share a blog link in WhatsApp/LinkedIn: the preview shows the post's title and image
- [ ] `/sitemap.xml`, `/robots.txt`, `/feed.xml` load and show the **customer's** domain
- [ ] `node scripts/verify-lockdown.mjs` → "Lockdown verified."
- [ ] Sign in; open **/admin/security**: every line in *Protection status* is green
- [ ] Two-factor login works; the 2FA setup key is saved in their password manager

## E. Handover
- [ ] Give them: site URL, admin URL, how to sign in, the 2FA key (via password manager), and a short "how to add a post / project / product" walkthrough (a 5-minute screen recording is enough)
- [ ] Transfer or confirm ownership of Supabase, Vercel, Resend, the domain and the GitHub repo
- [ ] Explain the ongoing costs they'll pay (domain yearly; Supabase / Vercel / Resend are free until the site grows)
- [ ] Agree what's included afterwards: bug fixes, updates, new features, who to contact

## F. Things only YOU can decide
- **Price and licence.** What you're selling (a one-off site? the template itself? hosting and support?) and what the customer may do with the code. Write it down; get a lawyer to look at it if real money is involved.
- **Legal pages.** The privacy page is a starting point, not legal advice — the customer is responsible for it being right for their country.
- **Payments and tax.** This template supports manual transfers only (JazzCash, EasyPaisa, bank, Payoneer). It does **not** calculate or collect sales tax / VAT, and has no card checkout.
- **Backups.** Supabase's free plan has no point-in-time recovery. For a business site, tell them about paid backups, or export their data regularly.

## G. Keeping many sites healthy
Every site is its own copy, so a fix has to be applied to each. Keep a list of the sites, and after updating the
template run `node scripts/setup.mjs` against each one — it will tell you if a database needs `schema.sql` for a new column.
