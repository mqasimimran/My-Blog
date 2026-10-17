create table if not exists client_logos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  image_url text not null,
  dark_image_url text,   -- optional: a light-colored variant for dark mode, same idea as the original TEDxUMT/UMT Entrepreneurial Society pair. Leave null to just reuse image_url in both modes.
  link_url text,         -- optional: the organization's site, opens the logo as a link
  order_index int not null default 0
);
