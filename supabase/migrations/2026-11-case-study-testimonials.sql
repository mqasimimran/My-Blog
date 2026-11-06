-- Run after 2026-11-design-campaigns.sql.
begin;
alter table public.testimonials
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists design_id uuid references public.designs(id) on delete set null,
  add column if not exists client_id uuid references public.client_logos(id) on delete set null;
alter table public.testimonials add column if not exists campaign_id uuid
  references public.design_campaigns(id) on delete set null;
alter table public.testimonials drop constraint if exists testimonials_one_work;
alter table public.testimonials add constraint testimonials_one_work
  check (num_nonnulls(project_id,design_id,client_id,campaign_id) <= 1);
create index if not exists testimonials_client_active_idx on public.testimonials(client_id) where active;
create index if not exists testimonials_design_active_idx on public.testimonials(design_id) where active;
create index if not exists testimonials_campaign_active_idx on public.testimonials(campaign_id) where active;

-- Update the earlier generated copy. Keep independently edited case-study text.
update public.client_logos
set summary = $study$## Design work for UMT Entrepreneurial Society
My work for the UMT Entrepreneurial Society (UES) includes the event graphics for UMT Business Fest 2026. The project brought together printed material for the venue and digital designs for Instagram.

## One event across many formats
I designed ID cards, flexes, banners and standees alongside social media posts, Instagram grid posts and Stories. The collection includes registration announcements and material for Students Expo and CEO Talks.

## Reading the work
An ID card has to work at close range. A standee or banner needs to communicate from farther away. A grid post can be encountered as one image or as part of a larger composition, while a Story is viewed vertically on a phone. These differences in scale and placement provide the context for the designs below.

## Explore the collection
The Business Fest campaign brings the event pieces together in one case study. Open an individual design to view its complete artwork, or save examples to a project brief if you are planning a similar event.$study$
where (lower(trim(name)) in ('ues','umt entrepreneurial society') or slug='ues')
  and (nullif(trim(summary),'') is null or summary like '## UMT Business Fest 2026%');

update public.design_campaigns
set summary = $study$## UMT Business Fest 2026
I created print and digital graphics for UMT Business Fest 2026 with the UMT Entrepreneurial Society. The scope covered the materials people would encounter while discovering the event online and attending it on campus.

## The design challenge
The collection had to work across very different sizes and placements. Registration information on a phone, an ID card worn at the venue, and a large event display each ask the viewer to read in a different way. This case study brings those formats together so they can be viewed in context.

## Print and venue graphics
My deliverables included ID cards, flexes, banners and standees. The posters shown in this portfolio combine event information, typography, architectural imagery and registration details. They include material for Students Expo and CEO Talks, alongside broader event and registration announcements.

## Instagram and social media
I also designed social media posts, Instagram grid posts and Stories. The grid work uses connected compositions across several posts, while other pieces present a single announcement. The gallery preserves the full artwork so the complete layout can be explored.

## Project scope
This collection documents my graphic design contribution across the event's print and social formats. The artwork below shows the deliverables, and approved testimonials record the experiences of the people I worked with.$study$
where title='UMT Business Fest 2026'
  and client_id in (select id from public.client_logos where lower(trim(name)) in ('ues','umt entrepreneurial society') or slug='ues')
  and (nullif(trim(summary),'') is null or summary like 'For UMT Business Fest 2026, I designed event graphics for the UMT Entrepreneurial Society.%');
notify pgrst, 'reload schema';
commit;
