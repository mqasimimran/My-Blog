alter table public.client_logos add column if not exists social_links text[] not null default '{}';
notify pgrst, 'reload schema';
