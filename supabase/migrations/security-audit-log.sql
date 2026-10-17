-- Tamper-resistant record of security-relevant events: every login
-- attempt (success/failure/blocked/bad 2FA code), every admin write, every
-- upload permission issued, and blocked/unauthorized admin API calls.
-- Written ONLY by your server (service-role key). RLS is on with no
-- policies and all public privileges revoked, so the public key can
-- neither read nor write it.
create table if not exists security_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  ip text,
  user_agent text,
  detail jsonb
);
create index if not exists security_audit_log_created_at_idx on security_audit_log (created_at desc);

alter table security_audit_log enable row level security;
revoke all on security_audit_log from anon, authenticated;

-- OPTIONAL: keep the table from growing forever (Supabase has pg_cron under
-- Database -> Extensions). Deletes events older than 180 days nightly:
-- select cron.schedule('prune-audit-log', '0 3 * * *',
--   $$ delete from security_audit_log where created_at < now() - interval '180 days' $$);
