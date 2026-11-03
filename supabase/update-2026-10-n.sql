-- ============================================================================
-- Site update N, October 2026: recurring (retainer) invoices.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once. (Run B to M first.)
-- ============================================================================
begin;

-- ---- Recurring invoices (retainers) (Oct 2026) --------------------------------------
-- An invoice marked "repeat monthly" is copied and emailed to the client each month (daily job).
alter table invoices add column if not exists repeat_monthly boolean not null default false;
alter table invoices add column if not exists repeat_next date;            -- when the next copy goes out
alter table invoices add column if not exists repeated_from uuid;          -- copies point at their original

commit;

notify pgrst, 'reload schema';
