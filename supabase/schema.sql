-- =====================================================================
-- DATABASE SCHEMA — every table this site uses.
--
-- * On a NEW Supabase project this builds everything from scratch.
-- * On an EXISTING database it only ADDS what's missing (tables, columns,
--   indexes). It never changes or deletes anything, so it is safe to re-run
--   and doubles as a "bring my database up to date" script.
--
-- It does NOT set up security. For a new site run supabase/setup.sql, which is
-- this file followed by security-lockdown.sql. (A database with these tables
-- but no lockdown lets anyone with your public key read and write everything.)
-- =====================================================================

-- ---- articles: Blog posts.
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,  -- the URL: /blog/<slug>
  category text,
  excerpt text,  -- short summary shown on cards and in search results
  content text,  -- the post body, as HTML (cleaned when saved)
  feature_image text,  -- cover image URL
  read_time text,  -- free text, e.g. '5 min read'
  published boolean not null default false,  -- false = draft, only visible through its preview link
  featured boolean not null default false,  -- shown on the homepage
  reaction_count integer not null default 0,  -- the 'loved this' counter
  series_name text,  -- groups posts into a series
  series_order integer,
  preview_token text not null default gen_random_uuid()::text,  -- secret for the draft-preview link
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table articles add column if not exists title text;
alter table articles add column if not exists slug text;
alter table articles add column if not exists category text;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists content text;
alter table articles add column if not exists feature_image text;
alter table articles add column if not exists read_time text;
alter table articles add column if not exists published boolean not null default false;
alter table articles add column if not exists featured boolean not null default false;
alter table articles add column if not exists reaction_count integer not null default 0;
alter table articles add column if not exists series_name text;
alter table articles add column if not exists series_order integer;
alter table articles add column if not exists preview_token text not null default gen_random_uuid()::text;
alter table articles add column if not exists created_at timestamptz not null default now();
create unique index if not exists articles_slug_key on articles (slug);

-- ---- projects: Portfolio projects / case studies.
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,  -- the URL: /projects/<slug>
  category text,
  description text,  -- short summary
  content text,  -- long write-up, as HTML (cleaned when saved)
  feature_image text,
  tech_stack text,  -- comma-separated, e.g. 'Next.js, Supabase'
  status text,  -- free text, e.g. 'IN DEVELOPMENT'
  live_url text,
  github_url text,
  problem text,  -- case-study section
  approach text,  -- case-study section
  outcome text,  -- case-study section
  stats text,  -- one 'value | label' per line
  screenshots text[],  -- gallery image URLs
  preview_video_url text,
  featured boolean not null default false,
  published boolean not null default true,  -- false = draft
  preview_token text not null default gen_random_uuid()::text,  -- secret for the draft-preview link
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table projects add column if not exists title text;
alter table projects add column if not exists slug text;
alter table projects add column if not exists category text;
alter table projects add column if not exists description text;
alter table projects add column if not exists content text;
alter table projects add column if not exists feature_image text;
alter table projects add column if not exists tech_stack text;
alter table projects add column if not exists status text;
alter table projects add column if not exists live_url text;
alter table projects add column if not exists github_url text;
alter table projects add column if not exists problem text;
alter table projects add column if not exists approach text;
alter table projects add column if not exists outcome text;
alter table projects add column if not exists stats text;
alter table projects add column if not exists screenshots text[];
alter table projects add column if not exists preview_video_url text;
alter table projects add column if not exists featured boolean not null default false;
alter table projects add column if not exists published boolean not null default true;
alter table projects add column if not exists preview_token text not null default gen_random_uuid()::text;
alter table projects add column if not exists created_at timestamptz not null default now();
create unique index if not exists projects_slug_key on projects (slug);

-- ---- designs: Design gallery items.
create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  images text[],  -- first image is the cover
  before_image text,  -- optional 'before' shot for the comparison slider
  featured boolean not null default false,
  published boolean not null default true,
  preview_token text not null default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table designs add column if not exists title text;
alter table designs add column if not exists category text;
alter table designs add column if not exists images text[];
alter table designs add column if not exists before_image text;
alter table designs add column if not exists featured boolean not null default false;
alter table designs add column if not exists published boolean not null default true;
alter table designs add column if not exists preview_token text not null default gen_random_uuid()::text;
alter table designs add column if not exists created_at timestamptz not null default now();

