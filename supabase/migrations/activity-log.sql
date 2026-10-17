-- A simple append-only log of admin actions, so you're never wondering
-- "wait, when did that change?" Nothing reads from this except the
-- /admin dashboard's recent-activity feed.
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,        -- e.g. "published", "unpublished", "deleted", "featured", "order_paid"
  entity_type text not null,   -- e.g. "article", "project", "design", "order"
  entity_label text,           -- a human-readable label (title, order number) — may be null if deleted
  count int not null default 1 -- >1 for bulk actions, e.g. "published 5 articles"
);

create index if not exists activity_log_created_at_idx on activity_log (created_at desc);
