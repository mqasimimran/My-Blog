# Security upgrade — deployment guide

---------------------------------------------------------------------

## UPDATE — 2FA replay fix (do this first)

**What was wrong:** the check that stops a 2FA code being used twice relied
on a shared table, and if that table refused the write, the check failed
**silently and open** — the same code then logged in again and again. I
reproduced it exactly. The replay protection now:
- uses its own dedicated table where a code can only be claimed **once**
  (the database itself enforces it, even for two simultaneous logins);
- **fails closed** — if that table can't be written, the login is refused
  and the real reason is logged, instead of quietly letting it through;
- is checked live by a new **Protection status** panel on /admin/security.

**Steps (in order):**
1. **Run `supabase/migrations/admin-totp-used.sql`** in the Supabase SQL
   editor. Do this BEFORE using the new code — until the table exists,
   logins that need a 2FA code are refused (by design).
2. Copy this patch over your project. Locally, **restart `npm run dev`**
   (environment variables and new files are only picked up on restart).
3. Open **/admin/security**. The "Protection status" panel should be all
   green ticks. Any red line shows the database's actual error message —
   send me that.
   - "Two-factor login is OFF" means `ADMIN_TOTP_SECRET` isn't being
     loaded (wrong name, or the server wasn't restarted / the site wasn't
     redeployed). With it off, any code — or none — logs in.
4. **Test replay:** log in with a code, sign out, log in again with the
   same code. The second must be refused, and the Security Log shows
   "two factor replay". A new code (wait for the next 30-second change)
   must work.
5. Re-run `node scripts/verify-lockdown.mjs` — it now also checks the new
   table is unreachable from outside.

**If a 2FA login is refused with "two factor store error":** the new table
is missing or can't be written. Run step 1, or temporarily delete
`ADMIN_TOTP_SECRET` to turn 2FA off.

---------------------------------------------------------------------

Two rounds of work are described here. **Round 1** (database lockdown) you
have already done. **Round 2** (below, "Round 2 — hardening") is new.

---------------------------------------------------------------------

## Round 1 — recap (already done)

Browsers no longer write to your database with the public key. Every admin
write goes through an API route that checks your login and uses the
server-only `SUPABASE_SERVICE_ROLE_KEY`; the database was then locked so
the public key can only read what the public site shows.

---------------------------------------------------------------------

## Round 2 — hardening

### What this adds
| Area | Change |
|---|---|
| **Article editor images** | **Bug fix:** the rich-text editor lives in a root `components/` folder that Round 1 missed. After the lockdown, inserting an image inside the editor fails. This package fixes it. |
| Admin login | Password can be stored as a **scrypt hash** (never the real password). Username configurable. Optional **2FA** (authenticator-app code). Same-code replay blocked. |
| Admin API | Cross-site requests refused (CSRF wall), strict parameter validation, 4 MB body cap, bulk-size cap, table allowlist kept. |
| Audit log | New private `security_audit_log` table + **/admin/security** page: every login attempt, admin change, upload and blocked request, recorded by the server. |
| Emails | Visitor-supplied text is HTML-escaped in the emails you and customers receive (prevents fake "verify payment" links being injected). Contact + order forms now validate type/length/format. |
| Content | Article and project HTML is **sanitized when saved** (no scripts, event handlers, `javascript:` links; iframes only from YouTube/Vimeo). JSON-LD blocks can't break out of their `<script>` tag. |
| Headers | HSTS, a safe CSP subset (no plugins, no `<base>` hijack, no cross-site form posts, no framing), `no-store` on admin pages/APIs. |
| Verify script | Now **Node** (works on Windows). The old `.sh` version had a flaw that could show a false PASS and was removed. |

### Step by step (in this order)

**1. Add the new table** — Supabase SQL editor: run
`supabase/migrations/security-audit-log.sql`.
(Re-running `supabase/security-lockdown.sql` afterwards is optional but
harmless; it now lists the new table too.)

**2. Replace your project files with this package** and run:
```
npm install
```
(this adds `sanitize-html`). **Make sure the new root `components/` folder
and `next.config.ts` come across** — they weren't in the previous package.
Commit, push, let Vercel deploy.

**3. Test while logged in:**
- Open a new/edit article → click **🖼️ Image** in the editor → the image
  should upload and appear. (This is the thing the lockdown broke.)
- Add/edit/delete something in two or three admin sections.
- Visit **/admin/security** — you should see your own login and changes.
- Send yourself a test message through the contact form.

**4. Prove the database is closed** — from your project folder.

Windows PowerShell:
```
$env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_ANON_KEY="YOUR-ANON-KEY"
node scripts/verify-lockdown.mjs
```
macOS / Linux:
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co SUPABASE_ANON_KEY=YOUR-ANON-KEY node scripts/verify-lockdown.mjs
```
(URL and anon key: Supabase → Project Settings → API. The anon key is the
*public* one — it is safe to paste here, it's already in your website's
JavaScript.) Every line should say PASS and it ends with
"Lockdown verified." Any FAIL means something is still open — send me the
output.

**5. Stop storing your real password (recommended)**
```
node scripts/admin-setup.mjs hash
```
Type a long passphrase (12+ characters) twice; it prints one line,
`ADMIN_PASSWORD_HASH=scrypt:...`. In Vercel → Settings → Environment
Variables: add that variable, then **delete `ADMIN_PASSWORD`**, redeploy,
and log in to confirm. Keep another admin tab open while you do this — an
existing session stays valid, so a typo can't lock you out.

**6. Turn on 2FA (recommended)**
```
node scripts/admin-setup.mjs totp
```
It prints `ADMIN_TOTP_SECRET=...` and a setup key. Add the variable in
Vercel, and in your authenticator app (Google Authenticator, Authy,
1Password…) choose **"Enter a setup key"** and type the key (time-based,
6 digits). Redeploy. From then on login needs the 6-digit code in the new
"Authentication Code" box. **Save the setup key in your password
manager.** If you ever lose your phone: delete `ADMIN_TOTP_SECRET` in
Vercel and redeploy — 2FA turns off.

### Rollback
- Login problem: remove `ADMIN_TOTP_SECRET` (and/or put `ADMIN_PASSWORD`
  back) in Vercel and redeploy.
- Database problem: `supabase/security-rollback.sql` (reopens the
  database — insecure but working — then tell me what failed).

### Behavior changes you'll notice
- Contact/order forms reject over-long or malformed input (name 100,
  email 254, message 5,000, transaction ID 100 characters).
- Saving an article/project strips anything unsafe from its HTML. Existing
  content is only cleaned the next time you save it.
- Failed logins: still 5 attempts per 15 minutes per address; the error
  message no longer says which part was wrong.

### Known limits (not fixed)
- **Replay protection and the login lockout depend on the live database.**
  I tested the login logic (hash, 2FA, username, legacy fallback) end to
  end, but the replay check and lockout counter need real Supabase, which my
  test environment doesn't have — try logging in twice with the same code
  within a minute and confirm the second is refused, and check that
  **/admin/security** records the attempts.
- No CAPTCHA on the public forms (rate limiting + validation only).
- Full CSP `script-src` is not enforced: AdSense and Next.js's own inline
  scripts would force `'unsafe-inline'`, which defeats the purpose.
- Sanitizing isn't retroactive for old posts until re-saved.
- Single admin account.
- 5 npm advisories remain, all inside dev-only linting tooling.
