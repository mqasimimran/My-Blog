-- Gives designs and projects the same draft/published + shareable-preview-
-- link capability articles already have. Existing rows default to
-- published=true so nothing currently live disappears.
alter table designs
  add column if not exists published boolean not null default true,
  add column if not exists preview_token text not null default gen_random_uuid()::text;

alter table projects
  add column if not exists published boolean not null default true,
  add column if not exists preview_token text not null default gen_random_uuid()::text;
