-- Apply once before deploying work-linked testimonials. Existing reviews stay general.
begin;
alter table public.testimonials
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists design_id uuid references public.designs(id) on delete set null,
  add column if not exists client_id uuid references public.client_logos(id) on delete set null;
do $$
begin
  if not exists (select from pg_constraint where conrelid='public.testimonials'::regclass and conname='testimonials_one_work') then
    alter table public.testimonials add constraint testimonials_one_work check (num_nonnulls(project_id, design_id, client_id) <= 1);
  end if;
end $$;

-- Reuse the portfolio's UES client, keeping its ID, existing slug, artwork and custom copy.
do $$
declare
  client_uuid uuid;
  study text := $copy$## UMT Business Fest 2026
For UMT Business Fest 2026, I designed the event graphics for the UMT Entrepreneurial Society (UES). My work covered two places people would encounter the fest: on Instagram before and around the event, and in print at the venue.

## Designing for the venue
At the venue, I designed ID cards, flexes, banners and standees. Those formats pose different reading problems: an ID card is read up close, while a banner or standee has to communicate from several steps away. That difference in scale is a useful way to look at the print work in this collection.

## From grid to Story
For Instagram, I designed social posts, grid posts and Stories. A grid can be viewed as a whole or one square at a time; a Story has the width of a phone screen and only a moment to catch the eye. Together with the print pieces, these designs show how the same event takes shape across a venue and a feed.$copy$;
begin
  select id into client_uuid from public.client_logos
    where slug='ues' or lower(trim(name)) in ('ues','umt entrepreneurial society')
    order by (slug='ues') desc nulls last, created_at limit 1;
  if client_uuid is null then
    insert into public.client_logos(name,slug,image_url,dark_image_url,role,summary,show_on_design,order_index)
    values ('UMT Entrepreneurial Society','ues','/logos/umt-entrepreneurial-society-dark.png','/logos/umt-entrepreneurial-society-light.png','Graphic designer · UMT Business Fest 2026',study,true,2);
  else
    update public.client_logos set slug=coalesce(nullif(slug,''),'ues'),
      role=coalesce(nullif(role,''),'Graphic designer · UMT Business Fest 2026'),
      summary=case when nullif(trim(summary),'') is null then study
        when position(study in summary)>0 then summary
        else summary || E'\n\n' || study end,
      show_on_design=true where id=client_uuid;
  end if;
end $$;
commit;
