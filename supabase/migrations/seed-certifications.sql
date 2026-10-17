-- Run once in the Supabase SQL editor. image_url and verify_url are left
-- NULL — attach the actual certificate screenshot and, where one exists,
-- a public verification link via /admin/resume/certifications afterward.
insert into certifications (title, issuer, date, order_index) values
  ('Introduction to Game Design', 'Epic Games', 'Dec 2025', 1),
  ('Unity Game Development', 'Frag Games', 'Dec 2025', 2),
  ('AI For Everyone', 'DeepLearning.AI (Coursera)', 'Aug 2025', 3),
  ('QuickStart: From Algorithm Design to Working Prototype', 'Higher Education Commission, Pakistan', 'Aug 2025', 4),
  ('IoT for Everyone', 'Higher Education Commission, Pakistan', 'Jul 2025', 5),
  ('Introduction to Web Development', 'UC Davis (Coursera)', 'Jul 2025', 6),
  ('JavaScript Bootcamp', 'LetsUpgrade', 'May 2025', 7),
  ('DSA with Java Bootcamp', 'LetsUpgrade', 'May 2025', 8),
  ('Excel Bootcamp', 'LetsUpgrade', 'May 2025', 9),
  ('Microsoft Office Specialist: PowerPoint Associate', 'Microsoft', 'Jan 2023', 10),
  ('Microsoft Office Specialist: Word Associate', 'Microsoft', 'Dec 2022', 11),
  ('Graphic Designing', 'Peak Solutions', 'Jan 2022', 12);
