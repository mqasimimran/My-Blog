# Which SQL file do I run?

| File | When | Safe to re-run? |
|---|---|---|
| **`setup.sql`** | **A brand-new site.** Builds everything, then locks it down. Run once. | Yes |
| `schema.sql` | An **existing** site that is missing something (the check tells you). Only adds — never changes or deletes data. Does *not* secure anything. | Yes |
| `security-lockdown.sql` | Only the security half (already inside `setup.sql`). | Yes |
| `security-rollback.sql` | **Emergency only.** Re-opens the database. Insecure — anyone with your public key can read and write everything. | — |
| `demo-data.sql` | Optional sample content for a new site. | Yes |
| `demo-data-remove.sql` | Removes exactly the samples above, nothing else. | Yes |
| `migrations/2026-11-audit-fixes.sql` | **Existing site.** Run this in the Supabase SQL Editor when deploying the admin, checkout and billing fixes. The first run rotates all draft preview links. Copy fresh links from the admin when sharing drafts again. | Yes |
| `migrations/2026-11-testimonial-work.sql` | **Existing site.** Run before deploying work-linked review invites. Adds the UMT Business Fest 2026 case study to the UES client; no artwork is inserted. | Yes |
| `migrations/2026-11-design-campaigns.sql` | **Existing site.** Run after the testimonial migration. Adds campaigns, design purpose tags, share-image fields and a draft UMT Business Fest 2026 campaign. | Yes |
| `migrations/2026-11-case-study-testimonials.sql` | Run after the campaigns migration. Adds campaign reviews and expands the earlier UES case-study copy. Each review still requires approval. | Yes |

`setup.sql` includes the schema, security policies and feature migrations. After editing any of these, run `node scripts/setup.mjs build-sql`.
`node scripts/setup.mjs` warns if `setup.sql` is stale.
