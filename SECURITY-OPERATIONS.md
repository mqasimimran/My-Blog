# Security rollout and recovery

## Release order

1. Run `supabase/migrations/2026-11-rate-limit.sql` with the Supabase SQL editor in the site's project. The new API uses the service-role-only `consume_rate_limit` function. A missing function or database failure blocks requests, including sign-in. Repeat the migration safely if necessary.
2. In Vercel's environment settings confirm that the active `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET` and `NEXTAUTH_SECRET` are present in the intended environment. Generate a hash with `node scripts/admin-setup.mjs hash` only when changing the password. Remove the obsolete `ADMIN_PASSWORD` after checking the hash. Redeploy the updated code and sign in with a fresh browser session. Visit **Admin → Security** to exercise the database-backed limiter.
3. The Vercel deployment uses the platform-supplied IP headers. For another host, set `TRUST_PROXY=1` only behind a reverse proxy that overwrites the forwarded IP header and prevents direct access to the origin. Otherwise requests share an anonymous budget. Review the hosting dashboard's firewall settings and events for traffic spikes. Application quotas protect individual actions. Volumetric attack protection and traffic alerts are hosting settings.
4. Push the availability workflow to the default branch, enable Actions, and run **Website availability** manually. It checks the homepage, the database health endpoint and the signed-out admin redirect. It then runs four times an hour. Set the repository variable `PORTFOLIO_SITE_URL` if using a different domain. Enable GitHub notifications for failed workflow runs and verify receipt with a controlled failed run on a test branch. GitHub may delay scheduled jobs.
5. Configure encrypted backups before relying on the weekly schedule. The existing admin JSON export and weekly email are selected business data. They do not contain the uploaded files.

## Encrypted backup

The **Encrypted recovery backup** workflow runs weekly on the default branch and supports manual runs. Set these GitHub Actions secrets on the repository:

| Secret | Value |
|---|---|
| `RECOVERY_DATABASE_URL` | PostgreSQL connection URI for the same Supabase project, using a direct connection or session pooler, with permission to dump the application's public schema, data, grants, functions, and policies. |
| `RECOVERY_SUPABASE_URL` | Project API URL. |
| `RECOVERY_SERVICE_ROLE_KEY` | Server-side key for listing and downloading the project's Storage objects. |
| `BACKUP_AGE_RECIPIENT` | Public age encryption recipient. Generate the identity with `age-keygen` and keep the private identity separately, for example in an offline password vault. |

Run the workflow once and verify that its encrypted artifact downloads and decrypts. Retention is 30 days or the repository's shorter maximum. Keep an independent copy for longer retention. A local backup uses PostgreSQL client utilities compatible with the source server, Node.js and the three recovery connection variables:

```sh
node scripts/recovery.mjs create /path/to/new-backup-directory
```

The bundle contains the public-schema SQL dump, Storage policies for objects and buckets, and current Storage files with their digests and bucket settings. It completes only after the files are copied and their inventory is checked again. Pause uploads, deletions and asset relinking during capture when an exact database-to-file snapshot is required. The bundle contains private records and must be kept in a private location. Supabase Auth accounts, provider settings, Storage version history, environment variables, and DNS are outside this application archive.

## Restore drill

1. Decrypt the archived artifact with your age private identity and extract it into a private directory. Use a fresh, isolated Supabase project with an empty public schema and no Storage buckets or existing Storage policies. Set all three recovery connection variables to **that destination**. Verify that the database URI and Storage credentials belong to the same destination.
2. Run `node scripts/recovery.mjs restore /path/to/recovery`. The command checks the SQL and file digests, uploads the files, verifies each stored copy, and restores database objects and policies in a transaction. It updates absolute Storage URLs in the restored public records to point to the destination. If the process is interrupted, retry using a fresh destination.
3. Point a preview deployment at the restored project, using its own server credentials. Open an uploaded design and a published lesson, confirm a draft stays hidden, test admin sign-in, and compare representative record counts and file digests with the source. Reconfigure hosting secrets separately. Keep the source project available until these checks succeed.
4. For a bad application release, roll back through Vercel deployments. For data loss, restore into a new project, validate it, and switch the deployment's connection settings after verification.
