# Setting up a site from zero

About 30–40 minutes the first time. You need: Node 18+, a free [Supabase](https://supabase.com) account,
and (to go live) a [Vercel](https://vercel.com) account.

## 1. Get the code running locally
```
npm install
```

## 2. Create the database
1. Supabase → **New project** (any name; pick a region near your visitors; save the database password).
2. Project Settings → **API**. You'll need three values: the **Project URL**, the **anon / public** key, and the **service_role / secret** key.

## 3. Fill in your settings
Copy `.env.example` to **`.env.local`** and fill it in. The comments explain each line. In short:

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the **anon / public** key — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | the **service_role / secret** key — **never** share or commit it |
| `NEXTAUTH_SECRET` | any long random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` for now |
| `ADMIN_PASSWORD_HASH` | create with `node scripts/admin-setup.mjs hash` |
| `RESEND_API_KEY`, `NOTIFY_TO_EMAIL` | optional now; needed for order / contact emails |

> The two Supabase keys look alike. If you swap them, **the secret key ends up in every visitor's browser.**
> The check in step 5 catches this.

## 4. Build the database (one paste)
Supabase → **SQL Editor** → New query → paste the whole of **`supabase/setup.sql`** → Run.
This creates every table, the two image-storage buckets, and locks the database down so the public key
can only read what the public site shows. Safe to run again.

Want the site to look alive while you work? Also run **`supabase/demo-data.sql`** (sample posts, projects,
services, shop items…). Remove it any time with `supabase/demo-data-remove.sql` — that deletes **only** the
samples, never anything you added.

## 5. Check it
```
node scripts/setup.mjs
```
It checks your settings, connects to your database, confirms every table and column the site needs exists, and
attacks your database the way an outsider would to confirm it's locked down. **Fix every ✗**; review the `!`s.
Run it again after any change.

## 6. Start the site
```
npm run dev
```
Open http://localhost:3000, then **/admin** and sign in (username `qasim` unless you set `ADMIN_USERNAME`).

## 7. Make it yours
See **PERSONALIZE.md**: edit `site.config.ts` (name, links, hero text, payment methods), replace the images in
`public/`, change the accent colour, then run `node scripts/check-personalization.mjs`.

## 8. Go live
1. Push the code to GitHub and import it in Vercel.
2. Add **every** variable from `.env.local` under Vercel → Settings → Environment Variables. Set `NEXTAUTH_URL`
   to your real address (`https://yourdomain.com`).
3. Add your domain in Vercel and point DNS at it.
4. For emails: in Resend, add and verify your domain, then use an address on it in `site.config.ts` → `mail`.
5. Re-run the check against production by saving the production values in a temporary file:
   `node scripts/setup.mjs --env path/to/production.env` (delete the file afterwards — it holds secrets).
6. Turn on two-factor login: `node scripts/admin-setup.mjs totp`.

## I already have a site (like the original)
You don't need `setup.sql`. Run `node scripts/setup.mjs`. If it reports a missing table or column, run
**`supabase/schema.sql`** in the SQL editor: it only *adds* what's missing and never changes or deletes data.

## Which SQL file when?  → see `supabase/README.md`

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| Admin saves fail / "permission denied" | `SUPABASE_SERVICE_ROLE_KEY` is missing, wrong, or from another project |
| Check says "table missing" | `setup.sql` wasn't run on *this* project |
| Images won't upload | Storage buckets missing — run `schema.sql` (creates them) |
| Can't sign in | `ADMIN_PASSWORD_HASH` malformed, or too many failed tries (wait 15 min) |
| Orders save but no emails | `RESEND_API_KEY` / `NOTIFY_TO_EMAIL` missing or the sending domain isn't verified |
| Homepage blank section | Nothing added yet — empty sections hide themselves |
