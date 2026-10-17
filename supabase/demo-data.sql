-- =====================================================================
-- DEMO CONTENT: sample articles, projects, designs, services, testimonials,
-- journey, roadmap, certifications, resume items, client logos and shop items,
-- so a brand-new site is not empty while you set it up.
--
--  * Safe to run more than once (it skips anything already there).
--  * Placeholder images live in /public/demo.
--  * To remove it all later, run supabase/demo-data-remove.sql. That deletes ONLY
--    these sample rows (matched by their fixed ids), never anything you added.
--  * Run it in the Supabase SQL editor AFTER setup.sql.
-- =====================================================================

update site_settings set now_text = coalesce(now_text, 'Setting up my new site') where id = 1;

insert into articles (id, title, slug, category, excerpt, content, feature_image, read_time, published, featured, created_at) values
  ('d0000001-0000-4000-8000-000000000001', 'Welcome to your new site', 'welcome-to-your-new-site', 'Getting Started', 'A quick tour of what you can do with this site, and where to change things.', '<h2>You are live</h2><p>This is a sample post. Everything you see here (the posts, projects, services and shop items) is <strong>demo content</strong> so the site is not empty while you set it up.</p><h2>What to do next</h2><ul><li>Open <strong>/admin</strong> and sign in.</li><li>Edit or delete these samples, then add your own.</li><li>Change your name, links and colours in <code>site.config.ts</code>.</li></ul><blockquote>When you are ready, run the "remove demo content" script and everything on this list disappears. Anything you wrote yourself stays.</blockquote>', '/demo/post-1.svg', '3 min read', true, true, now() - interval '2 days'),
  ('d0000001-0000-4000-8000-000000000002', 'How to write and publish a post', 'how-to-write-and-publish-a-post', 'Getting Started', 'Drafts, preview links, cover images and when your subscribers get emailed.', '<h2>Drafts first</h2><p>Untick <em>Published</em> to keep a post private. A draft gets a secret <strong>preview link</strong> you can share to get feedback.</p><h2>Publishing</h2><p>When you publish for the first time, subscribers are emailed automatically. Editing a published post later does <strong>not</strong> email anyone again.</p><pre><code>Tip: add a cover image. It is also used for the link preview on social media.</code></pre>', '/demo/post-2.svg', '4 min read', true, false, now() - interval '5 days'),
  ('d0000001-0000-4000-8000-000000000003', 'A draft that is not published yet', 'a-draft-that-is-not-published-yet', 'Getting Started', 'Visitors cannot see this. Only its preview link can.', '<p>This post is a draft, so it does not appear on the blog, in search, or in the sitemap.</p>', '/demo/post-1.svg', '1 min read', false, false, now() - interval '1 day')
on conflict do nothing;

