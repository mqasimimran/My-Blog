-- ============================================================================
-- Site update P, October 2026: content calendar and product reviews.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once. (Run B to O first.)
-- ============================================================================
begin;

-- ---- Content calendar + product reviews (Oct 2026) ----------------------------------
create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'post',            -- post, reel, video, newsletter, other
  status text not null default 'idea' check (status in ('idea', 'drafting', 'scheduled', 'published')),
  planned_for date,                             -- empty = an idea without a date yet
  notes text,
  link text,
  created_at timestamptz not null default now()
);
-- Reviews from verified buyers only (one per paid order), shown after you approve them.
create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid not null unique references orders(id) on delete cascade,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

-- Server-only: reviews are shown through the site's own API (only approved ones).
alter table content_items enable row level security;
alter table product_reviews enable row level security;
revoke all on content_items, product_reviews from anon, authenticated;
grant all on content_items, product_reviews to service_role;

commit;

notify pgrst, 'reload schema';
