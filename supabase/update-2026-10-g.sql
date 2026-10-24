-- ============================================================================
-- Site update G, October 2026: site search terms (Admin -> Site Searches).
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once.
-- (Run updates v2 and B to F first.)
-- ============================================================================
begin;

-- ---- Site search terms (Oct 2026) --------------------------------------------------
-- What visitors type into the site's search, counted per day. No personal data is stored.
create table if not exists site_searches (
  term text not null,
  day date not null default current_date,
  searches integer not null default 0,
  no_results integer not null default 0,
  primary key (term, day)
);
create or replace function log_search(p_term text, p_found boolean)
returns void language sql security definer set search_path = public as $$
  insert into site_searches (term, day, searches, no_results)
  values (lower(left(trim(p_term), 60)), current_date, 1, case when p_found then 0 else 1 end)
  on conflict (term, day) do update set searches = site_searches.searches + 1,
    no_results = site_searches.no_results + case when p_found then 0 else 1 end;
$$;
revoke all on function log_search(text, boolean) from public, anon, authenticated;
grant execute on function log_search(text, boolean) to service_role;

alter table site_searches enable row level security;
revoke all on site_searches from anon, authenticated;
grant all on site_searches to service_role;

commit;

notify pgrst, 'reload schema';
