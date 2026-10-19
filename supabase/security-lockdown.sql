-- =====================================================================
-- SECURITY LOCKDOWN — run ONLY after the new code is deployed and the
-- admin panel has been verified working (see SECURITY-DEPLOY.md).
--
-- Before this: the public anon key (visible to anyone in your site's
-- JavaScript) could write to your database directly, bypassing your
-- login entirely.
-- After this:  anon can only READ the content that's meant to be public.
-- Every write goes through your API routes, which check your login
-- session and use the server-only service-role key (which bypasses RLS).
--
-- Safe to re-run. Tables that don't exist yet are skipped.
-- =====================================================================

-- 0. Columns the public-read policies depend on --------------------------
do $$
begin
  if to_regclass('public.projects') is not null then
    execute 'alter table public.projects add column if not exists published boolean not null default true';
  end if;
  if to_regclass('public.designs') is not null then
    execute 'alter table public.designs add column if not exists published boolean not null default true';
  end if;
end $$;

-- 1. Drop EVERY existing policy on these tables ---------------------------
-- (their names/contents are unknown — some may be "allow all" policies
-- that are exactly what we're removing)
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in (
      'articles','projects','designs','services','service_packages','testimonials',
      'products','journey_entries','certifications','experiences','education',
      'projects_resume','roadmap_items','client_logos','site_settings',
      'messages','newsletter_subscribers','orders','rate_limit_log',
      'login_attempts','activity_log','security_audit_log','admin_totp_used','private_settings','discount_codes'
    )
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 2. Row Level Security ON for every table --------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'articles','projects','designs','services','service_packages','testimonials',
    'products','journey_entries','certifications','experiences','education',
    'projects_resume','roadmap_items','client_logos','site_settings',
    'messages','newsletter_subscribers','orders','rate_limit_log',
    'login_attempts','activity_log','security_audit_log','admin_totp_used','private_settings','discount_codes'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- 3. No anonymous / logged-in-via-Supabase writes anywhere ----------------
-- (belt and braces: RLS already denies these without a policy, but
-- revoking the privilege means a future mistaken policy can't re-open it)
do $$
declare t text;
begin
  foreach t in array array[
    'articles','projects','designs','services','service_packages','testimonials',
    'products','journey_entries','certifications','experiences','education',
    'projects_resume','roadmap_items','client_logos','site_settings'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from anon, authenticated', t);
      execute format('grant select on public.%I to anon, authenticated', t);
    end if;
  end loop;

  -- Private tables: no access at all for anon/authenticated. Only the
  -- service-role key (server-side API routes) can touch these.
  foreach t in array array[
    'messages','newsletter_subscribers','orders','rate_limit_log',
    'login_attempts','activity_log','security_audit_log','admin_totp_used','private_settings','discount_codes'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all on public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;

-- 4. Public READ policies — only what the public site actually shows ------
do $$
declare v record;
begin
  for v in select * from (values
    ('articles',         'published = true and (publish_at is null or publish_at <= now())'),  -- scheduled posts stay hidden until their time
    ('projects',         'published = true'),
    ('designs',          'published = true'),
    ('services',         'active = true'),
    ('service_packages', 'exists (select 1 from public.services s where s.id = service_packages.service_id)'),
    ('testimonials',     'active = true'),
    ('products',         'active = true'),
    ('journey_entries',  'true'),
    ('certifications',   'true'),
    ('experiences',      'true'),
    ('education',        'true'),
    ('projects_resume',  'true'),
    ('roadmap_items',    'true'),
    ('client_logos',     'true'),
    ('site_settings',    'true')
  ) as x(tbl, cond)
  loop
    if to_regclass('public.' || v.tbl) is not null then
      execute format(
        'create policy "public read" on public.%I for select to anon, authenticated using (%s)',
        v.tbl, v.cond
      );
    end if;
  end loop;
end $$;

-- 5. Hide the paid download link from the public ---------------------------
-- products is publicly readable (it's your shop catalog), but
-- digital_file_url is the actual paid file. Column-level privileges let
-- everyone read the catalog columns while that one column stays private;
-- buyers get it only through /api/orders/download after a verified payment.
do $$
declare cols text;
begin
  if to_regclass('public.products') is not null then
    select string_agg(quote_ident(column_name), ', ') into cols
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name <> 'digital_file_url';
    execute 'revoke select on public.products from anon, authenticated';
    execute format('grant select (%s) on public.products to anon, authenticated', cols);
  end if;
end $$;
-- NOTE: if you later add a column to products that the public shop should
-- show, re-run this file (or: grant select (new_column) on products to anon).

-- 6. Storage: no anonymous uploads / overwrites / deletes -------------------
-- Admin uploads now go through short-lived signed URLs minted by
-- /api/admin/upload-url (login + file-type + size checked there). Public
-- viewing of already-uploaded images is unaffected (public buckets serve
-- files without policies).
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and cmd in ('INSERT','UPDATE','DELETE','ALL')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Hard cap enforced by Storage itself, independent of the app (250 MB).
update storage.buckets set file_size_limit = 262144000
where id in ('blog-images', 'resume-images');

-- OPTIONAL hardening (uncomment if you want it): make any table you create
-- in future private-by-default, so a new table is never accidentally public
-- until you grant it on purpose.
-- alter default privileges in schema public revoke all on tables from anon, authenticated;
