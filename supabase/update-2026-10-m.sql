-- ============================================================================
-- Site update M, October 2026: client pages on the design page, and service options.
-- HOW TO RUN: Supabase -> SQL Editor -> New query (an EMPTY editor). Paste this whole file.
-- Make sure NO text is highlighted, then click Run. Safe to run more than once. (Run B to L first.)
-- ============================================================================
begin;

-- ---- Client pages + service options (Oct 2026) --------------------------------------
-- Clients (from Client Logos) get their own page on the design page: /design/clients/<slug>.
alter table client_logos add column if not exists slug text unique;
alter table client_logos add column if not exists role text;               -- e.g. Lead Graphic Designer
alter table client_logos add column if not exists period text;             -- e.g. 2024 to present
alter table client_logos add column if not exists summary text;            -- the case study
alter table client_logos add column if not exists testimonial_quote text;
alter table client_logos add column if not exists testimonial_author text;
alter table client_logos add column if not exists show_on_design boolean not null default true;
alter table designs add column if not exists client_id uuid references client_logos(id) on delete set null;
-- Services: options customers pick for a live price estimate (see lib/serviceOptions.ts).
alter table services add column if not exists options jsonb not null default '[]'::jsonb;
-- Package requests carry the chosen items, so a proposal can be filled in from them.
alter table messages add column if not exists request_items jsonb;

commit;

notify pgrst, 'reload schema';
