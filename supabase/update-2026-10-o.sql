-- ============================================================================
-- Site update O, October 2026: recruiter packs, payment screenshots, link taps, error reports.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once. (Run B to N first.)
-- ============================================================================
begin;

-- ---- Recruiter packs, payment screenshots, link clicks, error reports (Oct 2026) -----
-- A private page per company you apply to; views and clicks are recorded (server-only).
create table if not exists recruiter_packs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role_applied text,
  contact_name text,
  note text,                                        -- your personal message at the top
  project_ids uuid[] not null default '{}',         -- up to 3 projects
  include_cv boolean not null default true,
  public_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  views integer not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists recruiter_events (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references recruiter_packs(id) on delete cascade,
  event text not null,                              -- view, cv, project, contact
  detail text,
  created_at timestamptz not null default now()
);
-- A buyer's payment screenshot (resized JPEG), kept with the order for checking.
alter table orders add column if not exists payment_proof text;
-- Taps on the Links page, counted per day (no personal data).
create table if not exists link_clicks (
  label text not null,
  day date not null default current_date,
  clicks integer not null default 0,
  primary key (label, day)
);
create or replace function log_link_click(p_label text)
returns void language sql security definer set search_path = public as $$
  insert into link_clicks (label, day, clicks) values (left(trim(p_label), 80), current_date, 1)
  on conflict (label, day) do update set clicks = link_clicks.clicks + 1;
$$;
revoke all on function log_link_click(text) from public, anon, authenticated;
grant execute on function log_link_click(text) to service_role;
-- Errors visitors hit (browser and server), grouped by message; you're emailed once per hour per error.
create table if not exists error_reports (
  id uuid primary key default gen_random_uuid(),
  hash text not null unique,
  message text not null,
  source text not null,                             -- browser or server
  url text,
  detail text,
  count integer not null default 1,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  notified_at timestamptz
);

-- Server-only tables.
alter table recruiter_packs enable row level security;
alter table recruiter_events enable row level security;
alter table link_clicks enable row level security;
alter table error_reports enable row level security;
revoke all on recruiter_packs, recruiter_events, link_clicks, error_reports from anon, authenticated;
grant all on recruiter_packs, recruiter_events, link_clicks, error_reports to service_role;
-- Payment screenshots stay private like the rest of the order (orders are already server-only).

commit;

notify pgrst, 'reload schema';
