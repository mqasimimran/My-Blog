begin;
create table if not exists public.design_campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.client_logos(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  summary text not null default '',
  role text,
  share_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, client_id)
);
alter table public.design_campaigns enable row level security;
revoke all on public.design_campaigns from anon, authenticated;
grant select on public.design_campaigns to anon, authenticated;
grant all on public.design_campaigns to service_role;
drop policy if exists campaign_public_read on public.design_campaigns;
create policy campaign_public_read on public.design_campaigns for select to anon, authenticated
  using (published and exists (select 1 from public.client_logos c where c.id=client_id and c.show_on_design));

alter table public.designs add column if not exists campaign_id uuid references public.design_campaigns(id) on delete set null;
alter table public.designs add column if not exists needs text[] not null default '{}';
alter table public.client_logos add column if not exists share_image_url text;
grant select (campaign_id, needs) on public.designs to anon, authenticated;
create index if not exists designs_campaign_idx on public.designs(campaign_id);
create index if not exists design_campaigns_client_idx on public.design_campaigns(client_id);

-- Enforce the association on every write, including the existing generic admin endpoint.
create or replace function public.check_design_campaign() returns trigger
language plpgsql set search_path=public as $$
begin
  if TG_OP='UPDATE' and new.client_id is distinct from old.client_id
     and new.campaign_id is not distinct from old.campaign_id then
    new.campaign_id := null;
  end if;
  if new.campaign_id is not null and new.client_id is null then
    raise exception 'Choose a client for this campaign';
  end if;
  return new;
end $$;
drop trigger if exists design_campaign_guard on public.designs;
create trigger design_campaign_guard before insert or update on public.designs
  for each row execute function public.check_design_campaign();
do $$ begin
  if not exists(select 1 from pg_constraint where conname='design_campaign_client_match' and conrelid='public.designs'::regclass) then
    alter table public.designs add constraint design_campaign_client_match
      foreign key(campaign_id,client_id) references public.design_campaigns(id,client_id);
  end if;
end $$;

-- Create the requested campaign as a draft. The owner chooses which designs belong to it.
insert into public.design_campaigns(client_id,title,role,summary)
select id, 'UMT Business Fest 2026', 'Graphic designer',
'For UMT Business Fest 2026, I designed event graphics for the UMT Entrepreneurial Society.

The print work included ID cards, flexes, banners and standees. These pieces brought the event into the venue, from identification worn by participants to larger displays.

The digital work included social media posts, Instagram grid posts and Stories. This collection brings the print and digital pieces together as one event portfolio.'
from public.client_logos c
where (c.slug='ues' or lower(trim(c.name)) in ('ues','umt entrepreneurial society'))
and not exists(select 1 from public.design_campaigns d where d.client_id=c.id and d.title='UMT Business Fest 2026');
notify pgrst, 'reload schema';
commit;
