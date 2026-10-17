# Which SQL file do I run?

| File | When | Safe to re-run? |
|---|---|---|
| **`setup.sql`** | **A brand-new site.** Builds everything, then locks it down. Run once. | Yes |
| `schema.sql` | An **existing** site that is missing something (the check tells you). Only adds — never changes or deletes data. Does *not* secure anything. | Yes |
| `security-lockdown.sql` | Only the security half (already inside `setup.sql`). | Yes |
| `security-rollback.sql` | **Emergency only.** Re-opens the database. Insecure — anyone with your public key can read and write everything. | — |
| `demo-data.sql` | Optional sample content for a new site. | Yes |
| `demo-data-remove.sql` | Removes exactly the samples above, nothing else. | Yes |
| `migrations/` | History of how the original site's database grew. **Superseded by `schema.sql`** — you don't need these. | — |

`setup.sql` is generated: edit `schema.sql` / `security-lockdown.sql`, then run `node scripts/setup.mjs build-sql`.
`node scripts/setup.mjs` warns if `setup.sql` is stale.
