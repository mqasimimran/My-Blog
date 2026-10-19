# New features (batch 1)

## Install (in this order)
1. Copy everything in this folder over your project (same paths).
2. In Supabase -> SQL editor, run **supabase/setup.sql** once. It only ADDS what's missing (new columns,
   a private settings table, the scheduled-posts rule) and never changes or deletes your data.
3. Delete the `.next` folder, then `npm run dev`.
4. Optional check: `node scripts/setup.mjs` should show all green.

## What's new
- **Playable games.** Admin -> Projects -> edit -> "Playable build URL". The project page shows a
  "Play in your browser" poster; the game loads only when clicked, with a Full screen button.
  Where to host a Unity WebGL build:
  - itch.io (easiest): upload the build as an HTML game, then use its embed link.
  - Or in this project: put the build folder in `public/games/<name>/` and use `/games/<name>/index.html`.
    In Unity -> Player Settings -> Publishing Settings, set Compression Format to **Disabled**
    (or keep Gzip and tick **Decompression Fallback**), or the browser can't open it.
- **Latest videos** on the homepage. Put your YouTube channel ID (starts with "UC") in
  `site.config.ts` -> `videos.youtubeChannelId`. Empty = section hidden. Refreshes every hour.
- **Order status page** at `/shop/order`. Buyers enter their order number + checkout email.
  The checkout thank-you screen now shows the order number and a "Track your order" link.
- **Testimonial request link.** Admin -> Testimonials -> "Create a link", send it to a client.
  Submissions arrive hidden; press Show to publish. "New link" retires the old one.
- **Scheduled posts.** In the article editor, set "Publish at". The post stays hidden from
  everyone (enforced by the database) until then. Scheduled posts are NOT emailed to subscribers.
- **Live accent colour.** Admin -> Site settings -> Accent colour. Previews live in the admin; the site
  updates within a minute of saving. "Reset to default" goes back to the colour in site.config.ts.
- **Backup download.** Visit `/api/admin/export` while logged in to download everything as JSON.
