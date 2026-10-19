-- ============================================================================
-- Site update B, October 2026: discount codes.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted (Supabase runs only highlighted text), then click Run.
-- Safe to run more than once. Runs as one transaction: it all applies or nothing changes.
-- (Run update-2026-10-v2.sql first if you haven't yet.)
-- ============================================================================
begin;

-- ---- Discount codes (Oct 2026) ------------------------------------------------
create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                     -- stored in capitals, e.g. WELCOME10
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  value numeric not null check (value > 0),      -- 10 = 10% off, or $10 off
  active boolean not null default true,
  expires_at timestamptz,                        -- null = never expires
  max_uses integer,                              -- null = unlimited
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint discount_percent_max check (kind <> 'percent' or value <= 100)
);
alter table orders add column if not exists discount_code text;
alter table orders add column if not exists discount_amount numeric not null default 0;

-- Uses up one redemption of a code, atomically: the check and the count happen in a single statement,
-- so two buyers can never both take the last use. Returns nothing if the code can't be used.
create or replace function redeem_discount(p_code text)
returns table (kind text, value numeric)
language sql security definer set search_path = public as $$
  update discount_codes d set used_count = d.used_count + 1
  where d.code = upper(p_code) and d.active
    and (d.expires_at is null or d.expires_at > now())
    and (d.max_uses is null or d.used_count < d.max_uses)
  returning d.kind, d.value;
$$;
revoke all on function redeem_discount(text) from public, anon, authenticated;
grant execute on function redeem_discount(text) to service_role;

-- Only the server may read or change discount codes (buyers can't list them).
alter table discount_codes enable row level security;
revoke all on discount_codes from anon, authenticated;
grant all on discount_codes to service_role;

commit;

-- Refresh Supabase's column cache so the site sees the new table straight away.
notify pgrst, 'reload schema';
