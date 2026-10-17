-- =====================================================================
-- EMERGENCY ROLLBACK — puts the database back to its old, open state
-- (RLS off, anon can read/write everything). Use only if the lockdown
-- breaks something you can't fix quickly, then tell me what broke.
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'articles','projects','designs','services','service_packages','testimonials',
    'products','journey_entries','certifications','experiences','education',
    'projects_resume','roadmap_items','client_logos','site_settings',
    'messages','newsletter_subscribers','orders','rate_limit_log',
    'login_attempts','activity_log','security_audit_log','admin_totp_used'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I disable row level security', t);
      execute format('grant all on public.%I to anon, authenticated', t);
    end if;
  end loop;
end $$;