-- ---- messages: Contact-form submissions (private).
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table messages add column if not exists name text;
alter table messages add column if not exists email text;
alter table messages add column if not exists subject text;
alter table messages add column if not exists message text;
alter table messages add column if not exists is_read boolean not null default false;
alter table messages add column if not exists created_at timestamptz not null default now();

-- ---- experiences: Resume: work experience.
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  period text,  -- e.g. 'Aug 2026 - Present'
  role text,
  company text,
  description text,
  order_index integer not null default 0  -- 0 is first
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table experiences add column if not exists period text;
alter table experiences add column if not exists role text;
alter table experiences add column if not exists company text;
alter table experiences add column if not exists description text;
alter table experiences add column if not exists order_index integer not null default 0;

-- ---- education: Resume: education.
create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  degree text,
  institution text,
  period text,
  description text,
  order_index integer not null default 0
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table education add column if not exists degree text;
alter table education add column if not exists institution text;
alter table education add column if not exists period text;
alter table education add column if not exists description text;
alter table education add column if not exists order_index integer not null default 0;

-- ---- projects_resume: Resume: highlighted projects.
create table if not exists projects_resume (
  id uuid primary key default gen_random_uuid(),
  title text,
  tech text,  -- e.g. 'Node.js • React.js'
  description text,
  order_index integer not null default 0
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table projects_resume add column if not exists title text;
alter table projects_resume add column if not exists tech text;
alter table projects_resume add column if not exists description text;
alter table projects_resume add column if not exists order_index integer not null default 0;

-- ---- certifications: Resume: certifications wall.
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  date text,  -- free text, e.g. 'Dec 2025'
  image_url text,  -- certificate image
  verify_url text,  -- public verification link
  order_index integer not null default 0
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table certifications add column if not exists title text;
alter table certifications add column if not exists issuer text;
alter table certifications add column if not exists date text;
alter table certifications add column if not exists image_url text;
alter table certifications add column if not exists verify_url text;
alter table certifications add column if not exists order_index integer not null default 0;

-- ---- services: Services you sell.
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,  -- the URL: /services/<slug>
  tagline text,
  description text,
  includes text,  -- one bullet per line
  icon text,  -- optional emoji
  starting_price text,  -- free text, e.g. 'Starting at $300'
  cover_image text,
  order_index integer not null default 0,
  active boolean not null default true,  -- false hides it without deleting
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table services add column if not exists name text;
alter table services add column if not exists slug text;
alter table services add column if not exists tagline text;
alter table services add column if not exists description text;
alter table services add column if not exists includes text;
alter table services add column if not exists icon text;
alter table services add column if not exists starting_price text;
alter table services add column if not exists cover_image text;
alter table services add column if not exists order_index integer not null default 0;
alter table services add column if not exists active boolean not null default true;
alter table services add column if not exists created_at timestamptz not null default now();
create unique index if not exists services_slug_key on services (slug);

-- ---- service_packages: Pricing tiers for a service.
create table if not exists service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  tier text not null,  -- e.g. Basic / Standard / Premium
  price text not null,  -- text so 'Starting at $25' works
  delivery_days integer,
  revisions text,  -- e.g. '2 revisions' or 'Unlimited'
  features text,  -- one bullet per line
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table service_packages add column if not exists service_id uuid references services(id) on delete cascade;
alter table service_packages add column if not exists tier text;
alter table service_packages add column if not exists price text;
alter table service_packages add column if not exists delivery_days integer;
alter table service_packages add column if not exists revisions text;
alter table service_packages add column if not exists features text;
alter table service_packages add column if not exists order_index integer not null default 0;
alter table service_packages add column if not exists created_at timestamptz not null default now();

-- ---- journey_entries: 'My Journey' timeline.
create table if not exists journey_entries (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,  -- e.g. '2021 - 2023'
  title text not null,
  body text,  -- one paragraph per blank line
  image_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table journey_entries add column if not exists date_label text;
alter table journey_entries add column if not exists title text;
alter table journey_entries add column if not exists body text;
alter table journey_entries add column if not exists image_url text;
alter table journey_entries add column if not exists order_index integer not null default 0;
alter table journey_entries add column if not exists created_at timestamptz not null default now();

-- ---- roadmap_items: Public roadmap.
create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'planned',  -- planned | in_progress | shipped
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table roadmap_items add column if not exists title text;
alter table roadmap_items add column if not exists description text;
alter table roadmap_items add column if not exists status text not null default 'planned';
alter table roadmap_items add column if not exists order_index integer not null default 0;
alter table roadmap_items add column if not exists created_at timestamptz not null default now();

-- ---- testimonials: Testimonials.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,  -- e.g. 'Founder, Acme Inc.'
  quote text not null,
  avatar_url text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table testimonials add column if not exists name text;
alter table testimonials add column if not exists role text;
alter table testimonials add column if not exists quote text;
alter table testimonials add column if not exists avatar_url text;
alter table testimonials add column if not exists order_index integer not null default 0;
alter table testimonials add column if not exists active boolean not null default true;
alter table testimonials add column if not exists created_at timestamptz not null default now();

-- ---- newsletter_subscribers: Newsletter subscribers (private).
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  unsubscribe_token text not null default replace(gen_random_uuid()::text, '-', ''),  -- secret in each email's unsubscribe link
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table newsletter_subscribers add column if not exists email text;
alter table newsletter_subscribers add column if not exists unsubscribe_token text not null default replace(gen_random_uuid()::text, '-', '');
alter table newsletter_subscribers add column if not exists created_at timestamptz not null default now();

-- ---- site_settings: One-row site settings. Payment account details here are shown to buyers at checkout.
create table if not exists site_settings (
  id integer primary key default 1,
  available_for_work boolean not null default true,
  availability_message text not null default 'Available for new projects',
  now_text text,  -- the 'what I'm doing now' line
  jazzcash_number text,
  jazzcash_account_name text,
  easypaisa_number text,
  easypaisa_account_name text,
  bank_name text,
  bank_account_title text,
  bank_account_number text,
  bank_iban text,
  payoneer_email text
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table site_settings add column if not exists available_for_work boolean not null default true;
alter table site_settings add column if not exists availability_message text not null default 'Available for new projects';
alter table site_settings add column if not exists now_text text;
alter table site_settings add column if not exists jazzcash_number text;
alter table site_settings add column if not exists jazzcash_account_name text;
alter table site_settings add column if not exists easypaisa_number text;
alter table site_settings add column if not exists easypaisa_account_name text;
alter table site_settings add column if not exists bank_name text;
alter table site_settings add column if not exists bank_account_title text;
alter table site_settings add column if not exists bank_account_number text;
alter table site_settings add column if not exists bank_iban text;
alter table site_settings add column if not exists payoneer_email text;
alter table site_settings drop constraint if exists single_row;
alter table site_settings add constraint single_row check (id = 1);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---- products: Shop products.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'digital',  -- digital | physical
  category text,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),  -- optional 'was $X'
  images text[],  -- first = cover
  digital_file_url text,  -- the paid file; never exposed publicly
  stock_quantity integer,  -- physical only; null = unlimited
  weight_grams integer,
  active boolean not null default true,
  featured boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table products add column if not exists name text;
alter table products add column if not exists slug text;
alter table products add column if not exists type text not null default 'digital';
alter table products add column if not exists category text;
alter table products add column if not exists description text;
alter table products add column if not exists price numeric(10,2);
alter table products add column if not exists compare_at_price numeric(10,2);
alter table products add column if not exists images text[];
alter table products add column if not exists digital_file_url text;
alter table products add column if not exists stock_quantity integer;
alter table products add column if not exists weight_grams integer;
alter table products add column if not exists active boolean not null default true;
alter table products add column if not exists featured boolean not null default false;
alter table products add column if not exists order_index integer not null default 0;
alter table products add column if not exists created_at timestamptz not null default now();

-- ---- orders: Orders (private).
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_id uuid references products(id) on delete set null,  -- kept as a snapshot below, so orders survive deleting a product
  product_name text not null,
  product_price numeric(10,2) not null,
  amount_local numeric(10,2),  -- price in PKR for local methods
  currency_local text default 'USD',
  customer_name text not null,
  customer_email text not null,
  payment_method text not null,
  customer_transaction_id text not null,  -- the TID the buyer entered
  status text not null default 'pending_verification',  -- pending_verification | paid | rejected
  download_token text,  -- secret in the buyer's download link; set when paid
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table orders add column if not exists order_number text;
alter table orders add column if not exists product_id uuid references products(id) on delete set null;
alter table orders add column if not exists product_name text;
alter table orders add column if not exists product_price numeric(10,2);
alter table orders add column if not exists amount_local numeric(10,2);
alter table orders add column if not exists currency_local text default 'USD';
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists customer_transaction_id text;
alter table orders add column if not exists status text not null default 'pending_verification';
alter table orders add column if not exists download_token text;
alter table orders add column if not exists created_at timestamptz not null default now();
alter table orders add column if not exists verified_at timestamptz;

-- ---- client_logos: Logos strip.
create table if not exists client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  dark_image_url text,  -- optional variant for dark mode
  link_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table client_logos add column if not exists name text;
alter table client_logos add column if not exists image_url text;
alter table client_logos add column if not exists dark_image_url text;
alter table client_logos add column if not exists link_url text;
alter table client_logos add column if not exists order_index integer not null default 0;
alter table client_logos add column if not exists created_at timestamptz not null default now();

-- ---- activity_log: Admin dashboard activity feed (private).
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_label text,
  count integer not null default 1,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table activity_log add column if not exists action text;
alter table activity_log add column if not exists entity_type text;
alter table activity_log add column if not exists entity_label text;
alter table activity_log add column if not exists count integer not null default 1;
alter table activity_log add column if not exists created_at timestamptz not null default now();
create index if not exists activity_log_created_at_idx on activity_log (created_at desc);

-- ---- rate_limit_log: Rate-limit counters for public forms (private).
create table if not exists rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,  -- IP address
  action text not null,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table rate_limit_log add column if not exists identifier text;
alter table rate_limit_log add column if not exists action text;
alter table rate_limit_log add column if not exists created_at timestamptz not null default now();
create index if not exists rate_limit_log_lookup on rate_limit_log (identifier, action, created_at);

-- ---- login_attempts: Admin sign-in attempts, for the lockout (private).
create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,  -- IP address
  success boolean not null default false,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table login_attempts add column if not exists identifier text;
alter table login_attempts add column if not exists success boolean not null default false;
alter table login_attempts add column if not exists created_at timestamptz not null default now();
create index if not exists login_attempts_lookup on login_attempts (identifier, created_at);

-- ---- security_audit_log: Security events recorded by the server (private).
create table if not exists security_audit_log (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  ip text,
  user_agent text,
  detail jsonb,
  created_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table security_audit_log add column if not exists event text;
alter table security_audit_log add column if not exists ip text;
alter table security_audit_log add column if not exists user_agent text;
alter table security_audit_log add column if not exists detail jsonb;
alter table security_audit_log add column if not exists created_at timestamptz not null default now();
create index if not exists security_audit_log_created_at_idx on security_audit_log (created_at desc);

-- ---- admin_totp_used: 2FA codes already used, so a code can't be replayed (private).
create table if not exists admin_totp_used (
  step bigint primary key,
  used_at timestamptz not null default now()
);
-- if the table already existed, add anything it is missing (safe on tables that hold data):
alter table admin_totp_used add column if not exists used_at timestamptz not null default now();

-- ---- storage buckets used for image/file uploads (public, so images can be shown on the site)
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values
      ('blog-images', 'blog-images', true),
      ('resume-images', 'resume-images', true)
    on conflict (id) do update set public = true;
  end if;
end $$;

-- ---- Features (Oct 2026): playable builds, scheduled posts, accent colour, testimonial invites ----
alter table projects add column if not exists play_url text;          -- link to a playable WebGL build
alter table articles add column if not exists publish_at timestamptz; -- null = live as soon as published
alter table site_settings add column if not exists accent_color text; -- e.g. #b0233f; null = default

-- Server-only settings. Row-level security with NO public policies: only the server can read it.
create table if not exists private_settings (
  id integer primary key default 1,
  testimonial_invite_code text,
  updated_at timestamptz not null default now(),
  constraint private_settings_single_row check (id = 1)
);
insert into private_settings (id) values (1) on conflict (id) do nothing;

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

-- ---- Bundles (Oct 2026) -------------------------------------------------------
-- A product of type 'bundle' sells several digital products together; buyers get every file.
alter table products add column if not exists bundle_items uuid[];  -- product ids, in display order

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

-- ---- Card payments (Oct 2026) -----------------------------------------------------
-- A product sells by card when it has a Lemon Squeezy variant ID (and the keys are set).
alter table products add column if not exists ls_variant_id text;
alter table orders add column if not exists payment_provider text;   -- e.g. 'lemonsqueezy'
alter table orders add column if not exists provider_order_id text;  -- the provider's own order id

-- ---- Quizzes + invoice reminders (Oct 2026) ----------------------------------------
alter table articles add column if not exists quiz text;                          -- see lib/quiz.ts for the format
alter table invoices add column if not exists reminders_sent integer not null default 0;  -- 1 = before due, 2 = due, 3 = overdue

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

-- Refresh Supabase's column cache so new columns are visible to the site immediately.
notify pgrst, 'reload schema';
