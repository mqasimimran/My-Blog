-- ============================================================================
-- Site update D, October 2026: Urdu versions of blog posts, and invoices.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted (Supabase runs only highlighted text), then click Run.
-- Safe to run more than once. Runs as one transaction: it all applies or nothing changes.
-- (Run updates v2, B and C first if you haven't.)
-- ============================================================================
begin;

-- ---- Urdu versions of blog posts (Oct 2026) -----------------------------------------
-- Optional. Urdu visitors see these when present; otherwise the English post.
alter table articles add column if not exists title_ur text;
alter table articles add column if not exists excerpt_ur text;
alter table articles add column if not exists content_ur text;

-- ---- Invoices (Oct 2026) ----------------------------------------------------------
-- Created in Admin -> Invoices. Server-only (no public policies); clients view theirs by a private link.
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,                   -- e.g. INV-2026-001
  client_name text not null,
  client_email text,
  client_address text,
  currency text not null default 'USD' check (currency in ('USD', 'PKR')),
  items jsonb not null default '[]'::jsonb,      -- [{ "description": "...", "quantity": 1, "unit_price": 100 }]
  discount numeric not null default 0,           -- an amount, in the invoice's currency
  tax_percent numeric not null default 0,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  public_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Only the server may read or change invoices; clients see theirs through their private link.
alter table invoices enable row level security;
revoke all on invoices from anon, authenticated;
grant all on invoices to service_role;

commit;

-- Refresh Supabase's column cache so the site sees the changes straight away.
notify pgrst, 'reload schema';
