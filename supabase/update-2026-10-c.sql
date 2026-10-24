-- ============================================================================
-- Site update C, October 2026: product bundles.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted (Supabase runs only highlighted text), then click Run.
-- Safe to run more than once. Runs as one transaction: it all applies or nothing changes.
-- (Run update-2026-10-v2.sql and update-2026-10-b.sql first if you haven't.)
-- ============================================================================
begin;

-- A product of type 'bundle' sells several digital products together; buyers get every file.
alter table products add column if not exists bundle_items uuid[];  -- product ids, in display order

-- Visitors may see which products a bundle contains (never the paid file links).
grant select (bundle_items) on products to anon, authenticated;

commit;

-- Refresh Supabase's column cache so the site sees the new column straight away.
notify pgrst, 'reload schema';
