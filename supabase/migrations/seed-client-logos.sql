-- Run once in the Supabase SQL editor, after client-logos.sql.
-- Migrates the two logos that were previously hardcoded, plus the 5 new ones.
-- image_url paths point at /public/logos/ files already in the repo; you can
-- freely replace any row's image via /admin/logos going forward.
insert into client_logos (name, image_url, dark_image_url, order_index) values
  ('TEDxUMT', '/logos/tedx-umt-black.png', '/logos/tedx-umt-white.png', 1),
  ('UMT Entrepreneurial Society', '/logos/umt-entrepreneurial-society-dark.png', '/logos/umt-entrepreneurial-society-light.png', 2),
  ('Valion OS', '/logos/valionos.png', null, 3),
  ('Invonexus', '/logos/invonexus.png', null, 4),
  ('Interaction Design Foundation Pakistan', '/logos/ixdf.png', null, 5),
  ('UMT Happiness Club', '/logos/umt-happiness-club.png', null, 6),
  ('Digiternative', '/logos/digiternative.jpeg', null, 7);
