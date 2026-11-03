-- ============================================================================
-- Site update L, October 2026: newsletter sending history.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once. (Run B to K first.)
-- ============================================================================
begin;

-- ---- Newsletter campaigns (Oct 2026) -----------------------------------------------
-- A record of newsletters sent from Admin -> Newsletter -> Write a newsletter (server-only).
create table if not exists newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipients integer not null default 0,
  failed integer not null default 0,
  sent_at timestamptz not null default now()
);

alter table newsletter_campaigns enable row level security;
revoke all on newsletter_campaigns from anon, authenticated;
grant all on newsletter_campaigns to service_role;

commit;

notify pgrst, 'reload schema';