insert into projects (id, title, slug, category, description, content, feature_image, tech_stack, status, live_url, github_url, problem, approach, outcome, stats, screenshots, featured, published, created_at) values
  ('d0000002-0000-4000-8000-000000000001', 'Sample project: Online store', 'sample-online-store', 'Web Apps', 'A fast storefront for a small business, built to be easy to update.', '<p>This is a sample project page. Replace it with your own work: a short description, what you built, and what happened.</p>', '/demo/project-1.svg', 'Next.js, Supabase, Tailwind', 'LIVE', 'https://example.com', 'https://github.com/your-name/sample', 'The owner was managing orders in a spreadsheet and losing sales to slow pages.', 'A lightweight storefront with a simple admin panel and automatic order emails.', 'Orders are handled in minutes instead of hours, and the site loads in under a second.', '3x | faster page loads
40% | fewer abandoned carts
0 | missed orders', array['/demo/project-2.svg', '/demo/project-3.svg']::text[], true, true, now() - interval '10 days'),
  ('d0000002-0000-4000-8000-000000000002', 'Sample project: Mobile app', 'sample-mobile-app', 'Mobile', 'A habit-tracking app with reminders and streaks.', '<p>Another sample. Use the <em>Problem / Approach / Outcome</em> fields for a case-study layout.</p>', '/demo/project-2.svg', 'React Native, Firebase', 'IN DEVELOPMENT', null, null, null, null, null, null, array[]::text[], false, true, now() - interval '20 days'),
  ('d0000002-0000-4000-8000-000000000003', 'Sample project: Brand identity', 'sample-brand-identity', 'Branding', 'Logo, colours and a small design system for a new coffee brand.', '<p>Projects can be design work too.</p>', '/demo/project-3.svg', 'Figma, Illustrator', 'COMPLETED', null, null, null, null, null, null, array[]::text[], false, true, now() - interval '30 days')
on conflict do nothing;

insert into designs (id, title, category, images, featured, published, created_at) values
  ('d0000003-0000-4000-8000-000000000001', 'Sample poster', 'Posters', array['/demo/design-1.svg']::text[], true, true, now() - interval '1 days'),
  ('d0000003-0000-4000-8000-000000000002', 'Sample social post', 'Social Media', array['/demo/design-2.svg']::text[], true, true, now() - interval '2 days'),
  ('d0000003-0000-4000-8000-000000000003', 'Sample banner', 'Branding', array['/demo/design-3.svg']::text[], false, true, now() - interval '3 days'),
  ('d0000003-0000-4000-8000-000000000004', 'Sample logo concept', 'Branding', array['/demo/design-4.svg']::text[], false, true, now() - interval '4 days')
on conflict do nothing;

insert into services (id, name, slug, tagline, description, includes, icon, starting_price, cover_image, order_index, active) values
  ('d0000004-0000-4000-8000-000000000001', 'Website design', 'website-design', 'A clean, fast site that fits your brand', 'A sample service. Describe what you offer, who it is for, and how you work.', 'Up to 5 pages
Mobile-friendly design
Basic SEO setup
One round of changes after launch', null, 'Starting at $300', '/demo/service-1.svg', 1, true),
  ('d0000004-0000-4000-8000-000000000002', 'Logo & branding', 'logo-and-branding', 'A memorable identity', 'A sample service WITHOUT pricing packages. It shows its bullet list and a single starting price instead.', '3 logo concepts
Colour palette
Brand guidelines (PDF)', null, 'Starting at $120', '/demo/service-2.svg', 2, true)
on conflict do nothing;

insert into service_packages (id, service_id, tier, price, delivery_days, revisions, features, order_index) values
  ('d0000005-0000-4000-8000-000000000001', 'd0000004-0000-4000-8000-000000000001', 'Basic', '$300', 7, '1 revision', '3 pages
Contact form', 1),
  ('d0000005-0000-4000-8000-000000000002', 'd0000004-0000-4000-8000-000000000001', 'Standard', '$600', 14, '3 revisions', '5 pages
Blog
Basic SEO', 2),
  ('d0000005-0000-4000-8000-000000000003', 'd0000004-0000-4000-8000-000000000001', 'Premium', '$1,200', 21, 'Unlimited', '10 pages
Shop
Analytics', 3)
on conflict do nothing;

insert into testimonials (id, name, role, quote, avatar_url, order_index, active) values
  ('d0000006-0000-4000-8000-000000000001', 'Alex Morgan', 'Founder, Sample Co.', 'Everything was delivered early and exactly how we pictured it. Communication was excellent.', '/demo/person-1.svg', 1, true),
  ('d0000006-0000-4000-8000-000000000002', 'Sam Rivera', 'Marketing Lead, Example Ltd.', 'A pleasure to work with: quick, thoughtful and detail-oriented.', '/demo/person-2.svg', 2, true),
  ('d0000006-0000-4000-8000-000000000003', 'Jordan Lee', 'Product Manager', 'The new site doubled our enquiries in the first month.', '/demo/person-3.svg', 3, true)
on conflict do nothing;

insert into journey_entries (id, date_label, title, body, image_url, order_index) values
  ('d0000007-0000-4000-8000-000000000001', '2020', 'Where it started', 'A sample timeline entry. Tell your story in short paragraphs.

Separate paragraphs with a blank line.', '/demo/journey-1.svg', 1),
  ('d0000007-0000-4000-8000-000000000002', '2022', 'A turning point', 'Another sample entry, with a photo.', '/demo/journey-2.svg', 2),
  ('d0000007-0000-4000-8000-000000000003', 'Today', 'Building this site', 'Replace these entries from Admin → My Journey.', null, 3)
on conflict do nothing;

insert into roadmap_items (id, title, description, status, order_index) values
  ('d0000008-0000-4000-8000-000000000001', 'Launch the new site', 'Sample roadmap item that is already done.', 'shipped', 1),
  ('d0000008-0000-4000-8000-000000000002', 'Add a newsletter', 'Sample item in progress.', 'in_progress', 2),
  ('d0000008-0000-4000-8000-000000000003', 'Open the shop', 'Sample item that is planned.', 'planned', 3)
on conflict do nothing;

insert into certifications (id, title, issuer, date, order_index) values
  ('d0000009-0000-4000-8000-000000000001', 'Sample certificate one', 'Example Academy', 'Jan 2025', 1),
  ('d0000009-0000-4000-8000-000000000002', 'Sample certificate two', 'Sample Institute', 'Jun 2025', 2),
  ('d0000009-0000-4000-8000-000000000003', 'Sample certificate three', 'Demo University', 'Dec 2025', 3)
on conflict do nothing;

insert into experiences (id, period, role, company, description, order_index) values
  ('d0000010-0000-4000-8000-000000000001', '2025 – Present', 'Sample Role', 'Example Company', 'What you did there, in a sentence or two.', 1),
  ('d0000010-0000-4000-8000-000000000002', '2023 – 2025', 'Another Sample Role', 'Demo Studio', 'Another short description.', 2)
on conflict do nothing;

insert into education (id, degree, institution, period, description, order_index) values
  ('d0000011-0000-4000-8000-000000000001', 'Sample degree', 'Example University', '2021 – 2025', 'Optional details.', 1)
on conflict do nothing;

insert into projects_resume (id, title, tech, description, order_index) values
  ('d0000012-0000-4000-8000-000000000001', 'Sample resume project', 'Node.js • React', 'A one-line summary.', 1),
  ('d0000012-0000-4000-8000-000000000002', 'Another sample project', 'Python • SQL', 'Another one-line summary.', 2)
on conflict do nothing;

insert into client_logos (id, name, image_url, dark_image_url, link_url, order_index) values
  ('d0000013-0000-4000-8000-000000000001', 'Halden', '/demo/logo-1.svg', '/demo/logo-1-dark.svg', null, 1),
  ('d0000013-0000-4000-8000-000000000002', 'Northfield', '/demo/logo-2.svg', '/demo/logo-2-dark.svg', null, 2),
  ('d0000013-0000-4000-8000-000000000003', 'Pinecrest', '/demo/logo-3.svg', '/demo/logo-3-dark.svg', null, 3)
on conflict do nothing;

insert into products (id, name, slug, type, category, description, price, compare_at_price, images, stock_quantity, active, featured, order_index) values
  ('d0000014-0000-4000-8000-000000000001', 'Sample template pack', 'sample-template-pack', 'digital', 'Templates', 'A sample digital product. Buyers get a download link after you verify their payment.', 7, 12, array['/demo/product-1.svg']::text[], null, true, true, 1),
  ('d0000014-0000-4000-8000-000000000002', 'Sample poster', 'sample-poster', 'physical', 'Prints', 'A sample physical product with limited stock.', 20, null, array['/demo/product-2.svg']::text[], 10, true, false, 2)
on conflict do nothing;
